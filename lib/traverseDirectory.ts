import fs from 'node:fs';
import path from 'node:path';
import logger from './logger';

export default function traverseDirectory(
    currentPath: fs.PathLike,
    callback: (path: string) => void,
) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(currentPath as string, entry.name);

        if (entry.isDirectory()) {
            traverseDirectory(fullPath, callback);
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
