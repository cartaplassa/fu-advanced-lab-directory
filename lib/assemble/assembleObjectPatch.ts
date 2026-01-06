/** biome-ignore-all lint/suspicious/noExplicitAny: parsing stuff */

import path from 'node:path';
import jsonpatch from 'fast-json-patch/index';
import logger from '~/lib/logger';
import parseJSON from '~/lib/parseJSON';

export const getPatchTargetKey = (path: string) =>
    path.split('.').slice(0, -1).join('.');

export const applyPatchRecursively = (
    target: any,
    patch: any,
    fpath?: string,
) => {
    patch
        ?.filter((el: any) => Array.isArray(el))
        .forEach((el: any) => applyPatchRecursively(target, el, fpath));
    const validOperations = patch?.filter((el: any) =>
        ['add', 'remove', 'replace', 'move', 'copy', 'test'].includes(el?.op),
    );
    try {
        return jsonpatch.applyPatch(target, validOperations).newDocument;
    } catch (e) {
        const validatorResponse = jsonpatch.validate(patch, validOperations);
        if (fpath) {
            // FIXME starbound json patch can process test operation w/o value
            // to check if the prop exists (?)
            // Setting as warn and ignoring for now
            logger.warn(`Error while applying patch at ${fpath}`);
            logger.debug(`Error content:\n${e}`);
        }
        logger.debug(`Validator's response:\n${validatorResponse}`);
    }
};

const assembleObjectPatch = (
    fpath: string,
    assetsPath: string,
    target: any,
) => {
    const key = path.relative(assetsPath, getPatchTargetKey(fpath));
    if (!target[key]) return;
    const patch = parseJSON(fpath);
    target[key] = applyPatchRecursively(target[key], patch, fpath);
};

export default assembleObjectPatch;
