import type { ItemFile } from '~/lib/assemble/schemas/itemFileSchema';
import type { ResContext } from './context/context';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'essential';
export const parseRarity = (val: any): Rarity =>
    val in ['common', 'uncommon', 'rare', 'legendary', 'essential']
        ? val
        : 'common';

export type Item = {
    name: string;
    description: string;
    title: string;
    price: number;
    rarity: Rarity;
    category: string | undefined;
    itemTags?: string[];
};

function filterItem(ctx: ResContext, itemFile: ItemFile): void {
    const filtered: Item = {
        name: itemFile.itemName, // NOTE: present in all items
        description: itemFile.description, // NOTE: present in all items
        title: itemFile.shortdescription, // NOTE: present in all items
        price: (itemFile.price as number | undefined) || 0,
        rarity: parseRarity(itemFile.rarity), // NOTE: present in all items
        category: itemFile.category as string | undefined,
        ...(itemFile.itemTags &&
        Array.isArray(itemFile.itemTags) &&
        itemFile.itemTags.length > 0
            ? {
                  itemTags: itemFile.itemTags,
              }
            : {}),
    };
    ctx.items[filtered.name] = filtered;
}

export default filterItem;
