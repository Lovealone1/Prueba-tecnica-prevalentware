/**
 * Validates that from date is not after to date.
 * 
 * @param from - Start date
 * @param to - End date
 * @throws Error if from > to
 */
export function validateDateRange(from: Date, to: Date): void {
    if (from.getTime() > to.getTime()) {
        throw new Error("Invalid date range: 'from' date must be before or equal to 'to' date");
    }
}

/**
 * Builds a UTC date range with inclusive upper bound.
 * 
 * This function assumes the "to" date is already at midnight UTC.
 * The upper bound is made inclusive by adding one day and keeping it exclusive,
 * or by using <= in the database query.
 * 
 * Range semantics: [from, toInclusive]
 * 
 * @param input - Object with ISO 8601 date strings
 * @returns Date range with inclusive upper bound
 * @throws Error if either date string is invalid or if from > to
 */
export function buildUtcRangeExclusive(input: { fromIso: string; toIso: string }) {
    const from = new Date(input.fromIso);
    const to = new Date(input.toIso);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
        throw new Error("Invalid range");
    }

    // Validate that from <= to
    validateDateRange(from, to);

    // Add one day to make the range inclusive: [from, to + 1day)
    // This way the entire last day is included
    const toInclusive = new Date(to);
    toInclusive.setUTCDate(toInclusive.getUTCDate() + 1);

    return { from, toExclusive: toInclusive };
}
