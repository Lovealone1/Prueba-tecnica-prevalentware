import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db/prisma";
import { CreateTransactionSchema } from "@/server/schemas/transaction.schema";
import { jsonError } from "@/server/http/json-error";
import { requireAuthOr401 } from "@/server/auth/require-auth";
import { ERROR_MESSAGES } from "@/server/http/errors";

function translateType(type: "EXPENSE" | "INCOME") {
    return type === "EXPENSE" ? "gasto" : "ingreso";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const authUser = await requireAuthOr401(req, res);
    if (!authUser) return;

    if (req.method === "GET") {
        const queryUserId =
            typeof req.query.userId === "string" ? req.query.userId : undefined;

        if (authUser.role === "USER" && queryUserId && queryUserId !== authUser.id) {
            return jsonError(res, 403, ERROR_MESSAGES.ACCESS_DENIED);
        }

        const where =
            authUser.role === "ADMIN"
                ? queryUserId
                    ? { userId: queryUserId }
                    : undefined
                : { userId: authUser.id };

        try {
            const list = await prisma.transaction.findMany({
                where,
                orderBy: { date: "desc" },
                select: {
                    id: true,
                    concept: true,
                    amount: true,
                    date: true,
                    type: true,
                    createdAt: true,
                    updatedAt: true,
                    user: { select: { name: true } },
                },
            });

            return res.status(200).json(
                list.map((t) => ({
                    id: t.id,
                    concept: t.concept,
                    amount: Number(t.amount),
                    date: t.date.toISOString(),
                    type: translateType(t.type),
                    name: t.user?.name ?? "",
                    createdAt: t.createdAt.toISOString(),
                    updatedAt: t.updatedAt.toISOString(),
                }))
            );
        } catch {
            return jsonError(res, 500, "Failed to fetch transactions");
        }
    }

    if (req.method === "POST") {
        const parsed = CreateTransactionSchema.safeParse(req.body);
        if (!parsed.success) {
            return jsonError(res, 400, "Invalid request body", parsed.error.flatten());
        }

        const { concept, amount, date, type } = parsed.data;

        const queryUserId =
            typeof req.query.userId === "string" ? req.query.userId : undefined;

        const bodyUserId =
            typeof (req.body as any)?.userId === "string"
                ? (req.body as any).userId
                : undefined;

        if (
            authUser.role === "USER" &&
            (queryUserId || bodyUserId) &&
            (queryUserId !== authUser.id && bodyUserId !== authUser.id)
        ) {
            return jsonError(res, 403, ERROR_MESSAGES.ACCESS_DENIED);
        }

        const userIdToUse =
            authUser.role === "ADMIN" ? (queryUserId ?? authUser.id) : authUser.id;

        try {
            const created = await prisma.transaction.create({
                data: {
                    concept,
                    amount,
                    date: date ?? new Date(),
                    type,
                    userId: userIdToUse,
                },
                select: {
                    id: true,
                    concept: true,
                    amount: true,
                    date: true,
                    type: true,
                    createdAt: true,
                    updatedAt: true,
                    user: { select: { name: true } },
                },
            });

            return res.status(201).json({
                id: created.id,
                concept: created.concept,
                amount: Number(created.amount),
                date: created.date.toISOString(),
                type: translateType(created.type),
                name: created.user?.name ?? "",
                createdAt: created.createdAt.toISOString(),
                updatedAt: created.updatedAt.toISOString(),
            });
        } catch {
            return jsonError(res, 500, "Failed to create transaction");
        }
    }

    if (req.method === "DELETE") {
        const id = typeof req.query.id === "string" ? req.query.id : undefined;
        if (!id) {
            return jsonError(res, 400, "Missing transaction id");
        }

        try {
            if (authUser.role === "USER") {
                const deleted = await prisma.transaction.deleteMany({
                    where: {
                        id,
                        userId: authUser.id,
                    },
                });

                if (deleted.count === 0) {
                    return jsonError(res, 403, ERROR_MESSAGES.ACCESS_DENIED);
                }

                return res.status(204).end();
            }

            const existing = await prisma.transaction.findUnique({
                where: { id },
                select: { id: true },
            });

            if (!existing) {
                return jsonError(res, 404, "Transaction not found");
            }

            await prisma.transaction.delete({ where: { id } });

            return res.status(204).end();
        } catch {
            return jsonError(res, 500, "Failed to delete transaction");
        }
    }

    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).end();
}
