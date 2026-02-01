import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { NextApiResponse } from "next";

/**
 * Test suite for role-based access control middleware
 * 
 * Covers:
 * - Role authorization checks
 * - Single role validation
 * - Multiple role validation
 * - Access denial (403 responses)
 * - Error messages
 */

import { requireRoleOr403 } from "@/server/auth/require-role";
import type { AuthUser } from "@/server/auth/require-auth";

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

describe("requireRoleOr403", () => {
    /**
     * Test: ADMIN user accessing ADMIN-only resource
     * 
     * Verifies:
     * - Admin role is authorized for admin resources
     * - Returns true (access granted)
     * - No error response is sent
     */
    it("grants access to ADMIN user for ADMIN-only resource", () => {
        const res = createMockRes();
        const user: AuthUser = {
            id: "admin-123",
            role: "ADMIN",
        };

        const result = requireRoleOr403(res, user, ["ADMIN"]);

        expect(result).toBe(true);
        expect(res.statusCode).toBeUndefined(); // No error status
    });

    /**
     * Test: USER role denied ADMIN access
     * 
     * Verifies:
     * - Regular users cannot access admin resources
     * - Returns false (access denied)
     * - Returns 403 Forbidden status
     */
    it("denies access to USER for ADMIN-only resource", () => {
        const res = createMockRes();
        const user: AuthUser = {
            id: "user-456",
            role: "USER",
        };

        const result = requireRoleOr403(res, user, ["ADMIN"]);

        expect(result).toBe(false);
        expect(res.statusCode).toBe(403);
    });

    /**
     * Test: USER accessing USER-allowed resource
     * 
     * Verifies:
     * - Users can access their own role resources
     * - Returns true for matching roles
     */
    it("grants access to USER for USER-allowed resource", () => {
        const res = createMockRes();
        const user: AuthUser = {
            id: "user-789",
            role: "USER",
        };

        const result = requireRoleOr403(res, user, ["USER"]);

        expect(result).toBe(true);
        expect(res.statusCode).toBeUndefined();
    });

    /**
     * Test: Multiple roles - user has one of them
     * 
     * Verifies:
     * - Access is granted when user role is in allowed list
     * - Works with multiple roles
     */
    it("grants access when user role is in allowed roles list", () => {
        const res = createMockRes();
        const user: AuthUser = {
            id: "user-222",
            role: "USER",
        };

        const result = requireRoleOr403(res, user, ["ADMIN", "USER"]);

        expect(result).toBe(true);
        expect(res.statusCode).toBeUndefined();
    });

    /**
     * Test: ADMIN user accessing multi-role resource containing ADMIN
     * 
     * Verifies:
     * - Admin role is recognized in multi-role lists
     */
    it("grants ADMIN access when ADMIN is in allowed roles", () => {
        const res = createMockRes();
        const user: AuthUser = {
            id: "admin-333",
            role: "ADMIN",
        };

        const result = requireRoleOr403(res, user, ["USER", "ADMIN"]);

        expect(result).toBe(true);
        expect(res.statusCode).toBeUndefined();
    });

    /**
     * Test: USER denied when only ADMIN is allowed
     * 
     * Verifies:
     * - Access is denied when role not in allowed list
     * - Returns 403 even in multi-role scenarios
     */
    it("denies USER access when only ADMIN is allowed", () => {
        const res = createMockRes();
        const user: AuthUser = {
            id: "user-444",
            role: "USER",
        };

        const result = requireRoleOr403(res, user, ["ADMIN"]);

        expect(result).toBe(false);
        expect(res.statusCode).toBe(403);
    });

    /**
     * Test: Empty roles list (no one allowed)
     * 
     * Verifies:
     * - Empty allowed roles denies everyone
     * - Even admin is denied with empty list
     */
    it("denies access when allowed roles list is empty", () => {
        const res = createMockRes();
        const user: AuthUser = {
            id: "admin-555",
            role: "ADMIN",
        };

        const result = requireRoleOr403(res, user, []);

        expect(result).toBe(false);
        expect(res.statusCode).toBe(403);
    });

    /**
     * Test: Error response contains proper message
     * 
     * Verifies:
     * - Error response includes meaningful message
     * - Status code is 403
     */
    it("includes error message in 403 response", () => {
        const res = createMockRes();
        const user: AuthUser = {
            id: "user-666",
            role: "USER",
        };

        requireRoleOr403(res, user, ["ADMIN"]);

        expect(res.statusCode).toBe(403);
        expect(res.body).toBeDefined();
    });

    /**
     * Test: Case sensitivity of role matching
     * 
     * Verifies:
     * - Role matching is case-sensitive
     * - "admin" !== "ADMIN"
     */
    it("matches roles with case sensitivity", () => {
        const res = createMockRes();
        const user: AuthUser = {
            id: "user-777",
            role: "USER",
        };

        // USER should not match "user" (lowercase)
        const result = requireRoleOr403(res, user, ["user" as any]);

        expect(result).toBe(false);
        expect(res.statusCode).toBe(403);
    });

    /**
     * Test: Authorization with many roles (future extensibility)
     * 
     * Verifies:
     * - System handles lists of many roles
     * - Scales to multiple role support
     */
    it("works with multiple roles in allowed list", () => {
        const res = createMockRes();
        const user: AuthUser = {
            id: "admin-888",
            role: "ADMIN",
        };

        const result = requireRoleOr403(res, user, [
            "ADMIN",
            "USER",
        ]);

        expect(result).toBe(true);
        expect(res.statusCode).toBeUndefined();
    });
});
