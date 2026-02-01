import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { NextApiRequest, NextApiResponse } from "next";

import { ERROR_MESSAGES } from "@/server/http/errors";

/**
 * Test suite for POST /api/v1/transactions endpoint
 * 
 * This test suite validates the transaction management API with focus on:
 * - Role-based access control (USER vs ADMIN)
 * - Data validation and security
 * - Proper HTTP status codes and error handling
 */

/**
 * Mock setup using vi.hoisted() to ensure mocks are available during module hoisting.
 * This is critical for Vitest to properly intercept module imports.
 */
const { prismaMock, requireAuthOr401Mock } = vi.hoisted(() => ({
    prismaMock: {
        transaction: {
            findMany: vi.fn(),
            create: vi.fn(),
        },
    },
    requireAuthOr401Mock: vi.fn(),
}));

/**
 * Mock the Prisma database client.
 * We use vi.hoisted() references to ensure proper mock lifecycle.
 */
vi.mock("@/server/db/prisma", () => ({
    prisma: prismaMock,
}));

/**
 * Mock the authentication middleware.
 * This allows us to control authentication state in tests without relying on real auth services.
 */
vi.mock("@/server/auth/require-auth", () => ({
    requireAuthOr401: (...args: any[]) => requireAuthOr401Mock(...args),
}));

// Import handler after all mocks are set up to ensure proper resolution
import handler from "../../../src/pages/api/v1/transactions";

/**
 * Helper function to create a mock NextApiResponse object.
 * Implements standard Response methods (status, json, send, setHeader, end).
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
 * Helper function to create a mock NextApiRequest object.
 * Allows flexible test setup with partial request properties.
 */
function createReq(partial: Partial<NextApiRequest>) {
    return partial as NextApiRequest;
}

/**
 * Clear all mock state before each test to ensure test isolation.
 * This prevents test pollution and ensures each test starts with a clean slate.
 */
beforeEach(() => {
    vi.clearAllMocks();
});

/**
 * Clean up mock state after each test for consistency.
 */
afterEach(() => {
    vi.clearAllMocks();
});

