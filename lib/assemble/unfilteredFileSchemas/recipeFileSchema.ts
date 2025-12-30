import z from 'zod';

const item = z.looseObject({
    item: z.string(),
    count: z.number(),
});

const recipeFileSchema = z.looseObject({
    input: z.array(item),
    output: item,
    groups: z.array(z.string()),
});

export type RecipeFile = z.infer<typeof recipeFileSchema>;
export default recipeFileSchema;
