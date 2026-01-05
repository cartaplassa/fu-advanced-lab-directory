import type { Item } from '../filterItem';
import type { Recipe } from '../filterRecipe';

export class ResContext {
    items: Record<string, Item>;
    stations: string[];
    recipes: Recipe[];

    constructor() {
        this.items = {};
        this.stations = [];
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
