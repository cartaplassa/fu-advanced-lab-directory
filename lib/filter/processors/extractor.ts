import { addToContext } from '../addToContext';
import type { ResContext } from '../context/context';
import { Recipe } from '../filterRecipe';
import type { TExtractor } from '../schemas/fu-stations/extractorSchema';

const extractorIDs = [
    'handmill',
    'extractionlab',
    'extractionlabadv',
    'quantumextractor',
];
export const isExtractor = (id: string) => extractorIDs.includes(id);

// NOTE: /objects/generic/extractionlab_common.lua
const extractorTimers: Record<string, number> = {
    handmill: 0.75,
    extractionlab: 0.75,
    extractionlabadv: 0.45,
    quantumextractor: 1,
};
const extractorIndeces: Record<string, number> = {
    handmill: 0,
    extractionlab: 0,
    extractionlabadv: 1,
    quantumextractor: 2,
};
export function processExtractor(ctx: ResContext, extractor: TExtractor) {
    const index = extractorIndeces[extractor.objectName];
    const timerMod = extractorTimers[extractor.objectName];
    for (const entry of ctx.extractionRecipes) {
        const duration =
            extractor.fu_timerMod +
            (entry.timeScale
                ? Array.isArray(entry.timeScale)
                    ? (entry.timeScale[index] ?? 1) * timerMod
                    : (entry.timeScale ?? 1) * timerMod
                : timerMod);
        const result = new Recipe({
            input: [],
            output: [],
            groups: [extractor.objectName],
            duration,
        });
        for (const [item, count] of Object.entries(entry.inputs)) {
            result.input.push({
                item,
                count: Array.isArray(count) ? count[index] : count,
            });
        }
        for (const [item, count] of Object.entries(entry.outputs)) {
            result.output.push({
                item,
                count: Array.isArray(count) ? count[index] : count,
            });
        }
        ctx.recipes.push(result);
    }
    addToContext(ctx, 'station', extractor);
    addToContext(ctx, 'item', extractor);
}
