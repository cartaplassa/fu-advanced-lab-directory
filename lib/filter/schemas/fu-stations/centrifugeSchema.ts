import z from 'zod';
import { zCentrifugeRarity } from '~/lib/assemble/schemas/centrifugeRecipesSchema';
import objectFileSchema from '~/lib/assemble/schemas/objectFileSchema';
import { zChance } from '../chanceSchema';

const centrifugeSchema = objectFileSchema
    .extend({
        craftDelay: z.number().gte(0),
        itemChances: z.record(zCentrifugeRarity, zChance),
        centrifugeType: z.string(),
        isn_requiredPower: z.number().optional(),
    })
    .transform((val) => ({
        ...val,
        id: val.objectName,
        title: val.shortdescription,
        processingTime: val.craftDelay,
        recipeGroup: [`centrifuge${val.centrifugeType}`],
        ...(val.isn_requiredPower && { power: val.isn_requiredPower }),
    }));

export type TCentrifuge = z.infer<typeof centrifugeSchema>;

export default centrifugeSchema;
