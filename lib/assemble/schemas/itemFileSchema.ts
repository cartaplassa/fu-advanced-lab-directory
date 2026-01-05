import z from 'zod';

const itemFileSchema = z.looseObject({
    itemName: z.string(),
    description: z.string(),
    shortdescription: z.string(),
});

export type ItemFile = z.infer<typeof itemFileSchema>;

export default itemFileSchema;
