import z from 'zod';

const zNumberOrNull = z.number().nullable();
// 1) handmill and ext. lab
// 2) ext. lab mk II
// 3) quantum ext.
const zTieredValue = z.tuple([z.number(), z.number(), z.number()]);
const zFlexibleValue = z.union([z.number(), zTieredValue]);
const zTieredNullableValue = z.tuple([
    zNumberOrNull,
    zNumberOrNull,
    zNumberOrNull,
]);

// /objects/generic/extractionlab_recipes.config
const zRecipe = z.object({
    timeScale: z.preprocess(
        (val) => {
            if (Array.isArray(val)) {
                for (const i in val) {
                    if (val[i] === null) val[i] = 1;
                }
                if (val.length === 1) return [1, 1, val[0]];
                if (val.length === 2) return [1, val[0], val[1]];
            }
        },
        z.optional(z.union([zTieredNullableValue, z.number()])),
    ),
    inputs: z.record(z.string(), zFlexibleValue),
    outputs: z.record(z.string(), zFlexibleValue),
});

const extractionRecipesSchema = z.array(zRecipe);

export type ExtractionRecipes = z.infer<typeof extractionRecipesSchema>;
export default extractionRecipesSchema;
