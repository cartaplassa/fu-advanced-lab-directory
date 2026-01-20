import z from 'zod';
import objectFileSchema from '~/lib/assemble/schemas/objectFileSchema';

const extractorSchema = objectFileSchema
    .extend({
        fu_timerMod: z.number(),
        isn_requiredPower: z.number().gte(0).default(0),
    })
    .transform((val) => ({
        ...val,
        id: val.objectName,
        title: val.shortdescription,
        processingTime: val.fu_timerMod,
        power: val.isn_requiredPower,
        recipeGroup: [val.objectName],
    }));

export type TExtractor = z.infer<typeof extractorSchema>;

export default extractorSchema;
