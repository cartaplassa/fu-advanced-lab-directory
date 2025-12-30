import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import logger from '~/lib/logger';
import parseJSON from '~/lib/parseJSON';
import SimplePath from '../misc/simplePath';
import type { FileContext } from '../rawResourceCollection/context';
import { getCropCoordinates } from './getCropCoordinates';
import { getFramesFromPath } from './getFrame';

export function resolveCaseInsensitive(
    rootPath: string,
    filePath: string,
): string | null {
    console.log('resolveCaseInsensitive', rootPath, filePath);
    const absPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(rootPath, filePath);
    if (fs.existsSync(absPath)) return absPath;
    const dir = path.dirname(absPath);
    if (dir === absPath) return null;
    const resolvedDir = resolveCaseInsensitive(rootPath, dir);
    if (resolvedDir === null) return null;
    const baseName = path.basename(absPath).toLowerCase();

    try {
        const match = fs
            .readdirSync(resolvedDir)
            .find((file) => file.toLowerCase() === baseName);

        return match ? path.join(resolvedDir, match) : null;
    } catch {
        return null;
    }
}

export const getAbsImagePath = (
    rootPath: string,
    fpath: string,
    iname: string,
) =>
    iname.startsWith('/')
        ? path.join(rootPath, iname)
        : path.join(path.dirname(fpath), iname);

// const removeExtension = (fbase: string) => {
//     const temp = fbase.split('.');
//     if (temp.length === 1) return fbase;
//     return temp.slice(0, -1).join('.');
// };

const getImage = (
    ctx: FileContext,
    fpath: string,
    unfilteredImageName: string,
    newName?: string,
) => {
    logger.info(`Getting image ${unfilteredImageName} at ${fpath}`);
    const filePath = new SimplePath(fpath);
    const [irelloc, key] = unfilteredImageName.split(':');

    const resolvedImageAbsPath = resolveCaseInsensitive(
        path.dirname(fpath),
        getAbsImagePath(ctx.currentRoot, fpath, irelloc),
    );
    if (!resolvedImageAbsPath) {
        throw new Error(`Image path not found: ${irelloc}`);
    }

    const imagePath = new SimplePath(
        path.relative(ctx.currentRoot, resolvedImageAbsPath),
    );
    logger.debug(`Image path: ${imagePath.path}`);

    const outputPath = path.join(
        ctx.unfilteredImagesPath,
        newName ? `${newName}.${imagePath.ext}` : path.basename(irelloc),
    );

    if (key) {
        let framesPath = new SimplePath(imagePath.path);
        logger.debug(
            `Frames path: ${framesPath.path}, root: ${ctx.currentRoot}`,
        );

        // biome-ignore lint/suspicious/noExplicitAny: <Because of reasons>
        let framesObj: any;
        try {
            logger.debug(
                `Name: ${filePath.name}, Image name: ${imagePath.name}`,
            );
            framesPath = new SimplePath(
                getFramesFromPath(
                    imagePath.path,
                    filePath.name,
                    imagePath.name,
                    ctx.currentRoot,
                ) || '',
            );

            if (framesPath.path === '' || framesPath.path === undefined)
                throw new Error('getFramesFromPath(): .frames not found');
            logger.debug(`Current root: ${ctx.currentRoot}`);
            logger.debug(
                `Found .frames, path: ${path.relative(ctx.currentRoot, framesPath.path)}`,
            );
            ctx.setFrames(
                path.relative(ctx.currentRoot, framesPath.path),
                parseJSON(framesPath.path),
            );
            framesObj = parseJSON(framesPath.path);
        } catch (_e) {
            logger.debug(
                `Can't find default.frames for ${imagePath.path}, looking in object`,
            );
            framesObj = ctx.getFrames(imagePath.dir, imagePath.name);
            if (!framesObj) {
                logger.debug(
                    `Frames not assembled for ${filePath.name} at ${framesPath.path}`,
                );
                return;
            } else {
                logger.debug(`Found frames in object`);
            }
        }

        const coordinates = getCropCoordinates(key, framesObj);
        if (!coordinates) {
            logger.error(
                `Failed getting coordinates of key ${key} at ${framesPath.path}`,
            );
            return;
        }
        sharp(path.join(ctx.currentRoot, imagePath.path))
            .extract(coordinates)
            .toFile(outputPath);
    } else
        fs.copyFile(
            path.join(ctx.currentRoot, imagePath.path),
            outputPath,
            (e) => {
                if (e)
                    logger.error(
                        `Failed copying ${imagePath.path} to ${outputPath}`,
                    );
            },
        );
};

export default getImage;
