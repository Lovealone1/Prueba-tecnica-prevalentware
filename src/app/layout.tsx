import "@/styles/globals.css";

export const metadata = {
    title: "Prueba técnica Prevalentware",
    description: "Prueba técnica desarrollada para desarrollador Fullstack",
    icons: {
        icon: "/prevalentware_logo.png",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es" className="h-full">
            <head>
                {/* Material Symbols (Rounded / Outlined / Sharp) */}
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200"
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200"
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200"
                />
            </head>
            
            <body className="relative min-h-screen overflow-hidden bg-black text-white">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -right-40 top-1/4 h-[125] w-[125] rounded-full bg-blue-600/30 blur-[180px]" />
                    <div className="absolute -left-40 top-2/3 h-[100] w-[100] rounded-full bg-blue-500/20 blur-[160px]" />
                    <div className="absolute left-1/3 top-[-50] h-[75] w-[75] rounded-full bg-blue-700/20 blur-[140px]" />
                </div>

                <div className="relative z-10">{children}</div>
            </body>
        </html>
    );
}
