import path from 'node:path';
import { applyPatchRecursively } from '~/lib/assemble/assembleObjectPatch';
import SimplePath from '~/lib/assemble/misc/simplePath';
import type { ItemFile } from '~/lib/assemble/schemas/itemFileSchema';
import type { ObjectFile } from '~/lib/assemble/schemas/objectFileSchema';
import type { JSONPatch } from '~/lib/assemble/schemas/patchFileSchema';
import type { RecipeFile } from '~/lib/assemble/schemas/recipeFileSchema';
import logger from '~/lib/logger';
import type { CentrifugeRecipes } from '../schemas/centrifugeRecipesSchema';
import { FrameCollection } from './frameCollection';

export class FileContext {
    inputPaths: string[];
    currentRoot: string;
    outputPath: string;
    imagesPath: string;
    unfilteredImagesPath: string;
    // NOTE - [k: path]: content
    items: { [k: string]: ItemFile };
    objects: { [k: string]: ObjectFile };
    recipes: { [k: string]: RecipeFile };
    frames: FrameCollection;
    centrifugeRecipes: CentrifugeRecipes;
    starboundVersion: string;
    FUVersion: string;

    constructor(inputPaths: string[], outputPath: string) {
        this.inputPaths = [...new Set(inputPaths)];
        this.currentRoot = this.inputPaths[0];
        this.outputPath = outputPath;
        this.unfilteredImagesPath = path.join(outputPath, 'unfilteredImages');
        this.imagesPath = path.join(outputPath, 'images');
        this.items = {};
        this.objects = {};
        this.recipes = {};
        this.frames = new FrameCollection();
        this.starboundVersion = '1.4.4';
    }

    getAll() {
        return {
            items: this.items,
            objects: this.objects,
            recipes: this.recipes,
            frames: this.frames,
            centrifugeRecipes: this.centrifugeRecipes,
            starboundVersion: this.starboundVersion,
            FUVersion: this.FUVersion,
        };
    }

    updateRoot() {
        this.currentRoot =
            this.inputPaths[this.inputPaths.indexOf(this.currentRoot) + 1] ||
            '';
    }

    getFrames(relPath: string) {
        logger.debug(`Getting frames for ${relPath}`);
        return this.frames.get(relPath);
    }
    getFramesPath(relPath: string) {
        return this.frames.getPath(relPath);
    }
    // biome-ignore lint/suspicious/noExplicitAny: <Because of reasons>
    setFrames(relPath: string, frameLike: any) {
        this.frames.set(relPath, frameLike);
    }

    applyPatch(patch: JSONPatch, ppath: string) {
        const patchPath = new SimplePath(
            path.relative(this.currentRoot, ppath),
        );
        const destinationName = path.basename(
            patchPath.path,
            path.extname(patchPath.path),
        );
        const destinationRelloc = path.join(
            path.dirname(patchPath.path),
            destinationName,
        );
        if (patchPath.ext?.startsWith('frames')) {
            const framesObj = this.getFrames(destinationRelloc);
            applyPatchRecursively(framesObj, patch, ppath);
            this.setFrames(destinationRelloc, framesObj);
            return;
        }
        const collections = {
            items: this.items,
            objects: this.objects,
            recipes: this.recipes,
        };
        type Collection = keyof typeof collections;
        for (const key in collections) {
            if (collections[key as Collection][destinationRelloc]) {
                logger.info(`Applying patch for ${patchPath.path} in ${key}`);
                applyPatchRecursively(
                    collections[key as Collection][destinationRelloc],
                    patch,
                    ppath,
                );
            }
        }
    }
}
