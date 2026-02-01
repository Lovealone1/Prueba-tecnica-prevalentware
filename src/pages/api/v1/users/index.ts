import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db/prisma";
import { jsonError } from "@/server/http/json-error";
import { UpdateUserSchema } from "@/server/schemas/user.schema";
import { requireAuthOr401 } from "@/server/auth/require-auth";
import { requireRoleOr403 } from "@/server/auth/require-role";
import { ERROR_MESSAGES } from "@/server/http/errors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const authUser = await requireAuthOr401(req, res);
    if (!authUser) return;

    // ADMIN only
    if (!requireRoleOr403(res, authUser, ["ADMIN"])) {
        return jsonError(res, 403, ERROR_MESSAGES.FORBIDDEN);
    }

    if (req.method === "GET") {
        try {
            const users = await prisma.user.findMany({
                orderBy: { createdAt: "desc" },
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

            return res.status(200).json(
                users.map((u) => ({
                    ...u,
                    createdAt: u.createdAt.toISOString(),
                    updatedAt: u.updatedAt.toISOString(),
                }))
            );
        } catch {
            return jsonError(res, 500, "Failed to fetch users");
        }
    }

    if (req.method === "PATCH") {
        const parsed = UpdateUserSchema.safeParse(req.body);
        if (!parsed.success) {
            return jsonError(
                res,
                400,
                "Invalid request body",
                parsed.error.flatten()
            );
        }

        const { name, role } = parsed.data;

        try {
            const updated = await prisma.user.update({
                where: { id: authUser.id },
                data: {
                    ...(name !== undefined ? { name } : {}),
                    ...(role !== undefined ? { role } : {}),
                },
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
            return jsonError(res, 500, "Failed to update user");
        }
    }

    res.setHeader("Allow", "GET, PATCH");
    return res.status(405).end();
}
