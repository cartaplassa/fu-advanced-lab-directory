import type { RecipeFile } from '~/lib/assemble/schemas/recipeFileSchema';

export type InputIngredient = {
    item: string;
    count: number;
};

export type OutputIngredient = {
    item: string;
    count: number;
    chance?: number;
};

export class Recipe {
    input: InputIngredient[];
    output: OutputIngredient[];
    groups: string[];
    duration?: number;

    constructor({ input, output, groups, duration }: Recipe) {
        this.input = input;
        this.output = output;
        this.groups = groups;
        this.duration = duration;
    }

    static fromFile(recipeFile: RecipeFile): Recipe {
        return new Recipe({
            input: recipeFile.input,
            output: [recipeFile.output],
            groups: recipeFile.groups,
            ...(recipeFile.duration && typeof recipeFile.duration === 'number'
                ? { duration: recipeFile.duration }
                : {}),
        });
    }
}
