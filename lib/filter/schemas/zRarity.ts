import z from 'zod';

export const zRarity = z.enum([
    'common',
    'rare',
    'legendary',
    'essential',
    'uncommon',
]);

const lowercase = (val: string) =>
    typeof val === 'string' ? val.toLowerCase() : val;

export const zLowerCaseRarity = z.preprocess(lowercase, zRarity);
