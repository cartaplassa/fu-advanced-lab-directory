import { describe, expect, test } from 'vitest';
import { FRAMES_PARSER_WARN, FrameFile, parseFrame } from './frame';

describe('Full .frames suite', () => {
    describe('.frames parser', () => {
        test('Parsing correct frames', () =>
            expect(parseFrame(testFramesComplex).status).toEqual('success'));

        describe('Parsing with warnings', () => {
            test('Incorrect width', () => {
                const modifiedResult = parseFrame(
                    (() => {
                        const modifiedObj = structuredClone(testFramesComplex);
                        modifiedObj.frameGrid.names[2].push('blast.7');
                        return modifiedObj;
                    })(),
                );
                expect(modifiedResult.status).toEqual(FRAMES_PARSER_WARN);
                expect(modifiedResult?.error?.issues.length).toEqual(1);
                expect(modifiedResult?.error?.issues[0].message).toEqual(
                    'Actual width too big',
                );
                expect(modifiedResult?.error?.issues[0].path).toEqual([
                    'frameGrid',
                    'names',
                    2,
                ]);
            });
            test('Incorrect height', () => {
                const modifiedResult = parseFrame(
                    (() => {
                        const modifiedObj = structuredClone(testFramesComplex);
                        modifiedObj.frameGrid.names.push(
                            [...Array(6).keys()].map((i) => `something.${i}`),
                        );
                        return modifiedObj;
                    })(),
                );
                expect(modifiedResult.status).toEqual(FRAMES_PARSER_WARN);
                expect(modifiedResult?.error?.issues.length).toEqual(1);
                expect(modifiedResult?.error?.issues[0].message).toEqual(
                    'Actual height too big',
                );
                expect(modifiedResult?.error?.issues[0].path).toEqual([
                    'frameGrid',
                    'names',
                ]);
            });
            test('Loose alias', () => {
                const modifiedResult = parseFrame(
                    (() => {
                        const modifiedObj = structuredClone(testFramesComplex);
                        Object.assign(modifiedObj.aliases, {
                            'some.alias': 'something.else',
                        });
                        return modifiedObj;
                    })(),
                );
                expect(modifiedResult.status).toEqual(FRAMES_PARSER_WARN);
                expect(modifiedResult?.error?.issues.length).toEqual(1);
                expect(modifiedResult?.error?.issues[0].message).toEqual(
                    'Loose pointer',
                );
                expect(modifiedResult?.error?.issues[0].path).toEqual([
                    'aliases',
                    'some.alias',
                ]);
            });
        });

        test('.frames with number keys', () =>
            expect(parseFrame(testFramesKeyNumber).status).toEqual('success'));
    });

    describe('getCoordinates', () => {
        test('Simple object', () =>
            expect(
                new FrameFile(testFramesSimple).getCoordinates('full'),
            ).toEqual({
                left: 16,
                top: 0,
                width: 16,
                height: 16,
            }));

        describe('Simple object with coerceable number key', () => {
            test('Directly', () =>
                expect(
                    new FrameFile(testFramesKeyNumber).getCoordinates('1'),
                ).toEqual({
                    left: 16,
                    top: 0,
                    width: 16,
                    height: 16,
                }));
            test('By alias', () =>
                expect(
                    new FrameFile(testFramesKeyNumber).getCoordinates(
                        'default',
                    ),
                ).toEqual({
                    left: 0,
                    top: 0,
                    width: 16,
                    height: 16,
                }));
        });

        describe('Simple object with frameList', () => {
            test('Directly', () =>
                expect(
                    new FrameFile(testFramesList).getCoordinates('run'),
                ).toEqual({
                    left: 43,
                    top: 86,
                    width: 43,
                    height: 43,
                }));
            test('By alias', () =>
                expect(
                    new FrameFile(testFramesList).getCoordinates('idle.4'),
                ).toEqual({
                    left: 0,
                    top: 43,
                    width: 43,
                    height: 43,
                }));
        });

        describe('Complex object', () => {
            test('Directly', () =>
                expect(
                    new FrameFile(testFramesComplex).getCoordinates(
                        'firewindup.4',
                    ),
                ).toEqual({
                    left: 192,
                    top: 128,
                    width: 64,
                    height: 64,
                }));

            test('By alias', () =>
                expect(
                    new FrameFile(testFramesComplex).getCoordinates(
                        'fireprojectile.4',
                    ),
                ).toEqual({ left: 192, top: 128, width: 64, height: 64 }));
        });
    });
});

const testFramesSimple = {
    frameGrid: {
        size: [16, 16],
        dimensions: [2, 1],

        names: [['empty', 'full']],
    },
};

const testFramesKeyNumber = {
    frameGrid: {
        size: [16, 16],
        dimensions: [4, 1],
    },
    aliases: {
        default: '0',
    },
};

const testFramesList = {
    frameList: {
        'chest.1': [43, 0, 86, 43],
        'chest.2': [0, 43, 43, 86],
        'chest.3': [43, 43, 86, 86],
        run: [43, 86, 86, 129],
        duck: [43, 129, 86, 172],
        swim: [43, 215, 86, 258],
    },
    aliases: {
        'idle.1': 'chest.1',
        'idle.2': 'chest.2',
        'idle.3': 'chest.3',
        'idle.4': 'chest.2',
        'idle.5': 'chest.1',
        'duck.1': 'duck',
    },
};

const testFramesComplex = {
    frameGrid: {
        size: [64, 64],
        dimensions: [6, 4],

        names: [
            [
                'teleport.1',
                'teleport.2',
                'teleport.3',
                'teleport.4',
                'teleport.5',
                'teleport.6',
            ],
            ['blast.1', 'blast.2', 'blast.3', 'blast.4', 'blast.5', 'blast.6'],
            [
                'firewindup.1',
                'firewindup.2',
                'firewindup.3',
                'firewindup.4',
                'firewindup.5',
                'firewindup.6',
            ],
            ['fire.1', 'fire.2', 'fire.3', 'fire.4', 'fire.5', 'fire.6'],
        ],
    },
    aliases: {
        'idle.1': 'teleport.5',
        'idle.2': 'teleport.6',
        'firewinddown.1': 'firewindup.4',
        'firewinddown.2': 'firewindup.3',
        'firewinddown.3': 'firewindup.2',
        'firewinddown.4': 'firewindup.1',
        'teleportout.1': 'teleport.4',
        'teleportout.2': 'teleport.3',
        'teleportout.3': 'teleport.2',
        'teleportout.4': 'teleport.1',
        'fireprojectile.1': 'firewindup.1',
        'fireprojectile.2': 'firewindup.2',
        'fireprojectile.3': 'firewindup.3',
        'fireprojectile.4': 'firewindup.4',
    },
};
