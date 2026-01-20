import z from 'zod';
import objectFileSchema from '~/lib/assemble/schemas/objectFileSchema';
import { zLowerCaseRarity } from '../zRarity';

// station
// station2
// station3 etc.

const zUpgradeStage = z.looseObject({
    itemSpawnParameters: z.looseObject({
        price: z.optional(z.int().gte(0)),
        description: z.string(),
        shortdescription: z.string(),
        rarity: zLowerCaseRarity.default('common'),
    }),
    interactData: z.looseObject({
        filter: z.array(z.string()),
        upgradeMaterials: z.optional(
            z.array(z.looseObject({ item: z.string(), count: z.int() })),
        ),
    }),
});
export type TUpgradeStage = z.infer<typeof zUpgradeStage>;

export const zTieredCraftingStation = objectFileSchema
    .extend({
        upgradeStages: z.array(zUpgradeStage),
    })
    .transform((val) => ({
        ...val,
        id: val.objectName,
        title: val.shortdescription,
    }));
export type TTieredCraftingStation = z.infer<typeof zTieredCraftingStation>;
