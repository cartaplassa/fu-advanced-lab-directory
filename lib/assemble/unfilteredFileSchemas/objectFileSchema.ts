import z from 'zod';

const objectFileSchema = z.looseObject({
    objectName: z.string(),
    description: z.string(),
    shortdescription: z.string(),
});

export type ObjectFile = z.infer<typeof objectFileSchema>;
export default objectFileSchema;

// const upgradeStageSchema = z.looseObject({
//     itemSpawnParameters: z.looseObject({
//         inventoryIcon: z.string(),
//         description: z.string(),
//         shortDescription: z.string(),
//     }),
//     interactData: z.looseObject({
//         filter: z.array(z.string()),
//         upgradeMaterials: z.optional(
//             z.array(z.looseObject({ item: z.string(), count: z.number() })),
//         ),
//     }),
// });
