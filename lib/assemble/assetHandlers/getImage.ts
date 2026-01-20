import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import logger from '~/lib/logger';
import parseJSON from '~/lib/parseJSON';
import SimplePath from '../misc/simplePath';
import type { FileContext } from '../rawResourceCollection/context';
import { getCropCoordinates } from './getCropCoordinates';
import { getFramesPathFromFS } from './getFrame';

const getImage = (
    ctx: FileContext,
    fpath: string,
    imgRef: string,
    newName?: string,
) => {
    logger.info(`Getting image ${imgRef} at ${fpath}`);
    const filePath = new SimplePath(fpath);
    // File location relative to root
    const frelloc = filePath.relloc(ctx.currentRoot);
    const { irelloc, key, processingDirectives } = splitIrelloc(imgRef);
    if (processingDirectives.length > 0) {
        logger.warn(
            `Found processing directives: ${processingDirectives.join(', ')}. Ignoring asset.`,
        );
        return;
    }

    let resolvedImageAbsPath = getImagePath(
        getAbsImagePath(ctx.currentRoot, frelloc, irelloc),
    );
    let imagePath = new SimplePath(
        path.relative(ctx.currentRoot, resolvedImageAbsPath || ''),
    );

    // Look in previous roots
    if (!resolvedImageAbsPath) {
        logger.debug(`Image path not found: ${irelloc}, ${frelloc}`);
        const previousRoots = ctx.inputPaths.slice(
            0,
            ctx.inputPaths.indexOf(ctx.currentRoot) + 1,
        );
        previousRoots.reverse();
        for (const rootPath of previousRoots) {
            resolvedImageAbsPath = getImagePath(
                getAbsImagePath(rootPath, frelloc, irelloc),
            );
            if (resolvedImageAbsPath) {
                logger.debug(
                    `Found alternative image: ${resolvedImageAbsPath}`,
                );
                imagePath = new SimplePath(
                    path.relative(rootPath, resolvedImageAbsPath),
                );
                return;
            }
        }
        if (!resolvedImageAbsPath) {
            logger.error(`Image path not found anywhere`);
            return;
        }
    }

    // relative to root, w/o slash
    logger.debug(`Image relloc: ${imagePath.path}`);

    const outputPath = path.join(
        ctx.unfilteredImagesPath,
        newName ? `${newName}.${imagePath.ext}` : path.basename(irelloc),
    );

    if (key) {
        let framesPath = new SimplePath(imagePath.path);

        let framesObj: any;

        logger.debug('Searching .frames in filesystem');
        logger.debug(`Name: ${filePath.name}, Image name: ${imagePath.name}`);
        try {
            framesPath = new SimplePath(
                getFramesPathFromFS(imagePath.path, ctx.currentRoot) || '',
            );
            if (framesPath.path === '') {
                throw new Error(`Can't find default.frames in filesystem`);
            }
            logger.debug(
                `Found .frames, path: ${path.relative(ctx.currentRoot, framesPath.path)}`,
            );
            ctx.setFrames(
                path.relative(ctx.currentRoot, framesPath.path),
                parseJSON(framesPath.path),
            );
        } catch (e) {
            if (e instanceof Error) {
                logger.warn(e.message);
            } else {
                logger.warn(String(e));
            }
        }

        logger.debug(`Searching .frames in object`);
        framesObj = ctx.getFrames(imagePath.dir);
        if (!framesObj) {
            logger.debug(
                `Frames not assembled for ${filePath.name} at ${framesPath.path}`,
            );
            return;
        } else {
            logger.debug(`Found frames in object`);
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

// Process starboung asset reference
// irelloc - starts with either `/` - location relative to root of assets/mod,
// or filename - location relative to .item, .object etc. file itself
// key - argument passed to .frames to get crop coordinates
// processingDirectives - `flipx`, `scale=0.5` etc. - ignoring for now
export function splitIrelloc(ref: string) {
    const [splitInst, ...processingDirectives] = ref.split('?');
    const [irelloc, key] = splitInst.split(':');
    return { irelloc, key, processingDirectives };
}

// Resolve inventoryIcon prop of item/object
export const getAbsImagePath = (
    rootPath: string,
    fpath: string,
    iname: string,
) =>
    iname.startsWith('/')
        ? path.join(rootPath, iname)
        : path.join(rootPath, path.dirname(fpath), iname);

// Wrapper for resolveCaseInsensitive with logging,
// where we optimistically pick first located match
function getImagePath(absFilePath: string): string | null {
    const matches = resolveCaseInsensitive(absFilePath);
    if (matches.length === 0) {
        logger.debug(`Image path not resolved: ${absFilePath}`);
        return null;
    } else if (matches.length > 1) {
        // Doesn't happen with Starbound+FU, here for a sanity check
        logger.debug('Several image path matches resolved:');
        for (const match of matches) logger.debug(match);
        logger.debug('Picking the first');
    }
    return matches[0];
}

// Get real matches on filesystem for a given case-insensitive path
export function resolveCaseInsensitive(absFilePath: string): string[] {
    if (fs.existsSync(absFilePath)) {
        logger.debug(`File exists: ${absFilePath}`);
        return [absFilePath];
    }
    const parsedPath = path.parse(absFilePath);
    const splitPath = path
        .relative(parsedPath.root, absFilePath)
        .split(path.sep);
    const output: string[] = [];
    populatePaths(
        absFilePath.toLowerCase(),
        parsedPath.root,
        splitPath,
        output,
    );
    return output;
}

// Helper function that walks a graph for resolveCaseInsensitive()
function populatePaths(
    absFilePath: string,
    rootPath: string,
    segments: string[],
    outputs: string[],
) {
    const [currentSegment, ...remainingSegments] = segments;
    const currentSegmentLower = currentSegment.toLowerCase();
    const files = fs
        .readdirSync(rootPath)
        .filter((file) => file.toLowerCase() === currentSegmentLower);
    for (const file of files) {
        const localFilePath = path.join(rootPath, file);
        if (localFilePath.toLowerCase() === absFilePath) {
            outputs.push(localFilePath);
        } else {
            populatePaths(
                absFilePath,
                localFilePath,
                remainingSegments,
                outputs,
            );
        }
    }
}
