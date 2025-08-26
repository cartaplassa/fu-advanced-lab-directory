import * as z from 'zod';
// NOTE - key, default.frames content -> x0, y0, dx, dy

export const Frames = z
    .looseObject({
        frameGrid: z.looseObject({
            size: z.tuple([z.number(), z.number()]),
            dimensions: z.tuple([z.number(), z.number()]),
            names: z.array(z.array(z.string())),
        }),
        aliases: z.optional(z.record(z.string(), z.string())),
    })
    .superRefine((val, ctx) => {
        if (val.frameGrid.names.length !== val.frameGrid.dimensions[1])
            ctx.addIssue({
                code: 'custom',
                message: 'Height mismatch',
                path: ['frameGrid', 'names'],
            });
        for (let i = 0; i < val.frameGrid.names.length; i++) {
            if (val.frameGrid.names[i].length !== val.frameGrid.dimensions[0])
                ctx.addIssue({
                    code: 'custom',
                    message: 'Width mismatch',
                    path: ['frameGrid', 'names', i],
                });
        }
        if (val.aliases) {
            const names = val.frameGrid.names.flat();
            for (const el in val.aliases)
                if (!(val.aliases[el] in names))
                    ctx.addIssue({
                        code: 'custom',
                        message: 'Loose pointer',
                        path: ['aliases', el],
                    });
        }
    });

function getCropCoordinates() {}
