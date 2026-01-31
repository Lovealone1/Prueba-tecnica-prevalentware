import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db/prisma";
import { jsonError } from "@/server/http/json-error";
import { SetUserPhoneSchema } from "@/server/schemas/user.schema";
import { requireAuthOr401 } from "@/server/auth/require-auth";
import { requireRoleOr403 } from "@/server/auth/require-role";
import { ERROR_MESSAGES } from "@/server/http/errors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "PATCH") {
        res.setHeader("Allow", "PATCH");
        return res.status(405).end();
    }

    const authUser = await requireAuthOr401(req, res);
    if (!authUser) return;

    // ADMIN only
    if (!requireRoleOr403(res, authUser, ["ADMIN"])) {
        return jsonError(res, 403, ERROR_MESSAGES.FORBIDDEN);
    }

    const userId = typeof req.query.userId === "string" ? req.query.userId : undefined;
    if (!userId) {
        return jsonError(res, 400, "Missing required query param: userId");
    }

    const parsed = SetUserPhoneSchema.safeParse(req.body);
    if (!parsed.success) {
        return jsonError(
            res,
            400,
            "Invalid request body",
            parsed.error.flatten()
        );
    }

    const { phone } = parsed.data;

    try {
        const updated = await prisma.user.update({
            where: { id: userId },
            data: { phone },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return res.status(200).json({
            ...updated,
            createdAt: updated.createdAt.toISOString(),
            updatedAt: updated.updatedAt.toISOString(),
        });
    } catch {
        return jsonError(res, 500, "Failed to update user phone");
    }
}
