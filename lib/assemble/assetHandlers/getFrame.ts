import fs from 'node:fs';
import path from 'node:path';
import { deepGet, ensurePathArray } from '~/lib/assemble/misc/deepObjectAccess';
import logger from '~/lib/logger';

// FIXME - order of lookup is wrong.
// `./iconName.frames`, `./default.frames`, `../default.frames` etc.
// 1) Go through fs, if found - populate object
// 2) Look up inside the object to fing the correct .frames

export const getFramesFromPath = (
    relfpath: string,
    fname: string,
    iname: string,
    rootPath = '/',
): string | undefined => {
    const currentDirectory = path.dirname(path.resolve(rootPath, relfpath));
    if (!fs.existsSync(currentDirectory)) {
        const msg = `Directory not found: ${currentDirectory}`;
        logger.error(msg);
        throw new Error(msg);
    }
    const rootDirectory = path.resolve(rootPath);

    const files = fs.readdirSync(currentDirectory, {
        withFileTypes: true,
    });
    logger.debug(`Searching .frames in ${currentDirectory}`);
    for (const file of files) {
        if (
            file.name === `${fname}.frames` ||
            file.name === `${iname}.frames`
        ) {
            const output = path.join(currentDirectory, file.name);
            logger.debug(`getFramePath(): .frames path: ${output}`);
            return output;
        }
    }
    for (const file of files) {
        if (file.name === 'default.frames') {
            const output = path.join(currentDirectory, file.name);
            logger.debug(`getFramePath(): .frames path: ${output}`);
            return output;
        }
    }
    if (currentDirectory === rootDirectory || currentDirectory === '/')
        return undefined;
    return getFramesFromPath(currentDirectory, fname, iname, rootPath);
};

export const getFramesFromObject = (
    // biome-ignore lint/suspicious/noExplicitAny: <Because of reasons>
    framesAccumulator: any,
    relPath: string | string[],
    fname: string,
    isDebugMode?: boolean,
    // biome-ignore lint/suspicious/noExplicitAny: <Because of reasons>
): any => {
    const kpath = ensurePathArray(relPath);
    logger.debug(`getFramesFromObject(): ${kpath}`);
    for (let i = kpath.length; i >= 0; i--) {
        const tempPath = kpath.slice(0, i);

        logger.debug(
            `Searching frames in obj: ${[...tempPath, `${fname}.frames`].join(path.sep)}`,
        );
        let output = deepGet(framesAccumulator, [
            ...tempPath,
            `${fname}.frames`,
        ]);
        if (output)
            return isDebugMode
                ? [...tempPath, `${fname}.frames`].join(path.sep)
                : output;
        logger.debug(
            `Searching frames in obj: ${[...tempPath, `default.frames`].join(path.sep)}`,
        );
        output = deepGet(framesAccumulator, [...tempPath, `default.frames`]);
        if (output)
            return isDebugMode
                ? [...tempPath, `default.frames`].join(path.sep)
                : output;
    }
    return undefined;
};
