import z from 'zod';
import { zLowerCaseRarity } from './zRarity';

export const zItem = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    rarity: zLowerCaseRarity.default('common'),
    price: z.coerce.number().gte(0).default(0),
});
export type TItem = z.infer<typeof zItem>;
