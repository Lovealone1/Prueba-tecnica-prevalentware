import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db/prisma";
import { jsonError } from "@/server/http/json-error";
import { UpdateUserSchema } from "@/server/schemas/user.schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "PATCH") {
        res.setHeader("Allow", "PATCH");
        return res.status(405).end();
    }

    const userId = typeof req.query.userId === "string" ? req.query.userId : undefined;
    if (!userId) {
        return jsonError(res, 400, "Missing required query param: userId");
    }

    const parsed = UpdateUserSchema.safeParse(req.body);
    if (!parsed.success) {
        return jsonError(res, 400, "Invalid request body", parsed.error.flatten());
    }

    const { name, role } = parsed.data;

    try {
        const updated = await prisma.user.update({
            where: { id: userId },
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
