export type Granularity = "day" | "week" | "month";

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
