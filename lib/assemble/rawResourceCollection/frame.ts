import z from 'zod';
import logger from '~/lib/logger';
export const FRAMES_PARSER_WARN = 'with_warnings';

const zFrameGridName = z.union([z.string(), z.null()]);
const zAliases = z.optional(z.record(z.string(), z.string()));
//NOTE - x0, y0, x, y
const zFrameListSequence = z.array(z.int()).length(4);

export const frameSchema = z
    .looseObject({
        frameGrid: z.optional(
            z.looseObject({
                size: z.tuple([z.number(), z.number()]),
                dimensions: z.tuple([z.number(), z.number()]),
                names: z.optional(z.array(z.array(zFrameGridName))),
            }),
        ),
        frameList: z.optional(z.record(z.string(), zFrameListSequence)),
        aliases: zAliases,
    })
    .superRefine((val, ctx) => {
        if (!val.frameList && !val.frameGrid)
            ctx.addIssue({
                code: 'custom',
                message: 'No frameList or frameGrid',
            });

        if (val.frameGrid?.names) {
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

        if (val.aliases && val.frameGrid) {
            const raiseLoosePointerWarning = (el: string) =>
                ctx.addIssue({
                    code: 'custom',
                    message: 'Loose pointer',
                    path: ['aliases', el],
                    params: { level: FRAMES_PARSER_WARN },
                });
            const isInvalidNumberKey = (key: string | number) => {
                const k = Number(key);
                // biome-ignore lint/style/noNonNullAssertion: <Current scope>
                return Number.isNaN(k) || k > val.frameGrid!.dimensions[0] - 1;
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

        if (val.aliases && val.frameList) {
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

export type Frame = z.infer<typeof frameSchema>;

const filterCustomWarnings = (issue: z.core.$ZodIssue) =>
    issue.code === 'custom' && issue?.params?.level !== FRAMES_PARSER_WARN;

export const parseFrame = (input: any) => {
    const { error, data } = frameSchema.safeParse(input);
    if (error && !(error?.issues.filter(filterCustomWarnings)?.length > 0))
        return { status: FRAMES_PARSER_WARN, data: input as Frame, error };
    else if (error) return { status: 'failed', error };
    return { status: 'success', data };
};

function logFrameParsingError(error: any) {
    if (!error) return;
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

export class FrameFile {
    data: Frame;
    constructor(input: any) {
        const { status, data, error } = parseFrame(input);
        logFrameParsingError(error);
        if (status === 'failed') return;
        if (data) this.data = data;
    }

    getCoordinates(key: string) {
        if (this.data.frameList) {
            const actualKey = this.data.aliases?.[key] ?? key;
            const sequence =
                this.data.frameList[actualKey] ??
                this.data.frameList[
                    Object.keys(this.data.frameList)[Number(actualKey)]
                ];
            if (!sequence) return;
            return {
                left: sequence[0],
                top: sequence[1],
                width: sequence[2] - sequence[0],
                height: sequence[3] - sequence[1],
            };
        }

        if (this.data.frameGrid) {
            const actualKey = this.data.aliases?.[key] ?? key;

            const coordinates: number[] = [];
            if (this.data.frameGrid.names) {
                this.data.frameGrid.names.forEach((row, y) => {
                    row.forEach((el, x) => {
                        if (el === actualKey) {
                            coordinates.push(x, y);
                        }
                    });
                });
            } else coordinates.push(Number(actualKey), 0);
            //NOTE - single number key -> first row index

            return {
                left: this.data.frameGrid.size[0] * coordinates[0],
                top: this.data.frameGrid.size[1] * coordinates[1],
                width: this.data.frameGrid.size[0],
                height: this.data.frameGrid.size[1],
            };
        }
        return undefined;
    }
}
