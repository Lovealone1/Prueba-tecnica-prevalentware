import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Test suite for authentication middleware
 * 
 * Covers:
 * - Session validation and retrieval
 * - User lookup in database
 * - Error handling for missing/invalid sessions
 * - Response status codes (401 for unauthorized)
 */

const { prismaMock, authMock } = vi.hoisted(() => ({
    prismaMock: {
        user: {
            findUnique: vi.fn(),
        },
    },
    authMock: {
        api: {
            getSession: vi.fn(),
        },
    },
}));

vi.mock("@/server/db/prisma", () => ({
    prisma: prismaMock,
}));

vi.mock("@/server/auth/auth", () => ({
    auth: authMock,
}));

import { requireAuthOr401 } from "@/server/auth/require-auth";

/**
 * Helper to create mock NextApiResponse with tracking capabilities
 */
function createMockRes() {
    const res: Partial<NextApiResponse> & {
        statusCode?: number;
        body?: any;
    } = {
        status(code: number) {
            res.statusCode = code;
            return res as any;
        },
        json(payload: any) {
            res.body = payload;
            return res as any;
        },
    };
    return res as NextApiResponse & {
        statusCode?: number;
        body?: any;
    };
}

beforeEach(() => {
    vi.clearAllMocks();
});

afterEach(() => {
    vi.clearAllMocks();
});

describe("requireAuthOr401", () => {
    /**
     * Test: Valid authenticated user
     * 
     * Verifies:
     * - Session is retrieved from auth API
     * - User is fetched from database
     * - Returns user object with id and role
     * - No error response is sent
     */
    it("returns authenticated user with valid session", async () => {
        authMock.api.getSession.mockResolvedValue({
            user: {
                id: "user-123",
                email: "test@example.com",
            },
        });

        prismaMock.user.findUnique.mockResolvedValue({
            id: "user-123",
            role: "USER",
        });

        const req = { headers: {} } as NextApiRequest;
        const res = createMockRes();

        const user = await requireAuthOr401(req, res);

        expect(user).toEqual({
            id: "user-123",
            role: "USER",
        });
        expect(res.statusCode).toBeUndefined(); // No error status set
        expect(authMock.api.getSession).toHaveBeenCalled();
        expect(prismaMock.user.findUnique).toHaveBeenCalled();
    });

    /**
     * Test: ADMIN user authentication
     * 
     * Verifies:
     * - Admin role is properly returned
     * - Role is correctly fetched from database
     */
    it("returns ADMIN user role correctly", async () => {
        authMock.api.getSession.mockResolvedValue({
            user: {
                id: "admin-456",
            },
        });

        prismaMock.user.findUnique.mockResolvedValue({
            id: "admin-456",
            role: "ADMIN",
        });

        const req = { headers: {} } as NextApiRequest;
        const res = createMockRes();

        const user = await requireAuthOr401(req, res);

        expect(user?.role).toBe("ADMIN");
        expect(res.statusCode).toBeUndefined();
    });

    /**
     * Test: Missing session
     * 
     * Verifies:
     * - Returns 401 when no session exists
     * - Returns null to caller
     * - Error response is sent with proper code
     */
    it("returns 401 when session is missing", async () => {
        authMock.api.getSession.mockResolvedValue(null);

        const req = { headers: {} } as NextApiRequest;
        const res = createMockRes();

        const user = await requireAuthOr401(req, res);

        expect(user).toBeNull();
        expect(res.statusCode).toBe(401);
        expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    });

    /**
     * Test: Invalid session without user ID
     * 
     * Verifies:
     * - Returns 401 when user ID is missing
     * - Validates session structure properly
     */
    it("returns 401 when session has no user ID", async () => {
        authMock.api.getSession.mockResolvedValue({
            user: null,
        });

        const req = { headers: {} } as NextApiRequest;
        const res = createMockRes();

        const user = await requireAuthOr401(req, res);

        expect(user).toBeNull();
        expect(res.statusCode).toBe(401);
        expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    });

    /**
     * Test: User not found in database
     * 
     * Verifies:
     * - Returns 401 when user exists in session but not in DB
     * - Prevents access with orphaned sessions
     */
    it("returns 401 when user is not found in database", async () => {
        authMock.api.getSession.mockResolvedValue({
            user: {
                id: "deleted-user",
            },
        });

        prismaMock.user.findUnique.mockResolvedValue(null);

        const req = { headers: {} } as NextApiRequest;
        const res = createMockRes();

        const user = await requireAuthOr401(req, res);

        expect(user).toBeNull();
        expect(res.statusCode).toBe(401);
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
            where: { id: "deleted-user" },
            select: { id: true, role: true },
        });
    });

    /**
     * Test: Exception during session retrieval
     * 
     * Verifies:
     * - Graceful error handling for unexpected failures
     * - Returns 401 on any error
     * - Prevents information leakage
     */
    it("returns 401 on auth API error", async () => {
        authMock.api.getSession.mockRejectedValue(new Error("Auth service down"));

        const req = { headers: {} } as NextApiRequest;
        const res = createMockRes();

        const user = await requireAuthOr401(req, res);

        expect(user).toBeNull();
        expect(res.statusCode).toBe(401);
    });

    /**
     * Test: Exception during database lookup
     * 
     * Verifies:
     * - Database errors are handled safely
     * - Returns 401 on database failures
     */
    it("returns 401 on database error", async () => {
        authMock.api.getSession.mockResolvedValue({
            user: {
                id: "user-789",
            },
        });

        prismaMock.user.findUnique.mockRejectedValue(new Error("DB connection lost"));

        const req = { headers: {} } as NextApiRequest;
        const res = createMockRes();

        const user = await requireAuthOr401(req, res);

        expect(user).toBeNull();
        expect(res.statusCode).toBe(401);
    });

    /**
     * Test: Session headers are passed correctly
     * 
     * Verifies:
     * - Request headers are forwarded to auth API
     * - Session retrieval receives proper context
     */
    it("passes request headers to getSession", async () => {
        authMock.api.getSession.mockResolvedValue({
            user: {
                id: "user-999",
            },
        });

        prismaMock.user.findUnique.mockResolvedValue({
            id: "user-999",
            role: "USER",
        });

        const req = {
            headers: {
                authorization: "Bearer token123",
                cookie: "session=abc",
            },
        } as NextApiRequest;

        const res = createMockRes();

        await requireAuthOr401(req, res);

        expect(authMock.api.getSession).toHaveBeenCalledWith({
            headers: expect.objectContaining({
                authorization: "Bearer token123",
                cookie: "session=abc",
            }),
        });
    });
});
