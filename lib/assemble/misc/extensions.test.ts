import path from 'node:path';
import { describe, expect, test } from 'vitest';
import assemblerConfig from '~/assembler-config.json';
import { traverseDirectory } from '~/lib/traverseDirectory';

describe('File extensions', () => {
    test('Amount', () => {
        const extensions = new Map();
        for (const dpath of assemblerConfig.input_paths) {
            traverseDirectory(dpath, (fpath) => {
                const fext = path.extname(fpath);
                if (!extensions.get(fext)) extensions.set(fext, 1);
                else extensions.set(fext, extensions.get(fext) + 1);
            });
        }
        const result = Array.from(extensions).sort((a, b) => b[1] - a[1]);
        for (const entry of result) //NOTE - Important console log
            console.log(`Extension ${entry[0]} encountered ${entry[1]} times`);
        expect(extensions.get('.object')).toBeGreaterThan(0);
        expect(extensions.get('.item')).toBeGreaterThan(0);
        expect(extensions.get('.recipe')).toBeGreaterThan(0);
    });
});
