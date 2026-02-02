import type { NextApiRequest, NextApiResponse } from "next";
import { jsonError } from "@/server/http/json-error";
import { requireAuthOr401 } from "@/server/auth/require-auth";
import { requireRoleOr403 } from "@/server/auth/require-role";
import { ERROR_MESSAGES } from "@/server/http/errors";
import { FinancialMovementsQuerySchema } from "@/server/schemas/report.schema";

import { buildFinancialMovementsChart } from "@/server/reports/financial-movements-chart";
import { requireIsoRange } from "@/server/http/query-normalizer";
import { normalizeFinancialGranularity } from "@/server/reports/financial-granularity";

/**
 * Generates financial movements chart data for authenticated admin users.
 * 
 * GET request with query parameters:
 * - from: ISO 8601 start date
 * - to: ISO 8601 end date
 * - granularity: day | month | all
 * 
 * Returns aggregated transaction data grouped by time period.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).end();
    }

    const authUser = await requireAuthOr401(req, res);
    if (!authUser) return;

    if (!requireRoleOr403(res, authUser, ["ADMIN"])) {
        return jsonError(res, 403, ERROR_MESSAGES.FORBIDDEN);
    }

    const parsed = FinancialMovementsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        return jsonError(res, 400, "Invalid query params", parsed.error.flatten());
    }

    const { from, to, granularity } = parsed.data;

    const range = requireIsoRange({ from, to });
    if (!range) {
        return jsonError(res, 400, "Invalid date range", {
            from: "from is required and must be a valid date",
            to: "to is required and must be a valid date",
        });
    }

    try {
        const data = await buildFinancialMovementsChart({
            from: range.fromIso,
            to: range.toIso,
            granularity: normalizeFinancialGranularity(granularity),
        });

        return res.status(200).json(data);
    } catch (error) {
        // Handle date range validation errors
        if (error instanceof Error && error.message.includes("Invalid date range")) {
            return jsonError(res, 400, error.message);
        }
        return jsonError(res, 500, "Failed to generate chart data");
    }
}
