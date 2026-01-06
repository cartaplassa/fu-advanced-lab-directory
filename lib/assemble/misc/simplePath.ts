import path from 'node:path';

export default class SimplePath {
    /* NOTE: basic breakdown -
    - path: /path/to/some/file.ext1.ext2
    - base: file.ext1.ext2
    - name: file
    - ext: ext1.ext2 - extensions like .object.patch require further processing
    - dir: /path/to/some
    */

    path: string;
    base: string;
    name: string;
    ext: string | undefined;
    dir: string;

    constructor(fpath: string) {
        this.set(fpath);
    }

    set(fpath: string) {
        this.path = fpath;
        this.base = path.basename(fpath);
        const baseSplit = this.base.split('.');
        this.name = baseSplit[0];
        this.ext = baseSplit.slice(1).join('.') || undefined;
        this.dir = path.dirname(fpath);
    }

    relloc(from: string) {
        return path.relative(from, this.path);
    }

    appendTo(parent: SimplePath | string) {
        return path.join(
            typeof parent === 'string' ? parent : parent.path,
            this.path,
        );
    }

    print() {
        return `{\n    path: ${this.path}\n    base: ${this.base}\n    name: ${this.name}\n    ext: ${this.ext}\n    dir: ${this.dir}\n}`;
    }
}

export function isPathChild(from: string, to: string) {
    const relative = path.relative(from, to);
    return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}

export function isPathDirectChild(from: string, to: string) {
    const relative = path.relative(from, to);
    const descendant = isPathChild(from, to);
    return descendant && !relative.includes(path.sep);
}
