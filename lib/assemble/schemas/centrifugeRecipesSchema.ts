import z from 'zod';

const zRarity = z.enum(['rarest', 'rare', 'uncommon', 'normal', 'common']);
const zRecipe = z.record(z.string(), z.tuple([zRarity, z.number()]));
const zItemMap = z.record(z.string(), zRecipe);

// https://github.com/colinhacks/zod/issues/2200
const centrifugeRecipesSchema = z
    .looseObject({
        recipeTypes: z.record(z.string(), z.array(z.string())),
    })
    .superRefine((val, ctx) => {
        const categories = new Set(Object.values(val.recipeTypes).flat());
        categories.forEach((categoryKey) => {
            const potentialMap = val[categoryKey];

            if (!potentialMap) {
                ctx.addIssue({
                    code: 'custom',
                    message: `Missing ref ${categoryKey}`,
                    path: [categoryKey],
                });
                return;
            }

            const result = zItemMap.safeParse(potentialMap);
            if (!result.success) {
                result.error.issues.forEach((issue) =>
                    ctx.addIssue({
                        ...issue,
                        path: [categoryKey, ...issue.path],
                    }),
                );
            }
        });
    });

export type CentrifugeRecipes = z.infer<typeof centrifugeRecipesSchema>;

export default centrifugeRecipesSchema;
