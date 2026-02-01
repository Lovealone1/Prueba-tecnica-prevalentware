import type { NextApiRequest, NextApiResponse } from "next";
import { jsonError } from "@/server/http/json-error";
import { requireAuthOr401 } from "@/server/auth/require-auth";
import { requireRoleOr403 } from "@/server/auth/require-role";
import { ERROR_MESSAGES } from "@/server/http/errors";

import { FinancialMovementsQuerySchema } from "@/server/schemas/report.schema";
import { buildFinancialMovementsReport } from "@/server/reports/financial-reports";
import { financialMovementsReportToCsv } from "@/server/reports/financial-report-csv";

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

    try {
        const report = await buildFinancialMovementsReport({ from, to, granularity });
        const csv = financialMovementsReportToCsv(report);

        const fileName = `financial-movements-${granularity}.csv`;

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

        return res.status(200).send(csv);
    } catch {
        return jsonError(res, 500, "Failed to generate CSV report");
    }
}
