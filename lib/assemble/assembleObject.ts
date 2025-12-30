import path from 'node:path';
import parseJSON from '~/lib/parseJSON';

const assembleObject = (
    fpath: string,
    assetsPath: string,
    // biome-ignore lint/suspicious/noExplicitAny: <Target is a value of an object>
    target: Record<string, any>,
) => {
    const key = path.relative(assetsPath, fpath);
    const value = parseJSON(fpath);
    target[key] = value;
};

export default assembleObject;

// NOTE Filter for crafting stations
// if (!value?.interactData?.filter) {
//     const upgradeStages = value?.upgradeStages?.filter(
//         (stage) => stage?.interactData?.filter,
//     );
//     if (!(upgradeStages?.length > 0)) return;
// }
