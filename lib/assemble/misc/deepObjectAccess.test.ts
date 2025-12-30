import { describe, expect, test } from 'vitest';
import { deepGet, deepSet, ensurePathArray } from './deepObjectAccess';

describe('Deep object access', () => {
    const testObj = {};
    test('Primitive', () => {
        deepSet(testObj, 'a/b/c', 'value');
        expect(deepGet(testObj, 'a/b/c')).toEqual('value');
    });
    test('Object', () => {
        deepSet(testObj, 'a/b', { d: 'e' });
        expect(deepGet(testObj, 'a/b/d')).toEqual('e');
    });
});

describe('Ensure path array', () => {
    const examplePath = ['foo', 'bar', 'baz'];
    test('Correct by default', () =>
        expect(ensurePathArray(examplePath)).toEqual(examplePath));
    test('String path', () =>
        expect(ensurePathArray('foo/bar/baz')).toEqual(examplePath));
    test('Trailing slashes', () =>
        expect(ensurePathArray('/foo/bar/baz/')).toEqual(examplePath));
});
