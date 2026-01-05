import z from 'zod';

const baseOperationSchema = z.object({
    op: z.string(),
    path: z.string().startsWith('/'),
});

const addOperationSchema = baseOperationSchema.extend({
    op: z.literal('add'),
    value: z.any(),
});

const removeOperationSchema = baseOperationSchema.extend({
    op: z.literal('remove'),
});

const replaceOperationSchema = baseOperationSchema.extend({
    op: z.literal('replace'),
    value: z.any(),
});

const moveCopyOperationSchema = baseOperationSchema.extend({
    op: z.union([z.literal('move'), z.literal('copy')]),
    from: z.string().startsWith('/'),
});

const testOperationSchema = baseOperationSchema.extend({
    op: z.literal('test'),
    value: z.any(),
});

const patchOperationSchema = z.discriminatedUnion('op', [
    addOperationSchema,
    removeOperationSchema,
    replaceOperationSchema,
    moveCopyOperationSchema,
    testOperationSchema,
]);

const patchDocumentSchema = z.array(patchOperationSchema);

const patchOrSchema = z.union([patchOperationSchema, patchDocumentSchema]);

//FIXME - One wrong op = error on file
const patchFileSchema = z.array(patchOrSchema);
export type JSONPatch = z.infer<typeof patchFileSchema>;

export default patchFileSchema;