describe("API /api/v1/transactions", () => {
    /**
     * Test: GET request from regular user (USER role) attempting to view another user's transactions
     * 
     * Expected behavior:
     * - Should return 403 Forbidden
     * - Should NOT execute database query
     * - Should return appropriate error message
     * 
     * Security relevance: Prevents unauthorized data access
     */
    it("GET: returns 403 when USER queries another userId", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "u1", role: "USER" });

        const req = createReq({
            method: "GET",
            query: { userId: "u2" },
        });

        const res = createMockRes();

        await handler(req, res);

        expect(res.statusCode).toBe(403);
        expect(res.body?.error?.message).toBe(ERROR_MESSAGES.ACCESS_DENIED);
        // Verify database was not queried for unauthorized access attempt
        expect(prismaMock.transaction.findMany).not.toHaveBeenCalled();
    });

    /**
     * Test: GET request from user listing their own transactions
     * 
     * Expected behavior:
     * - Should return 200 OK
     * - Should filter transactions by authenticated user's ID
     * - Should apply correct sort order (most recent first)
     * - Should return properly formatted data (amounts as numbers, dates as ISO strings)
     * 
     * Data transformation validation: Ensures API response format consistency
     */
    it("GET: USER can list only their own transactions (no query userId)", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "u1", role: "USER" });

        prismaMock.transaction.findMany.mockResolvedValue([
            {
                id: "t1",
                concept: "Venta",
                amount: 120000, 
                date: new Date("2026-01-31T10:00:00Z"),
                type: "INCOME",
                userId: "u1",
                createdAt: new Date("2026-01-31T10:01:00Z"),
                updatedAt: new Date("2026-01-31T10:01:00Z"),
            },
        ]);

        const req = createReq({
            method: "GET",
            query: {},
        });

        const res = createMockRes();

        await handler(req, res);

        // Verify correct database query parameters
        expect(prismaMock.transaction.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { userId: "u1" },
                orderBy: { date: "desc" },
            })
        );

        // Validate response format and data integrity
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].userId).toBe("u1");
        // Ensure numeric types are preserved (avoiding Decimal serialization issues)
        expect(typeof res.body[0].amount).toBe("number");
        // Ensure dates are serialized as ISO strings for JSON compatibility
        expect(typeof res.body[0].date).toBe("string");
    });

    /**
     * Test: GET request from admin filtering transactions by user ID
     * 
     * Expected behavior:
     * - Should return 200 OK
     * - Should allow filtering by any userId (admin privilege)
     * - Should handle empty result sets gracefully
     * 
     * Permission validation: Ensures admins have higher privileges
     */
    it("GET: ADMIN can filter by userId", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "admin1", role: "ADMIN" });

        prismaMock.transaction.findMany.mockResolvedValue([]);

        const req = createReq({
            method: "GET",
            query: { userId: "u2" },
        });

        const res = createMockRes();

        await handler(req, res);

        // Verify admin can query any user's transactions
        expect(prismaMock.transaction.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { userId: "u2" },
            })
        );

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    /**
     * Test: POST request from user attempting privilege escalation via userId in body
     * 
     * Expected behavior:
     * - Should return 403 Forbidden
     * - Should NOT execute database write
     * - Should prevent userId spoofing attacks
     * 
     * Security critical: Prevents unauthorized transaction creation under another user's identity
     */
    it("POST: returns 403 when USER tries to force another userId via body", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "u1", role: "USER" });

        const req = createReq({
            method: "POST",
            query: {},
            body: {
                concept: "Venta mostrador",
                amount: 120000,
                type: "INCOME",
                userId: "test_admin_001", // malicious attempt
            },
        });

        const res = createMockRes();

        await handler(req, res);

        expect(res.statusCode).toBe(403);
        expect(res.body?.error?.message).toBe(ERROR_MESSAGES.ACCESS_DENIED);
        // Critical: Verify transaction was not created
        expect(prismaMock.transaction.create).not.toHaveBeenCalled();
    });

    /**
     * Test: POST request from user creating transaction with minimal required fields
     * 
     * Expected behavior:
     * - Should return 201 Created
     * - Should assign userId from authenticated session (ignore body)
     * - Should use current date if not provided
     * - Should properly serialize numeric and date fields
     * 
     * Data integrity: Ensures userId is always derived from authentication context
     */
    it("POST: USER creates transaction for self (ignores body userId when not provided)", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "u1", role: "USER" });

        prismaMock.transaction.create.mockResolvedValue({
            id: "t2",
            concept: "Venta mostrador",
            amount: 120000,
            date: new Date("2026-01-31T11:00:00Z"),
            type: "INCOME",
            userId: "u1",
            createdAt: new Date("2026-01-31T11:00:01Z"),
            updatedAt: new Date("2026-01-31T11:00:01Z"),
        });

        const req = createReq({
            method: "POST",
            query: {},
            body: {
                concept: "Venta mostrador",
                amount: 120000,
                type: "INCOME",
            },
        });

        const res = createMockRes();

        await handler(req, res);

        // Verify userId is set from authentication context, not request body
        expect(prismaMock.transaction.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    concept: "Venta mostrador",
                    amount: 120000,
                    type: "INCOME",
                    userId: "u1",
                }),
            })
        );

        expect(res.statusCode).toBe(201);
        expect(res.body.userId).toBe("u1");
        // Type coercion validation for API response
        expect(typeof res.body.amount).toBe("number");
    });

    /**
     * Test: POST request with invalid payload data
     * 
     * Expected behavior:
     * - Should return 400 Bad Request
     * - Should NOT execute database write
     * - Should validate all Zod schema constraints (min length, positive numbers, etc)
     * 
     * Input validation: Ensures data integrity at API boundary
     */
    it("POST: returns 400 on invalid body", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "u1", role: "USER" });

        const req = createReq({
            method: "POST",
            query: {},
            body: {
                concept: "", // Invalid: violates min(1) constraint
                amount: -1,  // Invalid: violates positive() constraint
                type: "INCOME",
            },
        });

        const res = createMockRes();

        await handler(req, res);

        expect(res.statusCode).toBe(400);
        expect(res.body?.error?.message).toBe("Invalid request body");
        // Prevent database pollution from malformed requests
        expect(prismaMock.transaction.create).not.toHaveBeenCalled();
    });

    /**
     * Test: Unauthenticated request handling
     * 
     * Expected behavior:
     * - Authentication middleware should return null
     * - Handler should exit early without database access
     * - No data exposure for unauthenticated clients
     * 
     * Security critical: Ensures authentication is enforced before data access
     */
    it("Does not call prisma when not authenticated (requireAuthOr401 returns null)", async () => {
        // Simulate failed authentication
        requireAuthOr401Mock.mockResolvedValue(null);

        const req = createReq({ method: "GET", query: {} });
        const res = createMockRes();

        await handler(req, res);

        // Critical: Verify no database queries execute without authentication
        expect(prismaMock.transaction.findMany).not.toHaveBeenCalled();
        expect(prismaMock.transaction.create).not.toHaveBeenCalled();
    });
});
