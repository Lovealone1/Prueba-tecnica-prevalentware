import { z } from "@/server/openapi/zod-openapi";

export const ReportGranularityEnum = z
  .enum(["day", "month", "all"])
  .openapi("ReportGranularity");

export const FinancialMovementsQuerySchema = z
  .object({
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

export const FinancialMovementsChartDatasetSchema = z.object({
  key: z.enum(["income", "expense", "net"]),
  label: z.string(),
  data: z.array(z.number()),
});

export const FinancialMovementsChartPointSchema = z.object({
  label: z.string(),
  income: z.number(),
  expense: z.number(),
  net: z.number(),
});

export const FinancialMovementsChartResponseSchema = z.object({
  meta: z.object({
    from: z.string(),
    to: z.string(),
    granularity: z.enum(["day", "week", "month"]),
  }),
  labels: z.array(z.string()),
  series: z.object({
    income: z.array(z.number()),
    expense: z.array(z.number()),
    net: z.array(z.number()),
  }),
  points: z.array(FinancialMovementsChartPointSchema),
  totals: z.object({
    income: z.number(),
    expense: z.number(),
    net: z.number(),
  }),
  datasets: z.array(FinancialMovementsChartDatasetSchema),
});

export const FinancialBalanceResponseSchema = z.object({
  balance: z.number(),
  currency: z.string(),
  asOf: z.string(),
  totals: z.object({
    income: z.number(),
    expense: z.number(),
  }),
});

export type FinancialMovementsChartResponse = z.infer<
  typeof FinancialMovementsChartResponseSchema
>;