function formatMoneyCop(value: number) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(value);
}

function formatDateTime(iso: string) {
    return iso.slice(0, 19).replace("T", " ");
}

export function FinancialBalanceCard({
    data,
}: {
    data: {
        balance: number;
        currency: string;
        asOf: string;
        totals: { income: number; expense: number };
    };
}) {
    return (
        <section className="relative overflow-hidden rounded-3xl border border-zinc-800/70 bg-zinc-950/55 shadow-[0_30px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-600/15 blur-[90px]" />
                <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-sky-500/10 blur-[90px]" />
                <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/5" />
            </div>

            <div className="relative z-10 px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h3 className="text-base font-bold uppercase text-white">Saldo actual</h3>
                        <p className="mt-1 text-xs text-zinc-400">Corte: {formatDateTime(data.asOf)}</p>
                    </div>

                    <div className="text-right">
                        <div className="text-2xl font-extrabold text-white">
                            {formatMoneyCop(data.balance)}
                        </div>
                        <div className="mt-1 text-xs text-zinc-400">{data.currency}</div>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-zinc-800/70 bg-white/5 px-3 py-2 text-xs text-zinc-300">
                        <span className="mr-2 uppercase tracking-wide text-zinc-400">Ingresos:</span>
                        <span className="font-semibold text-white">{formatMoneyCop(data.totals.income)}</span>
                    </div>

                    <div className="rounded-xl border border-zinc-800/70 bg-white/5 px-3 py-2 text-xs text-zinc-300">
                        <span className="mr-2 uppercase tracking-wide text-zinc-400">Gastos:</span>
                        <span className="font-semibold text-white">{formatMoneyCop(data.totals.expense)}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
