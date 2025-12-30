import path from 'node:path';
import mime from 'mime-types';
import { applyPatchRecursively } from '~/lib/assemble/assembleObjectPatch';
import itemFileSchema, {
    type ItemFile,
} from '~/lib/assemble/unfilteredFileSchemas/itemFileSchema';
import objectFileSchema, {
    type ObjectFile,
} from '~/lib/assemble/unfilteredFileSchemas/objectFileSchema';
import patchFileSchema from '~/lib/assemble/unfilteredFileSchemas/patchFileSchema';
import recipeFileSchema, {
    type RecipeFile,
} from '~/lib/assemble/unfilteredFileSchemas/recipeFileSchema';
import logger from '~/lib/logger';
import parseJSON from '~/lib/parseJSON';
import getImage from './assetHandlers/getImage';
import type { FileContext } from './rawResourceCollection/context';

const EXTENSION_BLACKLIST = [
    '.config',
    '.event',
    '.frames',
    '.idx',
    '.cinematic',
    '.pdn',
    '.dungeon',
    '.achievement',
    '.aimission',
    '.animation',
    '.ase',
    '.projectile',
    '.codex',
    '.cursor',
    '.xb1',
    '.kate-swp',
];

export type RawResourceCollection = {
    items: { [k: string]: ItemFile };
    objects: { [k: string]: ObjectFile };
    recipes: { [k: string]: RecipeFile };
};
type Collection = keyof RawResourceCollection;

export default function handleFile(ctx: FileContext, fpath: string) {
    const mimeType = mime.lookup(fpath);

    // NOTE - prolly the fastest way to get correct JSON files, albeit not accurate
    if (
        (mimeType !== 'application/json' && mimeType !== false) ||
        EXTENSION_BLACKLIST.includes(path.extname(fpath))
    ) {
        logger.info(`${fpath} doesn't have required extension, skipping`);
        return;
    }

    // biome-ignore lint/suspicious/noExplicitAny: <JSON5 parser return>
    let parsedFile: any;
    try {
        parsedFile = parseJSON(fpath);
    } catch (_e) {
        //TODO ?
        logger.info(`${fpath} doesn't have valid JSON structure, skipping`);
        return;
    }
    const relativePath = path.relative(ctx.currentRoot, fpath);

    const parsedPatch = patchFileSchema.safeParse(parsedFile);
    if (parsedPatch.success) {
        //TODO - Partial success
        logger.info(`${fpath} recognized as patch`);
        ['items', 'objects', 'recipes'].forEach((collection) => {
            const patchDestination = path.join(
                path.dirname(relativePath),
                path.basename(relativePath, path.extname(relativePath)),
            );
            if (ctx[collection as Collection][patchDestination]) {
                logger.info(
                    `Applying patch for ${relativePath} in ${collection}`,
                );
                applyPatchRecursively(
                    ctx[collection as Collection][patchDestination],
                    parsedPatch.data,
                    fpath,
                );
            }
        });
        return;
    }

    const parsedRecipe = recipeFileSchema.safeParse(parsedFile);
    if (parsedRecipe.success) {
        logger.info(`${fpath} recognized as recipe`);
        ctx.recipes[relativePath] = parsedRecipe.data;
        return;
    }

    const parsedObject = objectFileSchema.safeParse(parsedFile);
    if (parsedObject.success) {
        if (typeof parsedObject?.data?.inventoryIcon === 'string')
            getImage(
                ctx,
                fpath,
                parsedObject.data.inventoryIcon,
                parsedObject.data.objectName,
            );
        if (Array.isArray(parsedObject?.data?.upgradeStages)) {
            parsedObject.data.upgradeStages.forEach((stage, i) => {
                if (
                    typeof stage?.itemSpawnParameters?.inventoryIcon ===
                    'string'
                )
                    getImage(
                        ctx,
                        fpath,
                        stage.itemSpawnParameters.inventoryIcon,
                        parsedObject.data.objectName + i,
                    );
            });
        }
        logger.info(`${fpath} recognized as object`);
        ctx.objects[relativePath] = parsedObject.data;
        return;
    }

    const parsedItem = itemFileSchema.safeParse(parsedFile);
    if (parsedItem.success) {
        if (typeof parsedItem?.data?.inventoryIcon === 'string')
            getImage(
                ctx,
                fpath,
                parsedItem.data.inventoryIcon,
                parsedItem.data.itemName,
            );
        logger.info(`${fpath} recognized as item`);
        ctx.items[relativePath] = parsedItem.data;
        return;
    }

    logger.info(`${fpath} not recognized`);
    return;
}
