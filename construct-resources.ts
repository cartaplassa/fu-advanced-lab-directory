import fs from 'node:fs';
import path from 'node:path';
import constructorConfig from './constructor-config.json';
import handleFile from './lib/assemble/handleFile';
import { FileContext } from './lib/assemble/rawResourceCollection/context';
import filterContext from './lib/filter/filterContext';
import logger from './lib/logger';
import traverse from './lib/traverseDirectory';

logger.info('Logger initialized');

const outputPath = path.join(constructorConfig.output_path, 'output.json');
const filteredOutputPath = path.join(
    constructorConfig.output_path,
    'filtered_output.json',
);

const assemblyCtx = new FileContext(
    constructorConfig.input_paths,
    constructorConfig.output_path,
);

function assembleResources() {
    if (fs.existsSync(assemblyCtx.unfilteredImagesPath))
        fs.rmSync(assemblyCtx.unfilteredImagesPath, {
            recursive: true,
            force: true,
        });
    fs.mkdirSync(assemblyCtx.unfilteredImagesPath);
    for (const dpath of assemblyCtx.inputPaths) {
        traverse(dpath, (fpath) => handleFile(assemblyCtx, fpath));
        assemblyCtx.updateRoot();
        if (assemblyCtx.currentRoot === '') logger.debug(`Assembly completed`);
        else
            logger.debug(
                `Traverse completed, new root directory: ${assemblyCtx.currentRoot}`,
            );
    }
}

assembleResources();
fs.writeFileSync(outputPath, JSON.stringify(assemblyCtx.getAll(), null, 4), {
    flag: 'w',
});

const filteredCtx = filterContext(assemblyCtx).getAll();
fs.writeFileSync(filteredOutputPath, JSON.stringify(filteredCtx, null, 4), {
    flag: 'w',
});

logger.info('All done');
