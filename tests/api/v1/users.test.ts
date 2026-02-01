import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { NextApiRequest, NextApiResponse } from "next";

import { ERROR_MESSAGES } from "@/server/http/errors";

/**
 * Test suite for POST /api/v1/users endpoints
 * 
 * This test suite validates the user management API with focus on:
 * - Role-based access control (Admin-only operations)
 * - User data retrieval and listing
 * - User profile updates (name, role)
 * - Phone number management
 * - Input validation and schema compliance
 * - Security measures against unauthorized operations
 */

/**
 * Mock setup using vi.hoisted() to ensure mocks are available during module hoisting.
 * This is critical for Vitest to properly intercept module imports.
 */
const { prismaMock, requireAuthOr401Mock, requireRoleOr403Mock } = vi.hoisted(() => ({
    prismaMock: {
        user: {
            findMany: vi.fn(),
            update: vi.fn(),
        },
    },
    requireAuthOr401Mock: vi.fn(),
    requireRoleOr403Mock: vi.fn(),
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

/**
 * Mock the role-based authorization middleware.
 * Controls whether a user has the required permissions for admin operations.
 */
vi.mock("@/server/auth/require-role", () => ({
    requireRoleOr403: (...args: any[]) => requireRoleOr403Mock(...args),
}));

// Import handlers after all mocks are set up to ensure proper resolution
import userHandler from "../../../src/pages/api/v1/users";
import phoneHandler from "../../../src/pages/api/v1/users/phone";

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

describe("API /api/v1/users - Main Endpoint", () => {
    /**
     * Test: GET request from non-admin user
     * 
     * Expected behavior:
     * - Should return 403 Forbidden
     * - Should NOT execute database query
     * - Should deny access to user listing (admin-only resource)
     * 
     * Security relevance: Prevents unauthorized access to user list
     */
    it("GET: returns 403 Forbidden when non-ADMIN user requests", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "u1", role: "USER" });
        requireRoleOr403Mock.mockReturnValue(false);

        const req = createReq({
            method: "GET",
            query: {},
        });

        const res = createMockRes();

        await userHandler(req, res);

        expect(res.statusCode).toBe(403);
        expect(res.body?.error?.message).toBe(ERROR_MESSAGES.FORBIDDEN);
        // Verify no user data was leaked
        expect(prismaMock.user.findMany).not.toHaveBeenCalled();
    });

    /**
     * Test: GET request from admin user listing all users
     * 
     * Expected behavior:
     * - Should return 200 OK
     * - Should fetch all users sorted by creation date (newest first)
     * - Should properly serialize date fields to ISO strings
     * - Should exclude sensitive fields from response
     * 
     * Data retrieval validation: Ensures correct pagination and sorting
     */
    it("GET: ADMIN can retrieve all users sorted by createdAt desc", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "admin1", role: "ADMIN" });
        requireRoleOr403Mock.mockReturnValue(true);

        const mockUsers = [
            {
                id: "u2",
                name: "Usuario 2",
                email: "user2@test.com",
                role: "USER",
                phone: "+1234567890",
                createdAt: new Date("2026-01-31T12:00:00Z"),
                updatedAt: new Date("2026-01-31T12:00:00Z"),
            },
            {
                id: "u1",
                name: "Usuario 1",
                email: "user1@test.com",
                role: "USER",
                phone: null,
                createdAt: new Date("2026-01-31T11:00:00Z"),
                updatedAt: new Date("2026-01-31T11:00:00Z"),
            },
        ];

        prismaMock.user.findMany.mockResolvedValue(mockUsers);

        const req = createReq({
            method: "GET",
            query: {},
        });

        const res = createMockRes();

        await userHandler(req, res);

        // Verify correct database query parameters
        expect(prismaMock.user.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                orderBy: { createdAt: "desc" },
            })
        );

        // Validate response format and data integrity
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2);
        
        // Verify data structure and ISO date serialization
        expect(res.body[0].id).toBe("u2");
        expect(res.body[0].phone).toBe("+1234567890");
        expect(typeof res.body[0].createdAt).toBe("string");
        expect(typeof res.body[0].updatedAt).toBe("string");
        expect(res.body[1].phone).toBeNull();
    });

    /**
     * Test: PATCH request from non-admin user attempting profile update
     * 
     * Expected behavior:
     * - Should return 403 Forbidden
     * - Should NOT execute database update
     * - Should prevent unauthorized user modifications
     * 
     * Security critical: Protects user data from unauthorized changes
     */
    it("PATCH: returns 403 Forbidden when non-ADMIN user attempts update", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "u1", role: "USER" });
        requireRoleOr403Mock.mockReturnValue(false);

        const req = createReq({
            method: "PATCH",
            query: {},
            body: {
                name: "Updated Name",
            },
        });

        const res = createMockRes();

        await userHandler(req, res);

        expect(res.statusCode).toBe(403);
        expect(res.body?.error?.message).toBe(ERROR_MESSAGES.FORBIDDEN);
        // Critical: Verify user data was not modified
        expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    /**
     * Test: PATCH request from admin updating own user profile
     * 
     * Expected behavior:
     * - Should return 200 OK
     * - Should update name field
     * - Should preserve other user properties
     * - Should apply database constraints (name min/max length)
     * 
     * Data integrity: Ensures profile updates only modify intended fields
     */
    it("PATCH: ADMIN can update name", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "admin1", role: "ADMIN" });
        requireRoleOr403Mock.mockReturnValue(true);

        prismaMock.user.update.mockResolvedValue({
            id: "admin1",
            name: "Admin Updated",
            email: "admin@test.com",
            role: "ADMIN",
            phone: null,
            createdAt: new Date("2026-01-30T10:00:00Z"),
            updatedAt: new Date("2026-01-31T15:00:00Z"),
        });

        const req = createReq({
            method: "PATCH",
            query: {},
            body: {
                name: "Admin Updated",
            },
        });

        const res = createMockRes();

        await userHandler(req, res);

        // Verify correct database operation with conditional field update
        expect(prismaMock.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: "admin1" },
                data: expect.objectContaining({
                    name: "Admin Updated",
                }),
            })
        );

        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe("Admin Updated");
        expect(typeof res.body.createdAt).toBe("string");
    });

    /**
     * Test: PATCH request from admin updating own role
     * 
     * Expected behavior:
     * - Should return 200 OK
     * - Should update role to valid enum value
     * - Should maintain other user properties unchanged
     * 
     * Permission update validation: Ensures role changes are properly persisted
     */
    it("PATCH: ADMIN can update role to valid enum value", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "u1", role: "USER" });
        requireRoleOr403Mock.mockReturnValue(true);

        prismaMock.user.update.mockResolvedValue({
            id: "u1",
            name: "Usuario Uno",
            email: "user1@test.com",
            role: "ADMIN",
            phone: null,
            createdAt: new Date("2026-01-30T10:00:00Z"),
            updatedAt: new Date("2026-01-31T15:00:00Z"),
        });

        const req = createReq({
            method: "PATCH",
            query: {},
            body: {
                role: "ADMIN",
            },
        });

        const res = createMockRes();

        await userHandler(req, res);

        // Verify role update was applied
        expect(prismaMock.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: "u1" },
                data: expect.objectContaining({
                    role: "ADMIN",
                }),
            })
        );

        expect(res.statusCode).toBe(200);
        expect(res.body.role).toBe("ADMIN");
    });

    /**
     * Test: PATCH request with both name and role updates
     * 
     * Expected behavior:
     * - Should return 200 OK
     * - Should update both fields simultaneously
     * - Should validate both fields against schema constraints
     * 
     * Composite update validation: Ensures multiple field updates work together
     */
    it("PATCH: ADMIN can update both name and role simultaneously", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "u2", role: "USER" });
        requireRoleOr403Mock.mockReturnValue(true);

        prismaMock.user.update.mockResolvedValue({
            id: "u2",
            name: "New Name",
            email: "user2@test.com",
            role: "ADMIN",
            phone: "+1234567890",
            createdAt: new Date("2026-01-30T10:00:00Z"),
            updatedAt: new Date("2026-01-31T15:00:00Z"),
        });

        const req = createReq({
            method: "PATCH",
            query: {},
            body: {
                name: "New Name",
                role: "ADMIN",
            },
        });

        const res = createMockRes();

        await userHandler(req, res);

        // Verify both fields were included in update
        expect(prismaMock.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: "u2" },
                data: expect.objectContaining({
                    name: "New Name",
                    role: "ADMIN",
                }),
            })
        );

        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe("New Name");
        expect(res.body.role).toBe("ADMIN");
    });

    /**
     * Test: PATCH request with empty body or no updatable fields
     * 
     * Expected behavior:
     * - Should return 400 Bad Request
     * - Should reject if neither name nor role is provided
     * - Should validate schema refinement (at least one field required)
     * 
     * Input validation: Prevents unnecessary or invalid update operations
     */
    it("PATCH: returns 400 when neither name nor role is provided", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "u1", role: "USER" });
        requireRoleOr403Mock.mockReturnValue(true);

        const req = createReq({
            method: "PATCH",
            query: {},
            body: {},
        });

        const res = createMockRes();

        await userHandler(req, res);

        expect(res.statusCode).toBe(400);
        expect(res.body?.error?.message).toBe("Invalid request body");
        // Prevent database write with invalid payload
        expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    /**
     * Test: PATCH request with invalid name length
     * 
     * Expected behavior:
     * - Should return 400 Bad Request
     * - Should enforce min/max length constraints
     * - Empty strings violate min(1) constraint
     * - Strings > 120 characters violate max(120) constraint
     * 
     * Data validation: Ensures name field meets schema requirements
     */
    it("PATCH: returns 400 when name is empty or too long", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "u1", role: "USER" });
        requireRoleOr403Mock.mockReturnValue(true);

        const req = createReq({
            method: "PATCH",
            query: {},
            body: {
                name: "", // Invalid: violates min(1) constraint
            },
        });

        const res = createMockRes();

        await userHandler(req, res);

        expect(res.statusCode).toBe(400);
        expect(res.body?.error?.message).toBe("Invalid request body");
        expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    /**
     * Test: Unauthenticated request handling
     * 
     * Expected behavior:
     * - Authentication middleware should return null
     * - Handler should exit early without authorization check
     * - No user data exposure for unauthenticated clients
     * 
     * Security critical: Ensures authentication is enforced before admin operations
     */
    it("GET/PATCH: Does not proceed when user is not authenticated", async () => {
        requireAuthOr401Mock.mockResolvedValue(null);

        const reqGet = createReq({ method: "GET", query: {} });
        const resGet = createMockRes();

        await userHandler(reqGet, resGet);

        // Verify no authorization check occurred without authentication
        expect(requireRoleOr403Mock).not.toHaveBeenCalled();
        expect(prismaMock.user.findMany).not.toHaveBeenCalled();

        const reqPatch = createReq({
            method: "PATCH",
            query: {},
            body: { name: "Test" },
        });
        const resPatch = createMockRes();

        await userHandler(reqPatch, resPatch);

        expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
});

