import fs from 'node:fs';
import path from 'node:path';

const DIRECTORY_BLACKLIST = ['.git', '.github', 'dungeons'];

export default function traverse(
    currentPath: fs.PathLike,
    callback: (path: string) => void,
) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(currentPath as string, entry.name);

        if (entry.isDirectory() && !DIRECTORY_BLACKLIST.includes(entry.name)) {
            traverse(fullPath, callback);
        } else if (entry.isFile()) {
            callback(fullPath);
        }
    }
}
/*
.craftingStations.values().({
	objectName,
	interactAction,
	inventoryIcon,
	interactData.filter
})
*/
