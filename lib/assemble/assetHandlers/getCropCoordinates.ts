import z from 'zod';
import logger from '~/lib/logger';

export const FRAMES_PARSER_WARN = 'with_warnings';

const _frameGridName = z.union([z.string(), z.null()]);

export const frameGridSchema = z
    .looseObject({
        frameGrid: z.looseObject({
            size: z.tuple([z.number(), z.number()]),
            dimensions: z.tuple([z.number(), z.number()]),
            names: z.optional(z.array(z.array(_frameGridName))),
        }),
        aliases: z.optional(z.record(z.string(), z.string())),
    })
    .superRefine((val, ctx) => {
        if (val.frameGrid.names) {
            if (val.frameGrid.names.length > val.frameGrid.dimensions[1])
                ctx.addIssue({
                    code: 'custom',
                    message: 'Actual height too big',
                    path: ['frameGrid', 'names'],
                    params: { level: FRAMES_PARSER_WARN },
                });
            if (val.frameGrid.names.length < val.frameGrid.dimensions[1])
                ctx.addIssue({
                    code: 'custom',
                    message: 'Actual height too small',
                    path: ['frameGrid', 'names'],
                    params: { level: FRAMES_PARSER_WARN },
                });
            for (let i = 0; i < val.frameGrid.names.length; i++) {
                if (val.frameGrid.names[i].length > val.frameGrid.dimensions[0])
                    ctx.addIssue({
                        code: 'custom',
                        message: 'Actual width too big',
                        path: ['frameGrid', 'names', i],
                        params: { level: FRAMES_PARSER_WARN },
                    });
                if (val.frameGrid.names[i].length < val.frameGrid.dimensions[0])
                    ctx.addIssue({
                        code: 'custom',
                        message: 'Actual width too small',
                        path: ['frameGrid', 'names', i],
                        params: { level: FRAMES_PARSER_WARN },
                    });
            }
        }
        if (val.aliases) {
            const raiseLoosePointerWarning = (el: string) =>
                ctx.addIssue({
                    code: 'custom',
                    message: 'Loose pointer',
                    path: ['aliases', el],
                    params: { level: FRAMES_PARSER_WARN },
                });
            const isInvalidNumberKey = (key: string | number) => {
                const k = Number(key);
                return Number.isNaN(k) || k > val.frameGrid.dimensions[0] - 1;
            };
            if (val.frameGrid.names) {
                const names = val.frameGrid.names.flat();
                for (const el in val.aliases)
                    if (
                        !names.includes(val.aliases[el]) &&
                        isInvalidNumberKey(val.aliases[el])
                    )
                        raiseLoosePointerWarning(el);
            } else {
                for (const el in val.aliases)
                    if (isInvalidNumberKey(val.aliases[el]))
                        raiseLoosePointerWarning(el);
            }
        }
    });

export type FrameGrid = z.infer<typeof frameGridSchema>;

//NOTE - x0, y0, x, y
const _frameListSequence = z.array(z.int()).length(4);

export const frameListSchema = z
    .looseObject({
        frameList: z.record(z.string(), _frameListSequence),
        aliases: z.optional(z.record(z.string(), z.string())),
    })
    .superRefine((val, ctx) => {
        if (val.aliases) {
            const raiseLoosePointerWarning = (el: string) =>
                ctx.addIssue({
                    code: 'custom',
                    message: 'Loose pointer',
                    path: ['aliases', el],
                    params: { level: FRAMES_PARSER_WARN },
                });
            const names = Object.keys(val.frameList);
            for (const el in val.aliases)
                if (!names.includes(val.aliases[el]))
                    raiseLoosePointerWarning(el);
        }
    });

export type FrameList = z.infer<typeof frameListSchema>;

const filterCustomWarnings = (issue: z.core.$ZodIssue) =>
    issue.code === 'custom' && issue?.params?.level !== FRAMES_PARSER_WARN;

export const _parseWithWarnings = <T extends z.ZodObject>(
    input: any,
    schema: T,
) => {
    const { error, data } = schema.safeParse(input);
    if (error && !(error?.issues.filter(filterCustomWarnings)?.length > 0))
        return { status: FRAMES_PARSER_WARN, data: input as z.infer<T>, error };
    else if (error) return { status: 'failed', error };
    return { status: 'success', data };
};

export const parseFrameGrid = (input: any) =>
    _parseWithWarnings(input, frameGridSchema);
export const parseFrameList = (input: any) =>
    _parseWithWarnings(input, frameListSchema);

// NOTE - key, default.frames content -> x0, y0, dx, dy
export type CropCoordinates = {
    left: number;
    top: number;
    width: number;
    height: number;
};
export function getCropCoordinates(
    key: string | number,
    frames: any,
): CropCoordinates | undefined {
    const framesObj = frames.data ? frames.data : frames;
    const { status, data, error } = framesObj.frameGrid
        ? parseFrameGrid(framesObj)
        : framesObj.frameList
          ? parseFrameList(framesObj)
          : {
                status: 'failed',
                data: null,
                error: new Error(
                    `getCropCoordinates(): unrecognized file format,\n${JSON.stringify(frames, null, 2)}`,
                ),
            };
    if (error) {
        if (error instanceof z.ZodError) {
            for (const issue of error.issues) {
                if (
                    issue.code === 'custom' &&
                    issue?.params?.level === FRAMES_PARSER_WARN
                ) {
                    logger.warn(`${issue.message} at ${issue.path.join('/')}`);
                } else {
                    logger.error(`${issue.message} at ${issue.path.join('/')}`);
                }
            }
        } else {
            logger.error(error.message);
        }
    }
    if (status === 'failed') return;

    if (framesObj.frameList) {
        const parsedFrames = data as FrameList;
        const actualKey = parsedFrames.aliases?.[key] ?? key;
        const sequence =
            parsedFrames.frameList[actualKey] ??
            parsedFrames.frameList[
                Object.keys(parsedFrames.frameList)[Number(actualKey)]
            ];
        if (!sequence) return;
        return {
            left: sequence[0],
            top: sequence[1],
            width: sequence[2] - sequence[0],
            height: sequence[3] - sequence[1],
        };
    }

    const parsedFrames = data as FrameGrid;
    const actualKey = parsedFrames.aliases?.[key] ?? key;

    const coordinates: number[] = [];
    if (parsedFrames.frameGrid.names) {
        parsedFrames.frameGrid.names.forEach((row, y) => {
            row.forEach((el, x) => {
                if (el === actualKey) {
                    coordinates.push(x, y);
                }
            });
        });
    } else coordinates.push(Number(actualKey), 0);
    //NOTE - single number key -> first row index

    return {
        left: parsedFrames.frameGrid.size[0] * coordinates[0],
        top: parsedFrames.frameGrid.size[1] * coordinates[1],
        width: parsedFrames.frameGrid.size[0],
        height: parsedFrames.frameGrid.size[1],
    };
}
