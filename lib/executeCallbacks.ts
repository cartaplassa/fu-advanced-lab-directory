import path from 'node:path';

const getExtension = (fpath: string) =>
    path.basename(fpath).split('.').slice(1).join('.');

const executeCallbacks = (
    path: string,
    callbackObj: { [k: string]: () => void },
) => {
    const extension = getExtension(path);
    callbackObj[extension]?.();
};

export default executeCallbacks;
