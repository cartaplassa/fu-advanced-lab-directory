import path from 'node:path';
import { describe, expect, test } from 'vitest';
import SimplePath from './simplePath';

describe('Path', () => {
    describe('Simple case', () => {
        const somePath = new SimplePath('path/to/file.txt');
        test('path', () => expect(somePath.path).toBe('path/to/file.txt'));
        test('base', () => expect(somePath.base).toBe('file.txt'));
        test('dir', () => expect(somePath.dir).toBe('path/to'));
        test('name', () => expect(somePath.name).toBe('file'));
        test('ext', () => expect(somePath.ext).toBe('txt'));
        test('relloc', () =>
            expect(somePath.relloc('/')).toBe(
                path.relative(
                    '/',
                    path.join(import.meta.dirname, '../../..', somePath.path),
                ),
            ));
        test('appendTo', () =>
            expect(somePath.appendTo('/home/user')).toBe(
                '/home/user/path/to/file.txt',
            ));
    });
    describe('Double extension', () => {
        const somePath = new SimplePath('path/to/file.txt.patch');
        test('ext', () => expect(somePath.ext).toBe('txt.patch'));
    });
    describe('Pseudo-root', () => {
        const somePath = new SimplePath('/path/to/file.txt');
        test('path', () => expect(somePath.path).toBe('/path/to/file.txt'));
        test('base', () => expect(somePath.base).toBe('file.txt'));
        test('dir', () => expect(somePath.dir).toBe('/path/to'));
        test('name', () => expect(somePath.name).toBe('file'));
        test('ext', () => expect(somePath.ext).toBe('txt'));
        test('relloc', () =>
            expect(somePath.relloc('/')).toBe('path/to/file.txt'));
        test('appendTo', () =>
            expect(somePath.appendTo('/home/user')).toBe(
                '/home/user/path/to/file.txt',
            ));
    });
});
