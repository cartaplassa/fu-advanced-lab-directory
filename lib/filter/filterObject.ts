import type { ObjectFile } from '~/lib/assemble/schemas/objectFileSchema';
import type { ResContext } from './context/context';
import { Recipe } from './filterRecipe';

function filterObject(ctx: ResContext, objectFile: ObjectFile) {
    if (
        ['electricfurnace', 'fu_blastfurnace', 'isn_arcsmelter'].includes(
            objectFile.objectName,
        )
    )
        getElectricFurnaceRecipes(ctx, objectFile);
}

// NOTE: FrackinUniverse v6.5.2: /objects/power/fu_furnace_common.lua:41
// Primary output to input ratio is hardcoded to 0.5
function getElectricFurnaceRecipes(ctx: ResContext, objectFile: ObjectFile) {
    const baseModifier = objectFile.fu_extraProductionChance as number;
    Object.entries(
        objectFile.inputsToOutputs as Record<string, string>,
    ).forEach(([input, output]) => {
        const recipe = new Recipe({
            input: [{ item: input, count: 2 }],
            output: [{ item: output, count: 1 }],
            groups: [objectFile.objectName],
            duration: objectFile.fu_timer as number,
        });

        const bonus = (
            objectFile.bonusOutputs as Record<string, Record<string, number>>
        )[input];
        if (bonus) {
            Object.entries(bonus).forEach(([bonusOutput, chance]) => {
                recipe.output.push({
                    item: bonusOutput,
                    count: 1,
                    chance: baseModifier * chance,
                });
            });
        }

        ctx.recipes.push(recipe);
    });
}
