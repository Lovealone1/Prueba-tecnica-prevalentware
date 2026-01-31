import { z } from "@/server/openapi/zod-openapi";

export const ErrorResponseSchema = z
    .object({
        error: z.object({
            message: z.string(),
            details: z.any().optional(),
        }),
    })
    .openapi("ErrorResponse");