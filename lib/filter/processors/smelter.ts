import { addToContext } from '../addToContext';
import type { ResContext } from '../context/context';
import { Recipe } from '../filterRecipe';
import type { TSmelter } from '../schemas/fu-stations/smelterSchema';

const smelterIDs = ['electricfurnace', 'fu_blastfurnace', 'isn_arcsmelter'];
export const isSmelter = (id: string) => smelterIDs.includes(id);

// NOTE: FrackinUniverse v6.5.2: /objects/power/fu_furnace_common.lua:41
// Primary output to input ratio is hardcoded to 0.5
export function processSmelter(ctx: ResContext, smelter: TSmelter) {
    const baseModifier = smelter.fu_extraProductionChance;
    Object.entries(smelter.inputsToOutputs).forEach(([input, output]) => {
        const recipe = new Recipe({
            input: [{ item: input, count: 2 }],
            output: [{ item: output, count: 1 }],
            groups: [smelter.objectName],
            duration: smelter.processingTime,
        });

        const bonus = smelter.bonusOutputs?.[input];
        if (bonus) {
            Object.entries(bonus).forEach(([bonusOutput, chance]) => {
                recipe.output.push({
                    item: bonusOutput,
                    count: 1,
                    chance: baseModifier * (chance / 100),
                });
            });
        }

        ctx.recipes.push(recipe);
    });
    addToContext(ctx, 'station', smelter);
    addToContext(ctx, 'item', smelter);
}
