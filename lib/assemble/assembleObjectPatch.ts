import logger from '../logger';
import path from 'node:path';
import parseJSON from '../parseJSON';
import jsonpatch from 'fast-json-patch/index.mjs';

export const getPatchTargetKey = (path: string) =>
    path.split('.').slice(0, -1).join('.');

export const applyPatchRecursively = (target, patch, fpath) => {
    patch
        .filter((el) => Array.isArray(el))
        .forEach((el) => applyPatchRecursively(target, el, fpath));
    const validOperations = patch.filter((el) =>
        ['add', 'remove', 'replace', 'move', 'copy', 'test'].includes(el?.op),
    );
    try {
        return jsonpatch.applyPatch(target, validOperations).newDocument;
    } catch (e) {
        const validatorResponse = jsonpatch.validate(patch, validOperations);
        logger.error(`Error while applying patch at ${fpath}\nContent: ${e}`);
        logger.debug(`Validator's response:\n${validatorResponse}`);
    }
};

const assembleObjectPatch = (fpath, assetsPath, target) => {
    const key = path.relative(assetsPath, getPatchTargetKey(fpath));
    if (!target[key]) return;
    const patch = parseJSON(fpath);
    target[key] = applyPatchRecursively(target[key], patch, fpath);
};

export default assembleObjectPatch;
