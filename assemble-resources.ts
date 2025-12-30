import fs from 'node:fs';
import path from 'node:path';
import assemblerConfig from './assembler-config.json';
import handleFile from './lib/assemble/handleFile';
import { FileContext } from './lib/assemble/rawResourceCollection/context';
import logger from './lib/logger';
import traverse from './lib/traverseDirectory';

logger.info('Logger initialized');

const ctx = new FileContext(
    assemblerConfig.input_paths,
    assemblerConfig.output_path,
);

// const populateItems = (assetsPath) =>
//     traverseDirectory(path.join(assetsPath, 'objects'), (fpath) =>
//         executeCallbacks(fpath, {
//             object: () => assembleObject(fpath, assetsPath, resObj.items),
//             'object.patch': () =>
//                 assembleObjectPatch(fpath, assetsPath, resObj.items),
//         }),
//     );

// populateItems(assemblerConfig.assets_path);
// populateItems(assemblerConfig.fu_path);

if (fs.existsSync(ctx.unfilteredImagesPath))
    fs.rmSync(ctx.unfilteredImagesPath, { recursive: true, force: true });
fs.mkdirSync(ctx.unfilteredImagesPath);
for (const dpath of ctx.inputPaths) {
    traverse(ctx, dpath, (fpath) => handleFile(ctx, fpath));
    ctx.updateRoot();
    logger.debug(`Traverse completed, new root directory: ${ctx.currentRoot}`);
}

// traverseDirectory(assemblerConfig.input_paths[0], (fpath) =>
//     handleFile(
//         fpath,
//         assemblerConfig.input_paths[0],
//         resObj,
//         assemblerConfig.output_path,
//         frameAccumulator,
//     ),
// );

const outputPath = path.join(assemblerConfig.output_path, 'output.json');
fs.writeFileSync(outputPath, JSON.stringify(ctx.getAll(), null, 4), {
    flag: 'w',
});
// const framesPath = path.join(assemblerConfig.output_path, 'frames.json');
// fs.writeFileSync(framesPath, JSON.stringify(frameAccumulator), { flag: 'w' });
logger.info('All done');
