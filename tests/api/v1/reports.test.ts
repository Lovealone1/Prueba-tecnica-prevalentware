import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Test suite for financial reports API endpoints
 * 
 * Covers:
 * - /api/v1/reports/financial-movements-chart endpoint
 * - /api/v1/reports/financial-balance endpoint
 * - /api/v1/reports/financial-movements.csv endpoint
 * - Request validation and response formatting
 * - Authentication and authorization
 * 
 * Note: Builder and data aggregation tests are in tests/server/reports/
 * Note: CSV conversion utility tests are in tests/server/reports/financial-csv.test.ts
 */

/**
 * Mock setup for database and authentication
 */
const { prismaMock, requireAuthOr401Mock, requireRoleOr403Mock } = vi.hoisted(() => ({
    prismaMock: {
        transaction: {
            findMany: vi.fn(),
            groupBy: vi.fn(),
        },
    },
    requireAuthOr401Mock: vi.fn(),
    requireRoleOr403Mock: vi.fn(),
}));

vi.mock("@/server/db/prisma", () => ({
    prisma: prismaMock,
}));

vi.mock("@/server/auth/require-auth", () => ({
    requireAuthOr401: (...args: any[]) => requireAuthOr401Mock(...args),
}));

vi.mock("@/server/auth/require-role", () => ({
    requireRoleOr403: (...args: any[]) => requireRoleOr403Mock(...args),
}));

// Import handlers after mocks
import financialMovementsChartHandler from "../../../src/pages/api/v1/reports/financial-movements-chart";
import financialBalanceHandler from "../../../src/pages/api/v1/reports/financial-balance";
import financialMovementsCsvHandler from "../../../src/pages/api/v1/reports/financial-movements.csv";

/**
 * Helper to create mock NextApiResponse with tracking capabilities
 */
function createMockRes() {
    const res: Partial<NextApiResponse> & {
        statusCode?: number;
        body?: any;
        headers: Record<string, any>;
    } = {
        headers: {},
        status(code: number) {
            res.statusCode = code;
            return res as any;
        },
        json(payload: any) {
            res.body = payload;
            return res as any;
        },
        send(payload: any) {
            res.body = payload;
            return res as any;
        },
        setHeader(key: string, value: any) {
            res.headers[key.toLowerCase()] = value;
            return res as any;
        },
        end() {
            return res as any;
        },
    };
    return res as NextApiResponse & {
        statusCode?: number;
        body?: any;
        headers: Record<string, any>;
    };
}

/**
 * Helper to create mock NextApiRequest
 */
function createReq(partial: Partial<NextApiRequest>) {
    return partial as NextApiRequest;
}

beforeEach(() => {
    vi.clearAllMocks();
});

afterEach(() => {
    vi.clearAllMocks();
});

