import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/db/prisma";
import { CreateTransactionSchema } from "@/server/schemas/transaction.schema";
import { jsonError } from "@/server/http/json-error";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        const userId = typeof req.query.userId === "string" ? req.query.userId : undefined;

        const list = await prisma.transaction.findMany({
            where: userId ? { userId } : undefined,
            orderBy: { date: "desc" },
            select: {
                id: true, concept: true, amount: true, date: true, type: true, userId: true,
                createdAt: true, updatedAt: true,
            },
        });

        return res.status(200).json(
            list.map((t) => ({
                ...t,
                amount: Number(t.amount),
                date: t.date.toISOString(),
                createdAt: t.createdAt.toISOString(),
                updatedAt: t.updatedAt.toISOString(),
            }))
        );
    }

    if (req.method === "POST") {
        const parsed = CreateTransactionSchema.safeParse(req.body);
        if (!parsed.success) {
            return jsonError(res, 400, "Invalid request body", parsed.error.flatten());
        }

        const { concept, amount, date, type, userId } = parsed.data;

        const created = await prisma.transaction.create({
            data: { concept, amount, date: date ?? new Date(), type, userId },
            select: {
                id: true, concept: true, amount: true, date: true, type: true, userId: true,
                createdAt: true, updatedAt: true,
            },
        });

        return res.status(201).json({
            ...created,
            amount: Number(created.amount),
            date: created.date.toISOString(),
            createdAt: created.createdAt.toISOString(),
            updatedAt: created.updatedAt.toISOString(),
        });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).end();
}
