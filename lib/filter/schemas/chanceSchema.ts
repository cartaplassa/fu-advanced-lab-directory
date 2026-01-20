import z from 'zod';

export const zChance = z.number().gte(0).lte(1);
