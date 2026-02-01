import type { NextApiRequest, NextApiResponse } from "next";
import { jsonError } from "@/server/http/json-error";
import { requireAuthOr401 } from "@/server/auth/require-auth";
import { requireRoleOr403 } from "@/server/auth/require-role";
import { ERROR_MESSAGES } from "@/server/http/errors";
import { buildFinancialBalanceReport } from "@/server/reports/financial-balance-report";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).end();
    }

    const authUser = await requireAuthOr401(req, res);
    if (!authUser) return;

    // Admin only (igual que los otros reports)
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
