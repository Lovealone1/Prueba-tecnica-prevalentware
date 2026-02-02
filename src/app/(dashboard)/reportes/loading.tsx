export default function Loading() {
    return (
        <section className="relative overflow-hidden rounded-3xl border border-zinc-800/70 bg-zinc-950/55 shadow-[0_30px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-600/15 blur-[90px]" />
                <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-sky-500/10 blur-[90px]" />
                <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/5" />
            </div>

            <div className="relative z-10">
                <div className="border-b border-white/5 px-5 py-4">
                    <div className="h-5 w-32 animate-pulse rounded bg-white/10" />
                    <div className="mt-2 h-4 w-72 animate-pulse rounded bg-white/10" />
                </div>

                <div className="h-[85] px-5 py-4">
                    <div className="h-full w-full animate-pulse rounded-2xl bg-white/5" />
                </div>
            </div>
        </section>
    );
}
