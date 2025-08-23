import path from 'node:path';
import fs from 'node:fs';
import logger from './lib/logger';
import traverseDirectory from './lib/traverseDirectory';
import assemblerConfig from './assembler-config.json';
import executeCallbacks from './lib/executeCallback';
import jsonpatch from 'fast-json-patch/index.mjs';
import JSON5 from 'json5';

logger.info('Logger initialized');

const resObj = {
    items: {},
    craftingStations: {},
    recipes: {},
};

const parseJSON = (path: fs.PathOrFileDescriptor) => {
    const file = fs.readFileSync(path, 'utf-8');
    try {
        return JSON5.parse(file);
    } catch (e) {
        logger.error(`JSON5 parsing error at ${path},\nContent: ${e}`);
        logger.debug(file);
    }
};

const getPatchDestination = (path: string) =>
    path.split('.').slice(0, -1).join('.');

const populateObjects = (assetsPath) =>
    traverseDirectory(path.join(assetsPath, 'objects'), (fpath) =>
        executeCallbacks(fpath, {
            object: (fpath) => {
                const key = path.relative(assetsPath, fpath);
                const value = parseJSON(fpath);
                if (!value?.interactData?.filter) {
                    const upgradeStages = value?.upgradeStages?.filter(
                        (stage) => stage?.interactData?.filter,
                    );
                    if (!(upgradeStages?.length > 0)) return;
                }
                if (!resObj.craftingStations[key])
                    resObj.craftingStations[key] = {};
                Object.assign(resObj.craftingStations[key], value);
                return;
            },
            'object.patch': (fpath) => {
                const key = path.relative(
                    assetsPath,
                    getPatchDestination(fpath),
                );
                if (!resObj.craftingStations[key]) return;
                // NOTE Arrays need to be flattened because someone special
                // decided it's a great idea to ditch the specs and nest them
                const patch = parseJSON(fpath).flat();
                try {
                    resObj.craftingStations[key] = jsonpatch.applyPatch(
                        resObj.craftingStations[key],
                        patch,
                    ).newDocument;
                } catch (e) {
                    const validatorResponse = jsonpatch.validate(
                        patch,
                        resObj.craftingStations[key],
                    );
                    logger.error(
                        [
                            `Error while applying patch at ${fpath}`,
                            `Content: ${e}`,
                        ].join('\n'),
                    );
                    logger.debug(`Validator's response:\n${validatorResponse}`);
                }
            },
        }),
    );

populateObjects(assemblerConfig.assets_path);
populateObjects(assemblerConfig.fu_path);
const outputPath = path.join(assemblerConfig.output_path, 'output.json');

fs.writeFileSync(outputPath, JSON.stringify(resObj), { flag: 'w' });
