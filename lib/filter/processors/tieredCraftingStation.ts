import type { ObjectFile } from '~/lib/assemble/schemas/objectFileSchema';
import { addToContext } from '../addToContext';
import type { ResContext } from '../context/context';
import { Recipe } from '../filterRecipe';
import type { TTieredCraftingStation } from '../schemas/fu-stations/tieredCraftingStationSchema';

export const isTieredCraftingStation = (val: ObjectFile) =>
    Boolean(val?.upgradeStages);

export function processTieredCraftingStation(
    ctx: ResContext,
    tieredCraftingStation: TTieredCraftingStation,
) {
    const stages = tieredCraftingStation.upgradeStages;
    for (const index in stages) {
        const i = Number(index);
        const tier = stages[i];
        const materials = tier.interactData.upgradeMaterials;
        const currentTierID = `${tieredCraftingStation.objectName}${i ? i + 1 : ''}`;
        const nextTierID = `${tieredCraftingStation.objectName}${i + 2}`;
        if (materials)
            ctx.recipes.push(
                new Recipe({
                    input: materials,
                    output: [{ item: nextTierID, count: 1 }],
                    groups: [currentTierID],
                }),
            );
        addToContext(ctx, 'station', {
            id: currentTierID,
            recipeGroup: tier.interactData.filter,
            icon: `${tieredCraftingStation.objectName}.png`,
        });
        addToContext(ctx, 'item', {
            id: currentTierID,
            title: tier.itemSpawnParameters.shortdescription,
            description: tier.itemSpawnParameters.description,
            rarity: tier.itemSpawnParameters.rarity,
            price: tier.itemSpawnParameters.price,
        });
    }
}

const outpostStations = [
    'armoryoutpost',
    'chemlaboutpost',
    'designlaboutpost',
    'prototyperoutpost',
    'nanofabricatoroutpost',
    'powerstationoutpost',
];

export const isOutpostStation = (val: ObjectFile) =>
    outpostStations.includes(val.objectName);
