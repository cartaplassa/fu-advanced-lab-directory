import fs from 'node:fs';
import path from 'node:path';
import type { FileContext } from './assemble/rawResourceCollection/context';

export function traverseDirectory(
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

export default function traverse(
    ctx: FileContext,
    currentPath: fs.PathLike,
    callback: (path: string) => void,
) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(currentPath as string, entry.name);

        if (entry.isDirectory()) {
            traverse(ctx, fullPath, callback);
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
