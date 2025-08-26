import path from 'node:path';
import parseJSON from '../parseJSON';

const assembleObject = (fpath, assetsPath, target) => {
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
