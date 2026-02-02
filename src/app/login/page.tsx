"use client";

import Image from "next/image";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
    const loginWithGithub = async () => {
        await authClient.signIn.social({
            provider: "github",
            callbackURL: "/",     
            errorCallbackURL: "/login",
        });
    };

    return (
        <main className="min-h-screen text-white">
            <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-10">
                <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Card INFO */}
                    <GlowCard>
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight">
                                Prueba técnica – Ingresos y Egresos
                            </h2>

                            <p className="mt-2 text-sm text-zinc-300">
                                Desarrollada por{" "}
                                <strong className="text-white">Daniel Garcia Osorio</strong>
                            </p>

                            <p className="mt-5 text-sm leading-relaxed text-zinc-200">
                                Solución fullstack para gestionar ingresos y egresos, enfocada en
                                buenas prácticas de arquitectura, autenticación segura,
                                separación de responsabilidades y una interfaz clara.
                            </p>

                            <ul className="mt-5 space-y-2 text-sm text-zinc-200">
                                <li className="flex gap-2">
                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400/80" />
                                    Autenticación con GitHub.
                                </li>
                                <li className="flex gap-2">
                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400/80" />
                                    API versionada y estructura limpia.
                                </li>
                                <li className="flex gap-2">
                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400/80" />
                                    Frontend moderno con Next.js.
                                </li>
                            </ul>
                        </div>

                        <a
                            href="https://github.com/Lovealone1/Prueba-tecnica-prevalentware"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-7 inline-flex items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-medium text-blue-100 transition hover:bg-blue-500/15 hover:border-blue-400/40"
                        >
                            Ver repositorio en GitHub
                        </a>
                    </GlowCard>

                    {/* Card LOGIN */}
                    <GlowCard>
                        <div className="flex flex-col items-center gap-5">
                            <Image
                                src="/logo-prevalentware.png"
                                alt="PrevalentWare"
                                width={260}
                                height={80}
                                priority
                            />

                            <div className="text-center">
                                <h1 className="text-xl font-semibold">Inicia sesión</h1>
                                <p className="mt-1 text-sm text-zinc-300">
                                    Solo necesitas GitHub para continuar.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={loginWithGithub}
                                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/15 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500/20 active:scale-[0.99]"
                            >
                                <GitHubIcon className="h-5 w-5" />
                                Continuar con GitHub
                            </button>

                            <p className="mt-1 text-center text-xs text-zinc-400">
                                Al continuar aceptas el inevitable destino de los redirects.
                            </p>
                        </div>
                    </GlowCard>
                </div>
            </div>
        </main>
    );
}


function GlowCard({ children }: { children: React.ReactNode }) {
    return (
        <section className="relative overflow-hidden rounded-3xl border border-zinc-800/70 bg-zinc-950/55 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-600/25 blur-[80px]" />
                <div className="absolute -left-28 -bottom-28 h-80 w-80 rounded-full bg-sky-500/15 blur-[90px]" />
                <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/5" />
            </div>

            <div className="relative z-10 flex h-full flex-col justify-between">
                {children}
            </div>
        </section>
    );
}

function GitHubIcon({ className = "" }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M12 .5C5.73.5.5 5.74.5 12.04c0 5.1 3.29 9.42 7.86 10.95.58.11.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.38-3.88-1.38-.53-1.36-1.29-1.72-1.29-1.72-1.05-.73.08-.72.08-.72 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.3-5.23-1.29-5.23-5.75 0-1.27.45-2.3 1.19-3.11-.12-.3-.52-1.5.11-3.13 0 0 .97-.31 3.18 1.19a11.1 11.1 0 0 1 5.8 0c2.2-1.5 3.18-1.19 3.18-1.19.63 1.63.23 2.83.11 3.13.74.81 1.19 1.84 1.19 3.11 0 4.47-2.69 5.45-5.25 5.74.41.36.77 1.06.77 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56A11.55 11.55 0 0 0 23.5 12.04C23.5 5.74 18.27.5 12 .5Z" />
        </svg>
    );
}
