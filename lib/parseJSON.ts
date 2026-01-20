import fs from 'node:fs';
import JSON5 from 'json5';
import logger from './logger.ts';

const MULTILINE_JSON_STRINGS = /"(?:[^"\\]|\\.)*"/gms;
export const fixNewlines = (file: string) =>
    file.replaceAll(MULTILINE_JSON_STRINGS, (match) => {
        return match.replace(/[\r\n]+/g, '\\n');
    });

const parseJSON = (path: fs.PathOrFileDescriptor) => {
    const file = fs.readFileSync(path, 'utf-8');
    try {
        return JSON5.parse(fixNewlines(file));
    } catch (e) {
        if (e instanceof SyntaxError) {
            logger.warn(`SyntaxError while parsing JSON5 at ${path}`);
            // logger.debug(file);
        } else {
            logger.error(`Unknown JSON5 parsing error at ${path}`);
            // logger.debug(file);
        }
    }
};

export default parseJSON;
