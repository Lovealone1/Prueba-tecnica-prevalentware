import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db/prisma";
import { jsonError } from "@/server/http/json-error";
import { auth } from "@/server/auth/auth";

export type AuthUser = {
    id: string;
    role: "ADMIN" | "USER";
};

export async function requireAuthOr401(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<AuthUser | null> {
    try {
        const session = await auth.api.getSession({
            headers: req.headers as any,
        });

        if (!session?.user?.id) {
            jsonError(res, 401, "Unauthorized");
            return null;
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, role: true },
        });

        if (!user) {
            jsonError(res, 401, "Unauthorized");
            return null;
        }

        return {
            id: user.id,
            role: user.role,
        };
    } catch {
        jsonError(res, 401, "Unauthorized");
        return null;
    }
}
