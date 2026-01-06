import fs from 'node:fs';
import path from 'node:path';
import { deepGet } from '~/lib/assemble/misc/deepObjectAccess';
import logger from '~/lib/logger';
import SimplePath from '../misc/simplePath';
import type { Frame } from '../rawResourceCollection/frame';

export const getFramesPathFromFS = (
    relImgPath: string,
    rootPath = '/',
): string | undefined => {
    const absImgPath = new SimplePath(path.resolve(rootPath, relImgPath));

    const siblingPath = path.resolve(
        absImgPath.dir,
        `${absImgPath.name}.frames`,
    );
    if (fs.existsSync(siblingPath)) return siblingPath;
    else
        logger.debug(
            `getFramesFromPath(): imgName.frames not found: ${siblingPath}`,
        );

    let step = absImgPath.dir;
    let count = 0;
    while (step !== path.join(rootPath, 'default.frames')) {
        step = path.resolve(
            rootPath,
            ...Array(count).fill('..'),
            'default.frames',
        );
        logger.debug(`getFramesFromPath(): checking path: ${step}`);
        if (fs.existsSync(step)) return step;
        count++;
    }
    return;
};

export function getFramesFromObject(
    // biome-ignore lint/suspicious/noExplicitAny: For testing mostly,
    framesAccumulator: any,
    relImgPath: string, // relative to root, w/o slash
    isDebugMode?: boolean,
): Frame | string | undefined {
    const pathObj = new SimplePath(relImgPath);
    const siblingPath = path.join(pathObj.dir, `${pathObj.name}.frames`);
    const sibling = deepGet(framesAccumulator, siblingPath);
    if (sibling) return isDebugMode ? siblingPath : sibling;

    let step = path.join(pathObj.path, '..', 'default.frames');
    let count = 1;

    while (step !== 'default.frames') {
        const frames = deepGet(framesAccumulator, step);
        if (frames) return isDebugMode ? step : frames;
        count++;
        step = path.join(
            pathObj.path,
            ...Array(count).fill('..'),
            'default.frames',
        );
    }
    return;
}
