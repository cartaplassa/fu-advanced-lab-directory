import { describe, expect, test } from 'vitest';
import { getFramesFromObject } from './getFrame';

describe('getFrameFromObject', () => {
    const testFrameCollection = {
        items: {
            active: {
                'default.frames': 'priority2',
                'someitem.frames': 'priority1',
            },
            other: {
                deep: {
                    nested: {
                        path: {
                            'someitem.frames': 'priority3',
                        },
                    },
                },
                'default.frames': 'priority4',
            },
        },
    };

    test('Actual path', () =>
        expect(
            getFramesFromObject(testFrameCollection, 'items/active/someitem'),
        ).toEqual('priority1'));
    test('Actual path, debug', () =>
        expect(
            getFramesFromObject(
                testFrameCollection,
                'items/active/someitem',
                true,
            ),
        ).toEqual('items/active/someitem.frames'));
    test('Actual path, fallback to default', () =>
        expect(
            getFramesFromObject(
                testFrameCollection,
                'items/active/someotheritem',
            ),
        ).toEqual('priority2'));
    test('Actual path, fallback to default, debug', () =>
        expect(
            getFramesFromObject(
                testFrameCollection,
                'items/active/someotheritem',
                true,
            ),
        ).toEqual('items/active/default.frames'));
    test('Outside path', () =>
        expect(
            getFramesFromObject(
                testFrameCollection,
                'items/other/deep/nested/path/someitem',
            ),
        ).toEqual('priority3'));
    test('Outside path, debug', () =>
        expect(
            getFramesFromObject(
                testFrameCollection,
                'items/other/deep/nested/path/someitem',
                true,
            ),
        ).toEqual('items/other/deep/nested/path/someitem.frames'));
    test('Outside path, fallback to default', () =>
        expect(
            getFramesFromObject(
                testFrameCollection,
                'items/other/deep/nested/path/someotheritem',
            ),
        ).toEqual('priority4'));
    test('Outside path, fallback to default, debug', () =>
        expect(
            getFramesFromObject(
                testFrameCollection,
                'items/other/deep/nested/path/someotheritem',
                true,
            ),
        ).toEqual('items/other/default.frames'));
    test('Non-existent outside path, fallback to default, debug', () =>
        expect(
            getFramesFromObject(
                testFrameCollection,
                'items/other/deep/nested/path/someotheritem',
                true,
            ),
        ).toEqual('items/other/default.frames'));
});
