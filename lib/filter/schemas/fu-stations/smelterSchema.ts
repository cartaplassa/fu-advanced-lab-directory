import z from 'zod';
import objectFileSchema from '~/lib/assemble/schemas/objectFileSchema';
import { zChancePercent } from '../chancePercentSchema';
import { zChance } from '../chanceSchema';

const smelterSchema = objectFileSchema
    .extend({
        fu_extraProductionChance: zChance,
        inputsToOutputs: z.record(z.string(), z.string()),
        fu_timer: z.number().gte(0),
        isn_requiredPower: z.number(),
        bonusOutputs: z.optional(
            z.record(z.string(), z.record(z.string(), zChancePercent)),
        ),
    })
    .transform((val) => ({
        ...val,
        id: val.objectName,
        title: val.shortdescription,
        recipeGroup: [val.objectName],
        processingTime: val.fu_timer,
    }));

export type TSmelter = z.infer<typeof smelterSchema>;

export default smelterSchema;
