import type { CentrifugeRecipes } from '~/lib/assemble/schemas/centrifugeRecipesSchema';
import type { ExtractionRecipes } from '~/lib/assemble/schemas/extractionRecipesSchema';
import type { Recipe } from '../filterRecipe';
import type { TItem } from '../schemas/itemSchema';
import type { TStation } from '../schemas/stationSchema';

export class ResContext {
    items: Record<string, TItem>;
    stations: Record<string, TStation>;
    recipes: Recipe[];
    centrifugeRecipes: CentrifugeRecipes;
    extractionRecipes: ExtractionRecipes;
    starboundVersion: string;

    constructor() {
        this.items = {};
        this.stations = {};
        this.recipes = [];
    }

    getAll() {
        return {
            items: this.items,
            stations: this.stations,
            recipes: this.recipes,
        };
    }
}
