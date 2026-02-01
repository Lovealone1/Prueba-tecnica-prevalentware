/**
 * Converts a value (Date|string|unknown) to ISO string if valid.
 * Useful for query parameters parsed by Zod, which may be Date instances.
 * 
 * @param value - The value to convert (Date, ISO string, or unknown type)
 * @returns ISO 8601 string or undefined if conversion fails or value is falsy
 */
export function toIsoOrUndefined(value: unknown): string | undefined {
    if (!value) return undefined;

    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) return undefined;
        return value.toISOString();
    }

    if (typeof value === "string") {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return undefined;
        return d.toISOString();
    }

    return undefined;
}

/**
 * Ensures both from and to dates exist and are valid ISO strings.
 * Returns an object ready to pass to report builders.
 * 
 * @param input - Object with from and to date values (any type)
 * @returns Validated ISO range object or null if either date is invalid
 */
export function requireIsoRange(input: {
    from: unknown;
    to: unknown;
}): { fromIso: string; toIso: string } | null {
    const fromIso = toIsoOrUndefined(input.from);
    const toIso = toIsoOrUndefined(input.to);

    if (!fromIso || !toIso) return null;
    return { fromIso, toIso };
}
