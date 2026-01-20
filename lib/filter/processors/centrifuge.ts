import type { TCentrifugeRarity } from '~/lib/assemble/schemas/centrifugeRecipesSchema';
import { addToContext } from '../addToContext';
import type { ResContext } from '../context/context';
import { type OutputIngredient, Recipe } from '../filterRecipe';
import type { TCentrifuge } from '../schemas/fu-stations/centrifugeSchema';

const centrifugeIDs = [
    'woodenCentrifuge',
    'ironCentrifuge',
    'industrialCentrifuge',
    'labCentrifuge',
    'gasCentrifuge',
    'woodenSifter',
    'powderSifter',
    'rockBreaker',
    'rockCrusher',
];
export const isCentrifuge = (id: string) => centrifugeIDs.includes(id);

export function processCentrifuge(ctx: ResContext, centrifuge: TCentrifuge) {
    for (const category of ctx.centrifugeRecipes.recipeTypes[
        centrifuge.centrifugeType
    ]) {
        for (const [item, entry] of Object.entries(category)) {
            const result: OutputIngredient[] = [];
            for (const [item, [outputChance, count]] of Object.entries(entry)) {
                result.push({
                    item,
                    count: Number(count),
                    chance: centrifuge.itemChances[
                        outputChance as TCentrifugeRarity
                    ],
                });
            }
            const recipe = new Recipe({
                input: [{ item, count: 1 }],
                output: result,
                groups: [`centrifuge${centrifuge.centrifugeType}`],
            });
            ctx.recipes.push(recipe);
        }
    }
    addToContext(ctx, 'station', centrifuge);
    addToContext(ctx, 'item', centrifuge);
}
