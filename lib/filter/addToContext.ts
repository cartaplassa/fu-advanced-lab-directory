import type { z } from 'zod';
import logger from '../logger';
import type { ResContext } from './context/context';
import { processCentrifuge } from './processors/centrifuge';
import { processCraftingStation } from './processors/craftingStation';
import { processExtractor } from './processors/extractor';
import { processSmelter } from './processors/smelter';
import { processTieredCraftingStation } from './processors/tieredCraftingStation';
import { processTrader } from './processors/trader';
import centrifugeSchema from './schemas/fu-stations/centrifugeSchema';
import { zCraftingStation } from './schemas/fu-stations/craftingStationSchema';
import extractorSchema from './schemas/fu-stations/extractorSchema';
import smelterSchema from './schemas/fu-stations/smelterSchema';
import { zTieredCraftingStation } from './schemas/fu-stations/tieredCraftingStationSchema';
import traderSchema from './schemas/fu-stations/traderSchema';
import { type TItem, zItem } from './schemas/itemSchema';
import { type TStation, zStation } from './schemas/stationSchema';

type MapItem = {
    schema: z.ZodType;
    processor: (ctx: ResContext, obj: any) => void;
};
const map: Record<string, MapItem> = {
    centrifuge: {
        schema: centrifugeSchema,
        processor: processCentrifuge,
    },
    extractor: {
        schema: extractorSchema,
        processor: processExtractor,
    },
    smelter: {
        schema: smelterSchema,
        processor: processSmelter,
    },
    tieredCraftingStation: {
        schema: zTieredCraftingStation,
        processor: processTieredCraftingStation,
    },
    trader: {
        schema: traderSchema,
        processor: processTrader,
    },
    craftingStation: {
        schema: zCraftingStation,
        processor: processCraftingStation,
    },
    station: {
        schema: zStation,
        processor: (ctx: ResContext, station: TStation) => {
            ctx.stations[station.id] = station;
        },
    },
    item: {
        schema: zItem,
        processor: (ctx: ResContext, item: TItem) => {
            ctx.items[item.id] = item;
        },
    },
};

export function addToContext(
    ctx: ResContext,
    type: keyof typeof map,
    val: any,
) {
    const parsed = map[type].schema.safeParse(val);
    if (parsed.success) {
        map[type].processor(ctx, parsed.data);
        logger.info(
            `Added ${type} to context: ${(parsed.data as { id: string }).id}`,
        );
    } else {
        logger.error(
            `Processing ${type} failed for ${val.id ?? val.objectName ?? val.itemName}`,
        );
        logger.debug(parsed.error);
        // logger.debug(parsed.error + '\n' + JSON.stringify(val, null, 4));
    }
}
