import { expect, test } from 'vitest';
import {
    applyPatchRecursively,
    getPatchTargetKey,
} from './assembleObjectPatch';

test('Getting patch destination', () => {
    expect(
        getPatchTargetKey(
            'objects/outpost/frogfurnishing/frogfurnishing.object.patch',
        ),
    ).toEqual('objects/outpost/frogfurnishing/frogfurnishing.object');
});

const regularPatchTarget = {
    a: 1,
    b: 2,
    c: 3,
    d: [4, 5],
};

const regularPatch = [
    { op: 'add', path: '/d/2', value: 6 },
    { op: 'remove', path: '/c' },
    { op: 'replace', path: '/a', value: 0 },
    { op: 'move', from: '/d/0', path: '/d/1' },
    { op: 'copy', from: '/b', path: '/e' },
];

test('Applying patch', () => {
    expect(
        applyPatchRecursively(regularPatchTarget, regularPatch, 'wherever'),
    ).toEqual({
        a: 0,
        b: 2,
        e: 2,
        d: [5, 4, 6],
    });
});

const nestedTestObj = {
    a: 1,
    b: 2,
    storeInventory: { comerce: 1 },
    c: 3,
};

const nestedTestPatch = [
    [
        { op: 'test', path: '/a', value: 1 },
        { op: 'add', path: '/d', value: 4 },
    ],
    [
        {
            // NOTE - will fail
            op: 'test',
            path: '/storeInventory/comerce',
            inverse: true,
        },
        {
            // NOTE - won't be written
            op: 'add',
            path: '/e',
            value: '5',
        }, // NOTE - somehow works in-game anyway
    ],
    [
        { op: 'test', path: '/b', value: 2 },
        { op: 'remove', path: '/a' },
    ],
];

test('Applying nested patch', () => {
    expect(
        applyPatchRecursively(nestedTestObj, nestedTestPatch, 'wherever'),
    ).toEqual({
        b: 2,
        c: 3,
        storeInventory: { comerce: 1 },
        d: 4,
    });
});
