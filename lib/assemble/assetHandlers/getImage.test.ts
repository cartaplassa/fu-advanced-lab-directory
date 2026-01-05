import path from 'path';
import { describe, expect, test } from 'vitest';
import {
    getAbsImagePath,
    resolveCaseInsensitive,
    splitIrelloc,
} from './getImage';

// TODO: tests for getImage itself: frameList\frameGrid with real images

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
    test('Exact path', () => {
        expect(
            resolveCaseInsensitive(
                path.join(import.meta.dirname, './getImageTest/ExactPath/File'),
            ),
        ).toStrictEqual([
            path.join(import.meta.dirname, './getImageTest/ExactPath/File'),
        ]);
    });
    test('Fixed paths', () => {
        expect(
            new Set(
                resolveCaseInsensitive(
                    path.join(
                        import.meta.dirname,
                        './Getimagetest/folder/file',
                    ),
                ),
            ),
        ).toStrictEqual(
            new Set([
                path.join(import.meta.dirname, './getImageTest/folder/File'),
                path.join(import.meta.dirname, './getImageTest/Folder/file'),
                path.join(import.meta.dirname, './getImageTest/Folder/File'),
            ]),
        );
    });
});

describe('splitIrelloc', () => {
    test('irelloc only', () => {
        expect(splitIrelloc('icon.png')).toStrictEqual({
            irelloc: 'icon.png',
            key: undefined,
            processingDirectives: [],
        });
    });
    test('with key', () => {
        expect(splitIrelloc('icon.png:default.1')).toStrictEqual({
            irelloc: 'icon.png',
            key: 'default.1',
            processingDirectives: [],
        });
    });
    test('with directive', () => {
        expect(splitIrelloc('icon.png?scale=0.5')).toStrictEqual({
            irelloc: 'icon.png',
            key: undefined,
            processingDirectives: ['scale=0.5'],
        });
    });
    test('combined', () => {
        expect(
            splitIrelloc('icon.png:default.1?flipx?scale=0.5'),
        ).toStrictEqual({
            irelloc: 'icon.png',
            key: 'default.1',
            processingDirectives: ['flipx', 'scale=0.5'],
        });
    });
});
