import path from 'node:path';

export function deepGet(obj: any, kpath: string | string[]): any {
    const keys = ensurePathArray(kpath);
    if (!obj[keys[0]]) return undefined;
    if (keys.length === 1) return obj[keys[0]];
    return deepGet(obj[keys[0]], keys.slice(1));
}

export function deepSet(obj: any, kpath: string | string[], value: any): void {
    const keys = ensurePathArray(kpath);
    if (keys.length === 1) {
        obj[keys[0]] = structuredClone(value);
        return;
    }
    obj[keys[0]] = obj[keys[0]] || {};
    deepSet(obj[keys[0]], keys.slice(1), value);
}

export const ensurePathArray = (kpath: string | string[]): string[] =>
    Array.isArray(kpath)
        ? kpath.filter((k) => k !== '')
        : kpath.split(path.sep).filter((k) => k !== '');
