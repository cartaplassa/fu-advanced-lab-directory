import z from 'zod';

const objectFileSchema = z.looseObject({
    objectName: z.string(),
    description: z.string(),
    shortdescription: z.string(),
});

export type ObjectFile = z.infer<typeof objectFileSchema>;
export default objectFileSchema;
