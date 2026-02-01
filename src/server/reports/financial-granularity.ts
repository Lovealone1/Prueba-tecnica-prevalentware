import type { Granularity } from "@/server/reports/financial-movements-chart";

/**
 * Granularity values accepted from API query parameters.
 * "all" is a user-friendly alias for "month" granularity.
 */
export type FinancialMovementsQueryGranularity = "day" | "month" | "all";

/**
 * Normalizes query granularity values to internal Granularity type.
 * Maps the public API interface to internal chart builder requirements.
 * 
 * Mapping:
 * - "day" -> "day"
 * - "month" -> "month"
 * - "all" -> "month" (user-friendly default)
 * 
 * @param value - Raw granularity value from query parameters
 * @returns Internal granularity value for chart builder
 */
export function normalizeFinancialGranularity(
    value: FinancialMovementsQueryGranularity
): Granularity {
    return value === "all" ? "month" : value;
}
