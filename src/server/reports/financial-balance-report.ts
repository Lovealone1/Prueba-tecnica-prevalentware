import { prisma } from "@/server/db/prisma";

/**
 * Response structure for financial balance report.
 * Provides current balance and aggregated income/expense totals.
 */
export type FinancialBalanceResponse = {
    balance: number;
    currency: string;
    asOf: string;
    totals: {
        income: number;
        expense: number;
    };
};

/**
 * Builds a financial balance report aggregating all transactions.
 * 
 * Calculates:
 * - Total income from all INCOME transactions
 * - Total expense from all EXPENSE transactions
 * - Net balance (income - expense)
 * - Report timestamp
 * 
 * @returns Financial balance data with currency and timestamp
 */
export async function buildFinancialBalanceReport(): Promise<FinancialBalanceResponse> {
    // Aggregate transactions by type to calculate totals
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