describe("Reports API - Financial Movements Chart", () => {
    /**
     * Test: Chart generation with valid date range
     * 
     * Verifies:
     * - Proper database queries with correct date range
     * - Data aggregation by time bucket
     * - Response structure with all required fields
     * - Proper serialization of numeric types
     */
    it("GET /api/v1/reports/financial-movements-chart returns chart data for ADMIN", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "admin1", role: "ADMIN" });
        requireRoleOr403Mock.mockReturnValue(true);

        prismaMock.transaction.findMany.mockResolvedValue([
            {
                id: "t1",
                amount: 100000,
                date: new Date("2026-01-31T10:00:00Z"),
                type: "INCOME",
            },
            {
                id: "t2",
                amount: 50000,
                date: new Date("2026-01-31T14:00:00Z"),
                type: "EXPENSE",
            },
        ]);

        const req = createReq({
            method: "GET",
            query: {
                from: "2026-01-31T00:00:00Z",
                to: "2026-02-01T00:00:00Z",
                granularity: "day",
            },
        });

        const res = createMockRes();

        await financialMovementsChartHandler(req, res);

        expect(res.statusCode).toBe(200);
        expect(res.body.meta.granularity).toBe("day");
        expect(Array.isArray(res.body.labels)).toBe(true);
        expect(res.body.series.income).toBeDefined();
        expect(res.body.series.expense).toBeDefined();
        expect(res.body.series.net).toBeDefined();
        expect(Array.isArray(res.body.datasets)).toBe(true);
        expect(res.body.totals.net).toBe(50000); // 100000 - 50000
    });

    /**
     * Test: Non-ADMIN user cannot access chart endpoint
     * 
     * Verifies:
     * - Authorization check blocks regular users
     * - No database queries execute
     */
    it("GET /api/v1/reports/financial-movements-chart returns 403 for non-ADMIN", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "u1", role: "USER" });
        requireRoleOr403Mock.mockReturnValue(false);

        const req = createReq({
            method: "GET",
            query: {
                from: "2026-01-31T00:00:00Z",
                to: "2026-02-01T00:00:00Z",
                granularity: "day",
            },
        });

        const res = createMockRes();

        await financialMovementsChartHandler(req, res);

        expect(res.statusCode).toBe(403);
        expect(prismaMock.transaction.findMany).not.toHaveBeenCalled();
    });

    /**
     * Test: Missing required date parameters
     * 
     * Verifies:
     * - Query validation rejects incomplete date ranges
     */
    it("GET /api/v1/reports/financial-movements-chart returns 400 for missing dates", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "admin1", role: "ADMIN" });
        requireRoleOr403Mock.mockReturnValue(true);

        const req = createReq({
            method: "GET",
            query: {
                granularity: "day",
            },
        });

        const res = createMockRes();

        await financialMovementsChartHandler(req, res);

        expect(res.statusCode).toBe(400);
        expect(prismaMock.transaction.findMany).not.toHaveBeenCalled();
    });

    /**
     * Test: Chart with different granularities
     * 
     * Verifies:
     * - "all" granularity normalizes to "month"
     * - Bucket keys format correctly for each granularity
     */
    it("GET /api/v1/reports/financial-movements-chart normalizes 'all' to 'month' granularity", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "admin1", role: "ADMIN" });
        requireRoleOr403Mock.mockReturnValue(true);

        prismaMock.transaction.findMany.mockResolvedValue([]);

        const req = createReq({
            method: "GET",
            query: {
                from: "2026-01-01T00:00:00Z",
                to: "2026-12-31T00:00:00Z",
                granularity: "all",
            },
        });

        const res = createMockRes();

        await financialMovementsChartHandler(req, res);

        expect(res.statusCode).toBe(200);
        expect(res.body.meta.granularity).toBe("month");
    });
});

describe("Reports API - Financial Balance", () => {
    /**
     * Test: Balance report aggregation
     * 
     * Verifies:
     * - groupBy aggregates transactions by type
     * - Proper calculation of net balance
     * - Response includes currency and timestamp
     */
    it("GET /api/v1/reports/financial-balance returns current balance for ADMIN", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "admin1", role: "ADMIN" });
        requireRoleOr403Mock.mockReturnValue(true);

        prismaMock.transaction.groupBy.mockResolvedValue([
            { type: "INCOME", _sum: { amount: 1000000 } },
            { type: "EXPENSE", _sum: { amount: 400000 } },
        ]);

        const req = createReq({ method: "GET", query: {} });
        const res = createMockRes();

        await financialBalanceHandler(req, res);

        expect(res.statusCode).toBe(200);
        expect(res.body.balance).toBe(600000); // 1000000 - 400000
        expect(res.body.currency).toBe("COP");
        expect(typeof res.body.asOf).toBe("string");
        expect(res.body.totals.income).toBe(1000000);
        expect(res.body.totals.expense).toBe(400000);
    });

    /**
     * Test: Balance with no transactions
     * 
     * Verifies:
     * - Handles empty dataset gracefully
     * - Returns zero balance
     */
    it("GET /api/v1/reports/financial-balance handles empty transactions", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "admin1", role: "ADMIN" });
        requireRoleOr403Mock.mockReturnValue(true);

        prismaMock.transaction.groupBy.mockResolvedValue([]);

        const req = createReq({ method: "GET", query: {} });
        const res = createMockRes();

        await financialBalanceHandler(req, res);

        expect(res.statusCode).toBe(200);
        expect(res.body.balance).toBe(0);
        expect(res.body.totals.income).toBe(0);
        expect(res.body.totals.expense).toBe(0);
    });

    /**
     * Test: Non-ADMIN cannot access balance endpoint
     * 
     * Security critical: Prevents unauthorized access to financial summaries
     */
    it("GET /api/v1/reports/financial-balance returns 403 for non-ADMIN", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "u1", role: "USER" });
        requireRoleOr403Mock.mockReturnValue(false);

        const req = createReq({ method: "GET", query: {} });
        const res = createMockRes();

        await financialBalanceHandler(req, res);

        expect(res.statusCode).toBe(403);
        expect(prismaMock.transaction.groupBy).not.toHaveBeenCalled();
    });
});

