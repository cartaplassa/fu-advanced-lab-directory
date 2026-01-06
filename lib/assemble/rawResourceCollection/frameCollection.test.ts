import { describe, expect, test } from 'vitest';
import { FrameCollection } from './frameCollection';

describe('getFrameFromObject', () => {
    const testFrameCollection = new FrameCollection({
        items: {
            active: {
                'default.frames': 'priority2',
                'someitem.frames': 'priority1',
            },
            other: {
                deep: { nested: { path: {} } },
                'someitem.frames': 'priority3',
                'default.frames': 'priority4',
            },
        },
    });

    test('Actual path', () =>
        expect(testFrameCollection.get('items/active/someitem')).toEqual(
            'priority1',
        ));
    test('Actual path, debug', () =>
        expect(testFrameCollection.getPath('items/active/someitem')).toEqual(
            'items/active/someitem.frames',
        ));
    test('Actual path, fallback to default', () =>
        expect(testFrameCollection.get('items/active/someotheritem')).toEqual(
            'priority2',
        ));
    test('Actual path, fallback to default, debug', () =>
        expect(
            testFrameCollection.getPath('items/active/someotheritem'),
        ).toEqual('items/active/default.frames'));
    test('Outside path', () =>
        expect(
            testFrameCollection.get('items/other/deep/nested/path/someitem'),
        ).toEqual('priority3'));
    test('Outside path, debug', () =>
        expect(
            testFrameCollection.getPath(
                'items/other/deep/nested/path/someitem',
            ),
        ).toEqual('items/other/someitem.frames'));
    test('Outside path, fallback to default', () =>
        expect(
            testFrameCollection.get(
                'items/other/deep/nested/path/someotheritem',
            ),
        ).toEqual('priority4'));
    test('Outside path, fallback to default, debug', () =>
        expect(
            testFrameCollection.getPath(
                'items/other/deep/nested/path/someotheritem',
            ),
        ).toEqual('items/other/default.frames'));
});
