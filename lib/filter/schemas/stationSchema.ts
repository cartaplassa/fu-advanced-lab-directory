import z from 'zod';

export const zStation = z.object({
    id: z.string(),
    // title: z.string(),
    // description: z.string(),
    // rarity: z.preprocess(lowercase, zRarity),
    // price: z.number().gte(0),
    recipeGroup: z.array(z.string()),
    processingTime: z.optional(z.number().gte(0)),
    power: z.optional(z.number().gte(0)),
    icon: z.optional(z.string()),
});
export type TStation = z.infer<typeof zStation>;
