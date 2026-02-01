import { prisma } from "@/server/db/prisma";

export type FinancialBalanceResponse = {
    balance: number;
    currency: string; // si manejas multi-moneda, esto cambia
    asOf: string; // ISO
    totals: {
        income: number;
        expense: number;
    };
};

export async function buildFinancialBalanceReport(): Promise<FinancialBalanceResponse> {
    // Ajusta el modelo/tabla si no es "transaction"
    const grouped = await prisma.transaction.groupBy({
        by: ["type"],
        _sum: { amount: true },
    });

    const income =
        Number(grouped.find((x) => x.type === "INCOME")?._sum.amount ?? 0) || 0;
    const expense =
        Number(grouped.find((x) => x.type === "EXPENSE")?._sum.amount ?? 0) || 0;

    return {
        balance: income - expense,
        currency: "COP",
        asOf: new Date().toISOString(),
        totals: { income, expense },
    };
}
