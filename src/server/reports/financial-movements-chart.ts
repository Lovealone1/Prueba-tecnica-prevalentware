import { prisma } from "@/server/db/prisma";
import { buildUtcRangeExclusive } from "@/server/http/date-range";

/**
 * Supported time granularities for financial chart data aggregation.
 */
export type Granularity = "day" | "week" | "month";

type TransactionType = "INCOME" | "EXPENSE";

/**
 * Row structure returned from Prisma transaction query.
 */
type FinancialTransactionRow = {
    id: string;
    amount: number;
    date: Date;
    type: TransactionType;
};

/**
 * Pads a number to 2 digits with leading zeros.
 * Used for date string formatting (01, 02, ..., 31).
 * 
 * @param n - Number to pad
 * @returns 2-digit zero-padded string
 */
function pad2(n: number) {
    return String(n).padStart(2, "0");
}

/**
 * Generates bucket keys for financial transactions based on granularity.
 * 
 * Bucket key formats (all in UTC):
 * - day:   YYYY-MM-DD
 * - week:  YYYY-MM-DD (Monday of week)
 * - month: YYYY-MM
 * 
 * Week boundaries: Monday is considered the start of the week.
 * 
 * @param date - Transaction date
 * @param granularity - Time unit for aggregation
 * @returns Bucket key string for grouping transactions
 */
function bucketKeyUTC(date: Date, granularity: Granularity) {
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth();
    const d = date.getUTCDate();

    if (granularity === "month") return `${y}-${pad2(m + 1)}`;
    if (granularity === "day") return `${y}-${pad2(m + 1)}-${pad2(d)}`;

    // Week calculation: Monday as week start (0=Sunday, 1=Monday in getUTCDay)
    const utcMidnight = new Date(Date.UTC(y, m, d));
    const dayOfWeek = utcMidnight.getUTCDay();
    const diffToMonday = (dayOfWeek + 6) % 7;

    const monday = new Date(utcMidnight);
    monday.setUTCDate(monday.getUTCDate() - diffToMonday);

    return `${monday.getUTCFullYear()}-${pad2(monday.getUTCMonth() + 1)}-${pad2(
        monday.getUTCDate()
    )}`;
}

/**
 * Comparison function for sorting bucket keys in chronological order.
 * Works with all bucket key formats: YYYY-MM-DD, YYYY-MM.
 * 
 * @param a - First bucket key
 * @param b - Second bucket key
 * @returns -1 if a < b, 1 if a > b, 0 if equal
 */
function compareBucket(a: string, b: string) {
    return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Complete response structure for financial movements chart data.
 * Provides multiple data formats for different visualization needs.
 */
export type FinancialMovementsChartResponse = {
    meta: {
        from: string;
        to: string;
        granularity: Granularity;
    };
    labels: string[];
    series: {
        income: number[];
        expense: number[];
        net: number[];
    };
    points: Array<{
        label: string;
        income: number;
        expense: number;
        net: number;
    }>;
    totals: {
        income: number;
        expense: number;
        net: number;
    };
    datasets: Array<{
        key: "income" | "expense" | "net";
        label: string;
        data: number[];
    }>;
};

/**
 * Builds a comprehensive financial movements chart with aggregated transaction data.
 * 
 * Process flow:
 * 1. Validate date range (from <= to)
 * 2. Fetch transactions within date range from database
 * 3. Aggregate transactions into time-based buckets
 * 4. Calculate net values (income - expense) for each bucket
 * 5. Format data for multiple visualization options
 * 
 * @param params - Chart parameters (date range and granularity)
 * @returns Structured chart data with labels, series, and metadata
 * @throws Error if from > to
 */
export async function buildFinancialMovementsChart(params: {
    from: string;
    to: string;
    granularity: Granularity;
}): Promise<FinancialMovementsChartResponse> {
    const { from, to, granularity } = params;

    // Validate date range
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (fromDate.getTime() > toDate.getTime()) {
        throw new Error("Invalid date range: 'from' date must be before or equal to 'to' date");
    }

    // Fetch transactions within the specified date range
    const rows = await fetchFinancialTransactions({
        fromIso: from,
        toIso: to,
    });

    // Aggregate transactions by time bucket (day/week/month)
    const buckets = new Map<
        string,
        { income: number; expense: number; net: number }
    >();

    for (const tx of rows) {
        const key = bucketKeyUTC(tx.date, granularity);

        const current = buckets.get(key) ?? { income: 0, expense: 0, net: 0 };
        const amount = Number(tx.amount) || 0;

        if (tx.type === "INCOME") current.income += amount;
        else current.expense += amount;

        current.net = current.income - current.expense;
        buckets.set(key, current);
    }

    // Format aggregated data for chart visualization
    const labels = Array.from(buckets.keys()).sort(compareBucket);
    const income = labels.map((k) => buckets.get(k)!.income);
    const expense = labels.map((k) => buckets.get(k)!.expense);
    const net = labels.map((k) => buckets.get(k)!.net);

    const totals = {
        income: income.reduce((a, b) => a + b, 0),
        expense: expense.reduce((a, b) => a + b, 0),
        net: net.reduce((a, b) => a + b, 0),
    };

    return {
        meta: { from, to, granularity },
        labels,
        series: { income, expense, net },
        points: labels.map((label, i) => ({
            label,
            income: income[i],
            expense: expense[i],
            net: net[i],
        })),
        totals,
        datasets: [
            { key: "income", label: "Income", data: income },
            { key: "expense", label: "Expenses", data: expense },
            { key: "net", label: "Net", data: net },
        ],
    };
}

/**
 * Fetches financial transactions within a date range from the database.
 * 
 * Uses exclusive upper bound range semantics: [from, toExclusive)
 * This prevents off-by-one errors in date-based aggregations.
 * 
 * @param args - ISO date range (fromIso, toIso)
 * @returns Array of transactions with normalized types and amounts
 * @internal Used internally by buildFinancialMovementsChart
 */
async function fetchFinancialTransactions(args: {
    fromIso: string;
    toIso: string;
}): Promise<FinancialTransactionRow[]> {
    const { from, toExclusive } = buildUtcRangeExclusive(args);

    const rows = await prisma.transaction.findMany({
        where: {
            // Exclusive upper bound range prevents off-by-one errors
            date: { gte: from, lt: toExclusive },
        },
        select: { id: true, amount: true, date: true, type: true },
        orderBy: { date: "asc" },
    });

    return rows.map((r) => ({
        id: r.id,
        amount: Number(r.amount),
        date: r.date,
        type: r.type as TransactionType,
    }));
}
