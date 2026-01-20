import z from 'zod';
import objectFileSchema from '~/lib/assemble/schemas/objectFileSchema';

const zItem = z.union([
    z.string(),
    z.tuple([z.string(), z.int()]),
    z.object({
        name: z.string(),
        count: z.optional(z.int()),
    }),
]);

const zTradeOperation = z.object({
    item: zItem,
    price: z.optional(z.number().gte(0)),
});

const traderSchema = objectFileSchema
    .extend({
        interactData: z.object({
            buyFactor: z.number().gte(0),
            sellFactor: z.number().gte(0),
            items: z.array(zTradeOperation),
        }),
        // penguinweaponshop - inventoryPool: id[]
        // frogg also has a rotating inv. but outside .object
    })
    .transform((val) => ({
        ...val,
        id: val.objectName,
        title: val.shortdescription,
        recipeGroup: [val.objectName],
    }));

export type TTrader = z.infer<typeof traderSchema>;

export default traderSchema;
