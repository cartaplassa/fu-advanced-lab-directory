import path from 'node:path';
import fs from 'node:fs';
import logger from './lib/logger';
import traverseDirectory from './lib/traverseDirectory';
import assemblerConfig from './assembler-config.json';
import executeCallbacks from './lib/executeCallbacks';
import assembleObject from './lib/assemble/assembleObject';
import assembleObjectPatch from './lib/assemble/assembleObjectPatch';

logger.info('Logger initialized');

const resObj = {
    items: {},
    recipes: {},
};

const populateItems = (assetsPath) =>
    traverseDirectory(path.join(assetsPath, 'objects'), (fpath) =>
        executeCallbacks(fpath, {
            object: () => assembleObject(fpath, assetsPath, resObj.items),
            'object.patch': () =>
                assembleObjectPatch(fpath, assetsPath, resObj.items),
        }),
    );

populateItems(assemblerConfig.assets_path);
populateItems(assemblerConfig.fu_path);
const outputPath = path.join(assemblerConfig.output_path, 'output.json');

fs.writeFileSync(outputPath, JSON.stringify(resObj), { flag: 'w' });
logger.info('All done');
