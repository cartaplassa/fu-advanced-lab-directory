import logger from './logger';
import path from 'node:path';

const getExtension = (fpath: string) =>
    path.basename(fpath).split('.').slice(1).join('.');

const executeCallbacks = (
    path: string,
    callbackObj: { [k: string]: (path: string) => void },
) => {
    const extension = getExtension(path);
    callbackObj[extension]?.(path);
};

export default executeCallbacks;
