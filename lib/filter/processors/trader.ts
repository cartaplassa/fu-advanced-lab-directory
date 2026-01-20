import type { ObjectFile } from '~/lib/assemble/schemas/objectFileSchema';
import { addToContext } from '../addToContext';
import type { ResContext } from '../context/context';
import { Recipe } from '../filterRecipe';
import type { TTrader } from '../schemas/fu-stations/traderSchema';

export const isTrader = (objectFile: ObjectFile) =>
    objectFile?.interactAction === 'OpenMerchantInterface' &&
    Array.isArray((objectFile as any)?.interactData?.items);

export function processTrader(ctx: ResContext, trader: TTrader) {
    for (const entry of trader.interactData.items) {
        let item: string, count: number, price: number;

        if (Array.isArray(entry.item)) {
            [item, count] = entry.item;
        } else if (typeof entry.item === 'string') {
            item = entry.item;
            count = 1;
        } else {
            item = entry.item.name;
            count = entry.item.count ?? 1;
        }

        price = entry.price ?? ctx.items[item]?.price;
        if (!price) continue;

        ctx.recipes.push(
            new Recipe({
                input: [{ item: 'money', count: price }],
                output: [{ item, count }],
                groups: [trader.objectName],
            }),
        );
    }
    addToContext(ctx, 'station', trader);
    addToContext(ctx, 'item', trader);
}
