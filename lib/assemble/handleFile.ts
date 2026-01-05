import path from 'node:path';
import mime from 'mime-types';
import { applyPatchRecursively } from '~/lib/assemble/assembleObjectPatch';
import itemFileSchema, {
    type ItemFile,
} from '~/lib/assemble/schemas/itemFileSchema';
import objectFileSchema, {
    type ObjectFile,
} from '~/lib/assemble/schemas/objectFileSchema';
import patchFileSchema, {
    type JSONPatch,
} from '~/lib/assemble/schemas/patchFileSchema';
import recipeFileSchema, {
    type RecipeFile,
} from '~/lib/assemble/schemas/recipeFileSchema';
import logger from '~/lib/logger';
import parseJSON from '~/lib/parseJSON';
import getImage from './assetHandlers/getImage';
import type { FileContext } from './rawResourceCollection/context';
import centrifugeRecipesSchema from './schemas/centrifugeRecipesSchema';

const SEMVER_REGEX =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

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
    // Centrifuge recipes
    if (path.basename(fpath) === 'centrifuge_recipes.config') {
        logger.info(`Special file detected: ${fpath}`);
        const result = centrifugeRecipesSchema.safeParse(parseJSON(fpath));
        if (!result.success) {
            logger.error(
                `Failed to parse centrifuge_recipes.config: ${result.error}`,
            );
            return;
        }
        ctx.centrifugeRecipes = result.data;
        logger.info(`Centrifuge recipes loaded`);
        return;
    }

    // Versioning config
    if (path.basename(fpath) === '_FUversioning.config') {
        logger.info(`Special file detected: ${fpath}`);
        const config = parseJSON(fpath);
        ctx.FUVersion = config.version.match(SEMVER_REGEX)?.[0];
        logger.info(`Frackin' Universe version written`);
        return;
    }

    // NOTE - prolly the fastest way to get correct JSON files, albeit not accurate
    const mimeType = mime.lookup(fpath);
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

    // JSON patch
    const parsedPatch = patchFileSchema.safeParse(parsedFile);
    if (parsedPatch.success) {
        logger.info(`${fpath} recognized as patch`);
        handlePatch(ctx, fpath, relativePath, parsedPatch.data);
        return;
    }

    // Recipe
    const parsedRecipe = recipeFileSchema.safeParse(parsedFile);
    if (parsedRecipe.success) {
        logger.info(`${fpath} recognized as recipe`);
        ctx.recipes[relativePath] = parsedRecipe.data;
        return;
    }

    // Object
    const parsedObject = objectFileSchema.safeParse(parsedFile);
    if (parsedObject.success) {
        logger.info(`${fpath} recognized as object`);
        handleObject(ctx, fpath, relativePath, parsedObject.data);
        return;
    }

    // Item
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

function handlePatch(
    ctx: FileContext,
    fpath: string,
    relativePath: string,
    patch: JSONPatch,
) {
    //NOTE - Partial success works for engine, but this violates standard specifications
    // Not covering those cases for now, patches with errors won't apply
    ['items', 'objects', 'recipes'].forEach((collection) => {
        const patchDestination = path.join(
            path.dirname(relativePath),
            path.basename(relativePath, path.extname(relativePath)),
        );
        if (ctx[collection as Collection][patchDestination]) {
            logger.info(`Applying patch for ${relativePath} in ${collection}`);
            applyPatchRecursively(
                ctx[collection as Collection][patchDestination],
                patch,
                fpath,
            );
        }
    });
}

function handleObject(
    ctx: FileContext,
    fpath: string,
    relativePath: string,
    parsedObject: ObjectFile,
) {
    if (typeof parsedObject.inventoryIcon === 'string')
        getImage(
            ctx,
            fpath,
            parsedObject.inventoryIcon,
            parsedObject.objectName,
        );
    if (Array.isArray(parsedObject?.upgradeStages)) {
        parsedObject.upgradeStages.forEach((stage, i) => {
            if (typeof stage?.itemSpawnParameters?.inventoryIcon === 'string')
                getImage(
                    ctx,
                    fpath,
                    stage.itemSpawnParameters.inventoryIcon,
                    parsedObject.objectName + i,
                );
        });
    }
    ctx.objects[relativePath] = parsedObject;
}
