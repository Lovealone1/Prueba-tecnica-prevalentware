import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db/prisma";
import { jsonError } from "@/server/http/json-error";
import { FinancialMovementsQuerySchema } from "@/server/schemas/report.schema";
import { buildFinancialMovementsReport } from "@/server/reports/financial-reports";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).end();
    }

    const parsed = FinancialMovementsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        return jsonError(res, 400, "Invalid query params", parsed.error.flatten());
    }

    const { userId, from, to, granularity } = parsed.data;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
    });

    if (!user) return jsonError(res, 404, "User not found");
    if (user.role !== "ADMIN") return jsonError(res, 403, "Forbidden");

    try {
        const report = await buildFinancialMovementsReport({
            from,
            to,
            granularity,
        });

        return res.status(200).json(report);
    } catch {
        return jsonError(res, 500, "Failed to generate report");
    }
}
