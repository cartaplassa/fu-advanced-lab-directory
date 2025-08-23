import fs from 'node:fs';
import winston from 'winston';
import dayjs from 'dayjs';

const { align, colorize, combine, timestamp, printf } = winston.format;
const customTimestamp = () => timestamp({ format: 'YYYY-MMDD-HHmmss' });
const customFormat = printf(
    ({ level, message, timestamp }) =>
        `${timestamp} ${level.toUpperCase()}: ${message}`,
);

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            format: combine(
                customTimestamp(),
                align(),
                customFormat,
                colorize({ all: true }),
            ),
        }),
        // new winston.transports.File({
        //     format: combine(customTimestamp(), align(), customFormat),
        //     filename: `./logs/${dayjs().format('YYYY-MMDD-HHmmss')}.log`,
        //     handleExceptions: true,
        // }),
        new winston.transports.Stream({
            level: 'debug',
            format: combine(customTimestamp(), align(), customFormat),
            stream: fs.createWriteStream(
                `./logs/${dayjs().format('YYYY-MMDD-HHmmss')}.log`,
                { flags: 'w' },
            ),
            handleExceptions: true,
        }),
    ],
});

export default logger;
