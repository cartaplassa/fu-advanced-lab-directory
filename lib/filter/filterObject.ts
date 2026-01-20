import type { ObjectFile } from '~/lib/assemble/schemas/objectFileSchema';
import logger from '../logger';
import { addToContext } from './addToContext';
import type { ResContext } from './context/context';
import { isCentrifuge } from './processors/centrifuge';
import {
    isCraftingStation,
    isCraftingStationWithoutFilter,
    processCraftingStationWithoutFilter,
} from './processors/craftingStation';
import { isExtractor } from './processors/extractor';
import { isSmelter } from './processors/smelter';
import {
    isOutpostStation,
    isTieredCraftingStation,
} from './processors/tieredCraftingStation';
import { isTrader } from './processors/trader';

function filterObject(ctx: ResContext, objectFile: ObjectFile) {
    if (isSmelter(objectFile.objectName))
        addToContext(ctx, 'smelter', objectFile);
    else if (isCentrifuge(objectFile.objectName))
        addToContext(ctx, 'centrifuge', objectFile);
    else if (isExtractor(objectFile.objectName))
        addToContext(ctx, 'extractor', objectFile);
    else if (isTrader(objectFile)) addToContext(ctx, 'trader', objectFile);
    else if (isTieredCraftingStation(objectFile)) {
        if (isOutpostStation(objectFile))
            // Not supposed to be upgraded, recipes duplicate original stations
            logger.info(`Outpost station detected: ${objectFile.objectName}`);
        else addToContext(ctx, 'tieredCraftingStation', objectFile);
    } else if (isCraftingStation(objectFile)) {
        if (isCraftingStationWithoutFilter(objectFile))
            processCraftingStationWithoutFilter(ctx, objectFile);
        else addToContext(ctx, 'craftingStation', objectFile);
    } else
        addToContext(ctx, 'item', {
            ...objectFile,
            id: objectFile.objectName,
            title: objectFile.shortdescription,
        });
}

export default filterObject;
