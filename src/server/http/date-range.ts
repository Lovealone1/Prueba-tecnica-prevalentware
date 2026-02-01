/**
 * Builds a UTC date range with exclusive upper bound.
 * 
 * This function assumes the "to" date is already at midnight UTC,
 * representing the exclusive upper bound of the range.
 * 
 * Range semantics: [from, toExclusive)
 * 
 * @param input - Object with ISO 8601 date strings
 * @returns Date range with exclusive upper bound
 * @throws Error if either date string is invalid
 */
export function buildUtcRangeExclusive(input: { fromIso: string; toIso: string }) {
    const from = new Date(input.fromIso);
    const to = new Date(input.toIso);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
        throw new Error("Invalid range");
    }

    // The "to" date is expected to be at midnight UTC, making it exclusive.
    // This prevents off-by-one errors in date range queries.
    return { from, toExclusive: to };
}
