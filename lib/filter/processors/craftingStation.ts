import type { ObjectFile } from '~/lib/assemble/schemas/objectFileSchema';
import logger from '~/lib/logger';
import { addToContext } from '../addToContext';
import type { ResContext } from '../context/context';
import type { TCraftingStation } from '../schemas/fu-stations/craftingStationSchema';

export const isCraftingStation = (val: any) =>
    val?.interactAction === 'OpenCraftingInterface';

const craftingStationExceptions = [
    'terraforge',
    '3dprinter',
    'mechcraftingtable',
    'woodencookingtable',
    'clothingfabricator',
    'precursorterminal',
];

export function processCraftingStation(
    ctx: ResContext,
    craftingStation: TCraftingStation,
) {
    addToContext(ctx, 'station', craftingStation);
    addToContext(ctx, 'item', craftingStation);
}

export const isCraftingStationWithoutFilter = (val: ObjectFile) =>
    craftingStationExceptions.includes(val.objectName);

export const processCraftingStationWithoutFilter = (
    ctx: ResContext,
    val: ObjectFile,
) => {
    // TODO: each of them require special handling, will do later
    logger.info(`Special station detected: ${val.objectName}`);
    addToContext(ctx, 'craftingStation', {
        ...val,
        interactData: {
            ...(val.interactData as any),
            filter: [val.objectName],
        },
    });
};
