import z from 'zod';
import objectFileSchema from '~/lib/assemble/schemas/objectFileSchema';

export const zCraftingStation = objectFileSchema
    .extend({
        interactData: z.looseObject({
            filter: z.array(z.string()),
        }),
    })
    .transform((val) => ({
        ...val,
        id: val.objectName,
        title: val.shortdescription,
        recipeGroup: val.interactData.filter,
    }));
export type TCraftingStation = z.infer<typeof zCraftingStation>;
