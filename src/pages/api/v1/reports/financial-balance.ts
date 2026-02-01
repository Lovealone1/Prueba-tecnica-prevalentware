import type { NextApiRequest, NextApiResponse } from "next";
import { jsonError } from "@/server/http/json-error";
import { requireAuthOr401 } from "@/server/auth/require-auth";
import { requireRoleOr403 } from "@/server/auth/require-role";
import { ERROR_MESSAGES } from "@/server/http/errors";
import { buildFinancialBalanceReport } from "@/server/reports/financial-balance-report";

/**
 * Retrieves the current financial balance for authenticated admin users.
 * 
 * Returns aggregated totals of all income and expense transactions
 * with calculated net balance and report timestamp.
 * 
 * Admin-only endpoint. Prevents unauthorized access to financial summaries.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).end();
    }

    const authUser = await requireAuthOr401(req, res);
    if (!authUser) return;

    // Admin-only access (consistent with other report endpoints)
    if (!requireRoleOr403(res, authUser, ["ADMIN"])) {
        return jsonError(res, 403, ERROR_MESSAGES.FORBIDDEN);
    }

    try {
        const data = await buildFinancialBalanceReport();
        return res.status(200).json(data);
    } catch {
        return jsonError(res, 500, "Failed to get current balance");
    }
}
