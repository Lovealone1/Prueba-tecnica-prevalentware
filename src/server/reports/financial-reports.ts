import { prisma } from "@/server/db/prisma";

type Granularity = "day" | "month" | "all";

function toPeriod(date: Date, granularity: Granularity) {
    if (granularity === "all") return "all";
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    if (granularity === "month") return `${y}-${m}`;
    const d = String(date.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export async function buildFinancialMovementsReport(params: {
    from?: Date;
    to?: Date;
    granularity: Granularity;
}) {
    const { from, to, granularity } = params;

    // Validate date range if both dates are provided
    if (from && to && from.getTime() > to.getTime()) {
        throw new Error("Invalid date range: 'from' date must be before or equal to 'to' date");
    }

    const txs = await prisma.transaction.findMany({
        where: {
            ...(from || to
                ? {
                    date: {
                        ...(from ? { gte: from } : {}),
                        ...(to ? { lte: to } : {}),
                    },
                }
                : {}),
        },
        select: { amount: true, date: true, type: true },
        orderBy: { date: "asc" },
    });

    let balance = 0;
    const map = new Map<string, { income: number; expense: number }>();

    for (const t of txs) {
        const amt = Number(t.amount);
        if (t.type === "INCOME") balance += amt;
        else balance -= amt;

        const key = toPeriod(t.date, granularity);
        const curr = map.get(key) ?? { income: 0, expense: 0 };

        if (t.type === "INCOME") curr.income += amt;
        else curr.expense += amt;

        map.set(key, curr);
    }

    const series = Array.from(map.entries()).map(([period, v]) => ({
        period,
        income: v.income,
        expense: v.expense,
        net: v.income - v.expense,
    }));

    return {
        balance,
        currency: "COP",
        from: from ? from.toISOString() : null,
        to: to ? to.toISOString() : null,
        granularity,
        series,
    };
}
