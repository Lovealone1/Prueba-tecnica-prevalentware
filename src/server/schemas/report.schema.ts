import { z } from "@/server/openapi/zod-openapi";

export const ReportGranularityEnum = z
    .enum(["day", "month", "all"])
    .openapi("ReportGranularity");

export const FinancialMovementsQuerySchema = z
    .object({
        userId: z.string().min(1),
        from: z.coerce.date().optional(),
        to: z.coerce.date().optional(),
        granularity: ReportGranularityEnum.optional().default("day"),
    })
    .openapi("FinancialMovementsQuery");

export const FinancialMovementPointSchema = z
    .object({
        period: z.string(), // YYYY-MM-DD | YYYY-MM | "all"
        income: z.number(),
        expense: z.number(),
        net: z.number(),
    })
    .openapi("FinancialMovementPoint");

export const FinancialMovementsReportSchema = z
    .object({
        balance: z.number(),
        currency: z.string().default("COP"),
        from: z.string().nullable(),
        to: z.string().nullable(),
        granularity: ReportGranularityEnum,
        series: z.array(FinancialMovementPointSchema),
    })
    .openapi("FinancialMovementsReport");
