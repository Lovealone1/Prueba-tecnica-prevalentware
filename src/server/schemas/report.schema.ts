import { z } from "@/server/openapi/zod-openapi";

/**
 * Report granularity options for time-series aggregation.
 */
export const ReportGranularityEnum = z
  .enum(["day", "month", "all"])
  .openapi("ReportGranularity");

/**
 * Query parameters for financial movements report endpoint.
 * All parameters are optional with sensible defaults.
 */
export const FinancialMovementsQuerySchema = z
  .object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    granularity: ReportGranularityEnum.optional().default("day"),
  })
  .openapi("FinancialMovementsQuery");

/**
 * Single data point in a time-series financial report.
 */
export const FinancialMovementPointSchema = z
  .object({
    period: z.string(),
    income: z.number(),
    expense: z.number(),
    net: z.number(),
  })
  .openapi("FinancialMovementPoint");

/**
 * Complete financial movements report with aggregated transaction data.
 */
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

/**
 * Single dataset for chart visualization.
 * Contains aggregated values for a single metric (income, expense, or net).
 */
export const FinancialMovementsChartDatasetSchema = z.object({
  key: z.enum(["income", "expense", "net"]),
  label: z.string(),
  data: z.array(z.number()),
});

/**
 * Data point representation for chart points.
 */
export const FinancialMovementsChartPointSchema = z.object({
  label: z.string(),
  income: z.number(),
  expense: z.number(),
  net: z.number(),
});

/**
 * Complete response structure for financial movements chart.
 * Provides multiple data formats for different visualization needs.
 */
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

/**
 * Financial balance response structure.
 * Aggregated summary of all transactions with current balance.
 */
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