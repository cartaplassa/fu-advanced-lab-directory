import path from 'node:path';
import logger from '~/lib/logger';
import { applyPatchRecursively } from '../assembleObjectPatch';
import SimplePath from '../misc/simplePath';
import type { ItemFile } from '../unfilteredFileSchemas/itemFileSchema';
import type { ObjectFile } from '../unfilteredFileSchemas/objectFileSchema';
import type { JSONPatch } from '../unfilteredFileSchemas/patchFileSchema';
import type { RecipeFile } from '../unfilteredFileSchemas/recipeFileSchema';
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
    }

    getAll() {
        return {
            items: this.items,
            objects: this.objects,
            recipes: this.recipes,
            frames: this.frames,
        };
    }

    updateRoot() {
        this.currentRoot =
            this.inputPaths[this.inputPaths.indexOf(this.currentRoot) + 1] ||
            '';
    }

    getFrames(relPath: string, fname: string) {
        logger.debug(`Getting frames for ${fname} at ${relPath}`);
        return this.frames.get(relPath, fname);
    }
    getFramesPath(relPath: string, fname: string) {
        return this.frames.getPath(relPath, fname);
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
            const framesObj = this.getFrames(
                destinationRelloc,
                destinationName,
            );
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
