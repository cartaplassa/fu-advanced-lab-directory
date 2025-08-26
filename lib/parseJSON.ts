import fs from 'node:fs';
import JSON5 from 'json5';
import logger from './logger';

const NEWLINE_INSIDE_STRINGS = /"(?:[^\"\\]|\\.)*"/gm;

export const fixNewlines = (file: string) =>
    file.replaceAll(NEWLINE_INSIDE_STRINGS, (match) =>
        match.replaceAll('\\n', '\\\\n'),
    );

const parseJSON = (path: fs.PathOrFileDescriptor) => {
    const file = fs.readFileSync(path, 'utf-8');
    try {
        return JSON5.parse(file);
    } catch (e) {
        if (e instanceof SyntaxError) {
            logger.warn(
                `Parsing error at ${path},\ntrying to handle gracefully`,
            );
            try {
                return JSON5.parse(fixNewlines(file));
            } catch (e) {
                logger.error(
                    `SyntaxError while parsing JSON5 at ${path},\nContent: ${e}`,
                );
                logger.debug(file);
            }
        }
        logger.error(`Unknown JSON5 parsing error at ${path},\nContent: ${e}`);
        logger.debug(file);
    }
};

export default parseJSON;
