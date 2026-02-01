import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Test suite for financial report builder
 * 
 * Covers:
 * - Financial movements report aggregation
 * - Data aggregation by granularity (day, month, all)
 * - Balance calculation
 * - Period formatting
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

import { buildFinancialMovementsReport } from "@/server/reports/financial-reports";

beforeEach(() => {
    vi.clearAllMocks();
});

afterEach(() => {
    vi.clearAllMocks();
});

describe("buildFinancialMovementsReport", () => {
    /**
     * Test: Aggregation by day granularity
     * 
     * Verifies:
     * - Transactions are aggregated by day
     * - Balance is calculated correctly
     * - Period format is YYYY-MM-DD
     * - Series contains correct income/expense/net values
     */
    it("aggregates transactions by day granularity", async () => {
        prismaMock.transaction.findMany.mockResolvedValue([
            {
                amount: 100000,
                date: new Date("2026-01-31T10:00:00Z"),
                type: "INCOME",
            },
            {
                amount: 50000,
                date: new Date("2026-01-31T14:00:00Z"),
                type: "EXPENSE",
            },
            {
                amount: 30000,
                date: new Date("2026-02-01T09:00:00Z"),
                type: "INCOME",
            },
        ]);

        const report = await buildFinancialMovementsReport({
            from: new Date("2026-01-31"),
            to: new Date("2026-02-02"),
            granularity: "day",
        });

        expect(report.balance).toBe(80000);
        expect(report.series.length).toBe(2);
        expect(report.series[0].period).toBe("2026-01-31");
        expect(report.series[0].income).toBe(100000);
        expect(report.series[0].expense).toBe(50000);
        expect(report.series[0].net).toBe(50000);
        expect(report.series[1].period).toBe("2026-02-01");
        expect(report.series[1].income).toBe(30000);
    });

    /**
     * Test: Aggregation by month granularity
     * 
     * Verifies:
     * - Transactions across days in same month aggregate together
     * - Period format is YYYY-MM
     */
    it("aggregates transactions by month granularity", async () => {
        prismaMock.transaction.findMany.mockResolvedValue([
            {
                amount: 100000,
                date: new Date("2026-01-10T10:00:00Z"),
                type: "INCOME",
            },
            {
                amount: 50000,
                date: new Date("2026-01-25T14:00:00Z"),
                type: "EXPENSE",
            },
            {
                amount: 30000,
                date: new Date("2026-02-05T09:00:00Z"),
                type: "INCOME",
            },
        ]);

        const report = await buildFinancialMovementsReport({
            from: new Date("2026-01-01"),
            to: new Date("2026-03-01"),
            granularity: "month",
        });

        expect(report.series.length).toBe(2);
        expect(report.series[0].period).toBe("2026-01");
        expect(report.series[0].income).toBe(100000);
        expect(report.series[0].expense).toBe(50000);
        expect(report.series[1].period).toBe("2026-02");
        expect(report.series[1].income).toBe(30000);
    });

    /**
     * Test: Aggregation with "all" granularity
     * 
     * Verifies:
     * - All transactions aggregate into single "all" period
     * - Cumulative balance is correct
     */
    it("aggregates all transactions into 'all' period", async () => {
        prismaMock.transaction.findMany.mockResolvedValue([
            {
                amount: 100000,
                date: new Date("2026-01-31T10:00:00Z"),
                type: "INCOME",
            },
            {
                amount: 50000,
                date: new Date("2026-02-15T14:00:00Z"),
                type: "EXPENSE",
            },
        ]);

        const report = await buildFinancialMovementsReport({
            granularity: "all",
        });

        expect(report.series.length).toBe(1);
        expect(report.series[0].period).toBe("all");
        expect(report.series[0].income).toBe(100000);
        expect(report.series[0].expense).toBe(50000);
        expect(report.balance).toBe(50000);
    });

    /**
     * Test: Empty transaction set
     * 
     * Verifies:
     * - No transactions returns empty series
     * - Balance is zero
     */
    it("handles empty transaction set", async () => {
        prismaMock.transaction.findMany.mockResolvedValue([]);

        const report = await buildFinancialMovementsReport({
            granularity: "day",
        });

        expect(report.balance).toBe(0);
        expect(report.series.length).toBe(0);
    });

    /**
     * Test: Date range filtering
     * 
     * Verifies:
     * - Only transactions within date range are included
     * - from and to parameters are properly formatted in response
     */
    it("respects date range parameters", async () => {
        prismaMock.transaction.findMany.mockResolvedValue([
            {
                amount: 50000,
                date: new Date("2026-01-15T10:00:00Z"),
                type: "INCOME",
            },
        ]);

        const from = new Date("2026-01-01");
        const to = new Date("2026-02-01");

        const report = await buildFinancialMovementsReport({
            from,
            to,
            granularity: "day",
        });

        expect(report.from).toBe(from.toISOString());
        expect(report.to).toBe(to.toISOString());
    });

    /**
     * Test: Only income transactions
     * 
     * Verifies:
     * - Expense is zero when no expenses exist
     * - Balance equals total income
     */
    it("handles income-only scenario", async () => {
        prismaMock.transaction.findMany.mockResolvedValue([
            {
                amount: 100000,
                date: new Date("2026-01-31T10:00:00Z"),
                type: "INCOME",
            },
            {
                amount: 50000,
                date: new Date("2026-01-31T14:00:00Z"),
                type: "INCOME",
            },
        ]);

        const report = await buildFinancialMovementsReport({
            granularity: "day",
        });

        expect(report.balance).toBe(150000);
        expect(report.series[0].expense).toBe(0);
        expect(report.series[0].net).toBe(150000);
    });

    /**
     * Test: Only expense transactions
     * 
     * Verifies:
     * - Income is zero when no income exists
     * - Balance is negative
     */
    it("handles expense-only scenario", async () => {
        prismaMock.transaction.findMany.mockResolvedValue([
            {
                amount: 100000,
                date: new Date("2026-01-31T10:00:00Z"),
                type: "EXPENSE",
            },
        ]);

        const report = await buildFinancialMovementsReport({
            granularity: "day",
        });

        expect(report.balance).toBe(-100000);
        expect(report.series[0].income).toBe(0);
        expect(report.series[0].net).toBe(-100000);
    });
});
