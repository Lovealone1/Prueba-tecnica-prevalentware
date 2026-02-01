export default function HomePage() {
    return (
        <main className="min-h-screen text-white">
            <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6">
                <div className="w-full rounded-3xl border border-zinc-800/70 bg-zinc-950/55 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl">
                    <h1 className="text-2xl font-semibold">Home (post-login)</h1>
                    <p className="mt-2 text-sm text-zinc-300">
                        Este es el destino luego de autenticar con GitHub. Aquí irá el dashboard.
                    </p>
                </div>
            </div>
        </main>
    );
}