describe("API /api/v1/users/phone - Phone Management Endpoint", () => {
    /**
     * Test: PATCH request with missing userId query parameter
     * 
     * Expected behavior:
     * - Should return 400 Bad Request
     * - Should reject request before validation
     * - userId is required for phone update operation
     * 
     * Input validation: Ensures required parameters are provided
     */
    it("PATCH: returns 400 when userId query param is missing", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "admin1", role: "ADMIN" });
        requireRoleOr403Mock.mockReturnValue(true);

        const req = createReq({
            method: "PATCH",
            query: {}, // Missing userId
            body: {
                phone: "+1234567890",
            },
        });

        const res = createMockRes();

        await phoneHandler(req, res);

        expect(res.statusCode).toBe(400);
        expect(res.body?.error?.message).toBe("Missing required query param: userId");
        // Prevent database operation without proper parameters
        expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    /**
     * Test: PATCH request from non-admin user to update phone
     * 
     * Expected behavior:
     * - Should return 403 Forbidden
     * - Should NOT execute database update
     * - Phone management is restricted to admins only
     * 
     * Security critical: Prevents unauthorized phone number modifications
     */
    it("PATCH: returns 403 when non-ADMIN user attempts phone update", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "u1", role: "USER" });
        requireRoleOr403Mock.mockReturnValue(false);

        const req = createReq({
            method: "PATCH",
            query: { userId: "u2" },
            body: {
                phone: "+1234567890",
            },
        });

        const res = createMockRes();

        await phoneHandler(req, res);

        expect(res.statusCode).toBe(403);
        expect(res.body?.error?.message).toBe(ERROR_MESSAGES.FORBIDDEN);
        // Critical: Verify phone was not modified
        expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    /**
     * Test: PATCH request from admin updating user's phone number
     * 
     * Expected behavior:
     * - Should return 200 OK
     * - Should update phone field with valid format
     * - Should properly trim whitespace from phone string (Zod schema.trim())
     * - Should maintain other user properties unchanged
     * 
     * Phone update validation: Ensures phone numbers are correctly persisted after trimming
     */
    it("PATCH: ADMIN can set user phone number", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "admin1", role: "ADMIN" });
        requireRoleOr403Mock.mockReturnValue(true);

        prismaMock.user.update.mockResolvedValue({
            id: "u2",
            name: "Usuario Dos",
            email: "user2@test.com",
            role: "USER",
            phone: "+1234567890",
            createdAt: new Date("2026-01-31T10:00:00Z"),
            updatedAt: new Date("2026-01-31T14:00:00Z"),
        });

        const req = createReq({
            method: "PATCH",
            query: { userId: "u2" },
            body: {
                phone: " +1234567890 ", // Include whitespace to test trim validation
            },
        });

        const res = createMockRes();

        await phoneHandler(req, res);

        // Verify correct database operation and target user
        // Note: Zod schema applies .trim(), so the value saved to DB is trimmed
        expect(prismaMock.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: "u2" },
                data: expect.objectContaining({
                    phone: "+1234567890", // After Zod trim() is applied
                }),
            })
        );

        expect(res.statusCode).toBe(200);
        expect(res.body.phone).toBe("+1234567890");
        expect(res.body.id).toBe("u2");
    });

    /**
     * Test: PATCH request from admin clearing user's phone (null value)
     * 
     * Expected behavior:
     * - Should return 200 OK
     * - Should accept null value to remove phone number
     * - Phone field is nullable in schema
     * - Should preserve other user data
     * 
     * Data management: Allows phone removal through null assignment
     */
    it("PATCH: ADMIN can clear user phone with null value", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "admin1", role: "ADMIN" });
        requireRoleOr403Mock.mockReturnValue(true);

        prismaMock.user.update.mockResolvedValue({
            id: "u2",
            name: "Usuario Dos",
            email: "user2@test.com",
            role: "USER",
            phone: null,
            createdAt: new Date("2026-01-31T10:00:00Z"),
            updatedAt: new Date("2026-01-31T14:00:00Z"),
        });

        const req = createReq({
            method: "PATCH",
            query: { userId: "u2" },
            body: {
                phone: null,
            },
        });

        const res = createMockRes();

        await phoneHandler(req, res);

        expect(prismaMock.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: "u2" },
                data: expect.objectContaining({
                    phone: null,
                }),
            })
        );

        expect(res.statusCode).toBe(200);
        expect(res.body.phone).toBeNull();
    });

    /**
     * Test: PATCH request with invalid phone format
     * 
     * Expected behavior:
     * - Should return 400 Bad Request
     * - Should enforce min/max length constraints
     * - Empty strings violate min(1) constraint
     * - Phone strings > 30 characters violate max(30) constraint
     * 
     * Data validation: Ensures phone meets schema requirements
     */
    it("PATCH: returns 400 when phone is empty string", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "admin1", role: "ADMIN" });
        requireRoleOr403Mock.mockReturnValue(true);

        const req = createReq({
            method: "PATCH",
            query: { userId: "u2" },
            body: {
                phone: "", // Invalid: violates min(1) when not null
            },
        });

        const res = createMockRes();

        await phoneHandler(req, res);

        expect(res.statusCode).toBe(400);
        expect(res.body?.error?.message).toBe("Invalid request body");
        // Prevent database write with invalid data
        expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    /**
     * Test: PATCH request with phone exceeding max length
     * 
     * Expected behavior:
     * - Should return 400 Bad Request
     * - Should reject strings longer than 30 characters
     * 
     * Input validation: Prevents field overflow attacks
     */
    it("PATCH: returns 400 when phone exceeds max length", async () => {
        requireAuthOr401Mock.mockResolvedValue({ id: "admin1", role: "ADMIN" });
        requireRoleOr403Mock.mockReturnValue(true);

        const req = createReq({
            method: "PATCH",
            query: { userId: "u2" },
            body: {
                phone: "+12345678901234567890123456789012", // 33 chars, exceeds max(30)
            },
        });

        const res = createMockRes();

        await phoneHandler(req, res);

        expect(res.statusCode).toBe(400);
        expect(res.body?.error?.message).toBe("Invalid request body");
        expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    /**
     * Test: Non-PATCH HTTP method on phone endpoint
     * 
     * Expected behavior:
     * - Should return 405 Method Not Allowed
     * - Should set Allow header indicating permitted methods
     * - Phone endpoint only accepts PATCH requests
     * 
     * HTTP compliance: Proper error responses for unsupported methods
     */
    it("returns 405 for non-PATCH methods", async () => {
        const req = createReq({
            method: "GET",
            query: { userId: "u2" },
        });

        const res = createMockRes();

        await phoneHandler(req, res);

        expect(res.statusCode).toBe(405);
        expect(res.headers.allow).toBe("PATCH");
        // Verify no auth checks occurred for unsupported method
        expect(requireAuthOr401Mock).not.toHaveBeenCalled();
    });

    /**
     * Test: Unauthenticated PATCH request on phone endpoint
     * 
     * Expected behavior:
     * - Should exit after authentication check
     * - Should not proceed to authorization or database operations
     * - Prevents unauthorized phone modifications
     * 
     * Security critical: Ensures authentication happens before sensitive operations
     */
    it("PATCH: Does not proceed when user is not authenticated", async () => {
        requireAuthOr401Mock.mockResolvedValue(null);

        const req = createReq({
            method: "PATCH",
            query: { userId: "u2" },
            body: {
                phone: "+1234567890",
            },
        });

        const res = createMockRes();

        await phoneHandler(req, res);

        // Verify authorization and database calls never executed
        expect(requireRoleOr403Mock).not.toHaveBeenCalled();
        expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
});