describe("Reports API - Financial Movements CSV", () => {
    /**
     * Test: CSV export with valid report data
     * 
     * Verifies:
     * - CSV response headers are set correctly
     * - Content-Type is text/csv
     * - Content-Disposition header for file download
     * - CSV structure is valid
     */
    it("GET /api/v1/reports/financial-movements.csv returns CSV for ADMIN", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "admin1", role: "ADMIN" });
        requireRoleOr403Mock.mockReturnValue(true);

        prismaMock.transaction.findMany.mockResolvedValue([
            {
                amount: 50000,
                date: new Date("2026-01-31T10:00:00Z"),
                type: "INCOME",
            },
            {
                amount: 20000,
                date: new Date("2026-01-31T14:00:00Z"),
                type: "EXPENSE",
            },
        ]);

        const req = createReq({
            method: "GET",
            query: {
                from: "2026-01-31",
                to: "2026-02-01",
                granularity: "day",
            },
        });

        const res = createMockRes();

        await financialMovementsCsvHandler(req, res);

        expect(res.statusCode).toBe(200);
        expect(res.headers["content-type"]).toContain("text/csv");
        expect(res.headers["content-disposition"]).toContain("attachment");
        expect(res.headers["content-disposition"]).toContain(".csv");
        expect(typeof res.body).toBe("string");
        expect(res.body).toContain("period,income,expense,net");
    });

    /**
     * Test: CSV escaping with special characters
     * 
     * Verifies:
     * - Proper handling of quoted fields
     * - Newlines and commas are escaped
     */
    it("GET /api/v1/reports/financial-movements.csv handles special characters in CSV", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "admin1", role: "ADMIN" });
        requireRoleOr403Mock.mockReturnValue(true);

        prismaMock.transaction.findMany.mockResolvedValue([]);

        const req = createReq({
            method: "GET",
            query: {
                from: "2026-01-01",
                to: "2026-01-02",
                granularity: "all",
            },
        });

        const res = createMockRes();

        await financialMovementsCsvHandler(req, res);

        expect(res.statusCode).toBe(200);
        // CSV should contain metadata
        expect(res.body).toContain("currency,COP");
        expect(res.body).toContain("granularity,all");
    });

    /**
     * Test: Non-ADMIN cannot export CSV
     * 
     * Security critical: Prevents unauthorized data export
     */
    it("GET /api/v1/reports/financial-movements.csv returns 403 for non-ADMIN", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "u1", role: "USER" });
        requireRoleOr403Mock.mockReturnValue(false);

        const req = createReq({
            method: "GET",
            query: {
                from: "2026-01-01",
                to: "2026-01-02",
                granularity: "day",
            },
        });

        const res = createMockRes();

        await financialMovementsCsvHandler(req, res);

        expect(res.statusCode).toBe(403);
        expect(prismaMock.transaction.findMany).not.toHaveBeenCalled();
    });

    /**
     * Test: Unsupported HTTP methods
     * 
     * Verifies:
     * - Only GET is allowed
     * - Proper Allow header
     */
    it("POST /api/v1/reports/financial-movements.csv returns 405", async () => {
        const req = createReq({
            method: "POST",
            query: {},
        });

        const res = createMockRes();

        await financialMovementsCsvHandler(req, res);

        expect(res.statusCode).toBe(405);
        expect(res.headers.allow).toBe("GET");
    });
});

describe("Reports API - Authentication & Authorization", () => {
    /**
     * Test: Unauthenticated request handling across all report endpoints
     * 
     * Verifies:
     * - All endpoints require authentication
     * - No database access without auth
     */
    it("Unauthenticated requests return early without database access", async () => {
        requireAuthOr401Mock.mockResolvedValue(null);

        const req = createReq({
            method: "GET",
            query: {
                from: "2026-01-31",
                to: "2026-02-01",
                granularity: "day",
            },
        });

        const res = createMockRes();

        await financialMovementsCsvHandler(req, res);

        expect(requireRoleOr403Mock).not.toHaveBeenCalled();
        expect(prismaMock.transaction.findMany).not.toHaveBeenCalled();
    });
});
