import { expect, test } from 'vitest';
import { Frames } from './getCropCoordinates';

const testFrames = {
    frameGrid: {
        size: [64, 64],
        dimensions: [8, 6],

        names: [
            [
                'teleport.1',
                'teleport.2',
                'teleport.3',
                'teleport.4',
                'teleport.5',
                'teleport.6',
                'teleport.7',
                'teleport.8',
            ],
            ['blast.1', 'blast.2', 'blast.3', 'blast.4'],
            ['firewindup.1', 'firewindup.2', 'firewindup.3', 'firewindup.4'],
            ['fire.1', 'fire.2', 'fire.3', 'fire.4', 'fire.5'],
            ['fire2.1', 'fire2.2', 'fire2.3', 'fire2.4', 'fire2.5'],
            ['hurt.1', 'null', 'invis.1', 'invis.2', 'invis.3', 'invis.4'],
        ],
    },

    aliases: {
        'idle.1': 'teleport.5',
        'idle.2': 'teleport.6',
        'idle.3': 'teleport.7',
        'idle.4': 'teleport.8',
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

console.log(Frames.parse(testFrames));

// test('Parsing correct frames', ()=> {
//     expect(

//     )
// });
