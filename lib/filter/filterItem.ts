import type { ItemFile } from '~/lib/assemble/schemas/itemFileSchema';
import logger from '../logger';
import type { ResContext } from './context/context';
import { zItem } from './schemas/itemSchema';

function filterItem(ctx: ResContext, itemFile: ItemFile): void {
    const filtered = zItem.safeParse({
        id: itemFile.itemName,
        title: itemFile.shortdescription,
        description: itemFile.description,
        rarity: itemFile.rarity,
        price: itemFile.price,
    });
    if (filtered.success) ctx.items[filtered.data.id] = filtered.data;
    else {
        logger.error(`Item filtration error: ${itemFile.itemName}`);
        logger.debug(`Output:\n${filtered.error}`);
    }
}

export default filterItem;
