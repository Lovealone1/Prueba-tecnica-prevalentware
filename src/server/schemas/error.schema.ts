import { z } from "zod";

export const ErrorResponseSchema = z.object({
    error: z.object({
        message: z.string(),
        details: z.any().optional(),
    }),
});
