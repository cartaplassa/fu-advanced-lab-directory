import path from 'path';
import { describe, expect, test } from 'vitest';
import { getAbsImagePath, resolveCaseInsensitive } from './getImage';

describe('getAbsImagePath', () => {
    test('Absolute path', () => {
        const rootPath = '/path/to/mod';
        const fpath = '/items/file.txt';
        const iname = '/image.jpg';
        const expected = '/path/to/mod/image.jpg';
        const result = getAbsImagePath(rootPath, fpath, iname);
        expect(result).toBe(expected);
    });
    test('Relative path', () => {
        const rootPath = '/path/to/mod';
        const fpath = '/items/file.txt';
        const iname = '/image.jpg';
        const expected = '/path/to/mod/image.jpg';
        const result = getAbsImagePath(rootPath, fpath, iname);
        expect(result).toBe(expected);
    });
});

describe('resolveCaseInsensitive', () => {
    test('Regular', () => {
        expect(
            resolveCaseInsensitive(
                path.join(import.meta.dirname, './getImageTest'),
                'folder/file',
            ),
        ).toBe(path.join(import.meta.dirname, './getImageTest/Folder/File'));
    });
});
