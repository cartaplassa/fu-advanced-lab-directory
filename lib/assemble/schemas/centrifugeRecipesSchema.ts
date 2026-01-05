import z from 'zod';

const zRarity = z.enum(['rarest', 'rare', 'uncommon', 'normal', 'common']);
const zCategory = z.enum([
    'itemMapPowder',
    'itemMapRocks',
    'itemMapFarm',
    'itemMapLiquids',
    'itemMapBees',
    'itemMapIsotopes',
]);
const zRecipe = z.record(
    z.string(),
    z.record(z.string(), z.tuple([zRarity, z.number()])),
);
const zItemMap = z.record(z.string(), zRecipe);

const centrifugeRecipesSchema = z.intersection(
    z.record(zCategory, zItemMap),
    z.object({
        recipeTypes: z.array(zCategory),
    }),
);
export type CentrifugeRecipes = z.infer<typeof centrifugeRecipesSchema>;

export default centrifugeRecipesSchema;
