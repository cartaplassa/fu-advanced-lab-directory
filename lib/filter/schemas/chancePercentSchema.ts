import z from 'zod';

export const zChancePercent = z.number().gte(0).lte(100);
