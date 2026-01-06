/** biome-ignore-all lint/suspicious/noExplicitAny: <Parsing stuff> */
import { deepSet } from '~/lib/assemble/misc/deepObjectAccess';
import { getFramesFromObject } from '../assetHandlers/getFrame';
import { FrameFile } from './frame';

export type FrameAccumulator = {
    [k: string]: FrameFile | FrameAccumulator;
};

export class FrameCollection {
    data: FrameAccumulator;
    constructor(frameCollectionLike?: any) {
        this.data = frameCollectionLike ?? {};
    }

    get(relPath: string) {
        return getFramesFromObject(this.data, relPath);
    }

    getPath(relPath: string) {
        return getFramesFromObject(this.data, relPath, true);
    }

    set(relPath: string, frameLike: any) {
        deepSet(this.data, relPath, new FrameFile(frameLike));
    }
}
