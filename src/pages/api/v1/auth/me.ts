import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db/prisma";
import { requireAuthOr401 } from "@/server/auth/require-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).end();
    }

    const authUser = await requireAuthOr401(req, res);
    if (!authUser) return;

    const user = await prisma.user.findUnique({
        where: { id: authUser.id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    });
}
