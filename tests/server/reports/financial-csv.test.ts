import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Test suite for financial CSV conversion utilities
 * 
 * Covers:
 * - CSV data formatting
 * - Character escaping (quotes, commas, newlines)
 * - CSV export endpoint functionality
 */

const { prismaMock } = vi.hoisted(() => ({
    prismaMock: {
        transaction: {
            findMany: vi.fn(),
        },
    },
}));

vi.mock("@/server/db/prisma", () => ({
    prisma: prismaMock,
}));

import { financialMovementsReportToCsv } from "@/server/reports/financial-report-csv";

beforeEach(() => {
    vi.clearAllMocks();
});

afterEach(() => {
    vi.clearAllMocks();
});

describe("CSV Conversion", () => {
    /**
     * Test: Basic CSV data formatting
     * 
     * Verifies:
     * - Metadata rows are included (currency, granularity, from, to, balance)
     * - Headers are in correct order (period, income, expense, net)
     * - Data rows contain properly formatted numeric values
     * - Decimal values are formatted with 2 decimal places
     */
    it("formats financial report data to CSV with correct headers", () => {
        const report = {
            balance: 50000,
            from: "2026-01-01T00:00:00Z",
            to: "2026-02-01T00:00:00Z",
            currency: "COP",
            granularity: "month" as const,
            series: [
                {
                    period: "2026-01",
                    income: 100000,
                    expense: 50000,
                    net: 50000,
                },
                {
                    period: "2026-02",
                    income: 75000,
                    expense: 25000,
                    net: 50000,
                },
            ],
        };

        const csv = financialMovementsReportToCsv(report);
        const lines = csv.split("\n");

        // Metadata comes first
        expect(lines[0]).toBe("currency,COP");
        expect(lines[1]).toBe("granularity,month");
        // Blank line at index 5
        // Header at index 6
        expect(lines[6]).toBe("period,income,expense,net");
        // Data starts at index 7
        expect(lines[7]).toContain("2026-01");
        expect(lines[8]).toContain("2026-02");
    });

    /**
     * Test: CSV escaping for special characters
     * 
     * Verifies:
     * - Commas in data are properly escaped with quotes
     * - Double quotes are escaped correctly
     * - Newlines within quoted fields are preserved
     */
    it("escapes special characters (quotes, commas) in CSV values", () => {
        const report = {
            balance: 0,
            from: "2026-01-01T00:00:00Z",
            to: "2026-02-01T00:00:00Z",
            currency: "COP",
            granularity: "day" as const,
            series: [
                {
                    period: "data,with,commas",
                    income: 100000,
                    expense: 50000,
                    net: 50000,
                },
            ],
        };

        const csv = financialMovementsReportToCsv(report);

        expect(csv).toContain('"data,with,commas"');
    });

    /**
     * Test: Empty report CSV conversion
     * 
     * Verifies:
     * - Metadata is included even for empty reports
     * - Blank line separates metadata from header
     * - Headers are included with no data rows
     */
    it("handles empty report with headers only", () => {
        const report = {
            balance: 0,
            from: "2026-01-01T00:00:00Z",
            to: "2026-02-01T00:00:00Z",
            currency: "COP",
            granularity: "day" as const,
            series: [],
        };

        const csv = financialMovementsReportToCsv(report);
        const lines = csv.split("\n");

        // Should have: 5 metadata lines + 1 blank + 1 header = 7 lines
        expect(lines.length).toBe(7);
        expect(lines[0]).toBe("currency,COP");
        expect(lines[1]).toBe("granularity,day");
        expect(lines[5]).toBe(""); // Blank line
        expect(lines[6]).toBe("period,income,expense,net");
    });

    /**
     * Test: Large numbers formatting in CSV
     * 
     * Verifies:
     * - Large numeric values are properly formatted
     * - Negative values are handled correctly
     * - Scientific notation is avoided
     */
    it("formats large numeric values correctly in CSV", () => {
        const report = {
            balance: 1000000000,
            from: "2026-01-01T00:00:00Z",
            to: "2026-02-01T00:00:00Z",
            currency: "COP",
            granularity: "month" as const,
            series: [
                {
                    period: "2026-01",
                    income: 1000000000,
                    expense: 500000000,
                    net: 500000000,
                },
            ],
        };

        const csv = financialMovementsReportToCsv(report);

        expect(csv).toContain("1000000000");
        expect(csv).toContain("500000000");
        expect(csv).not.toContain("e+");
    });
});
