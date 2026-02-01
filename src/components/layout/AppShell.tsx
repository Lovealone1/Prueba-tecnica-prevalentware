import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col">
                <Header />
                <main className="min-w-0 flex-1 px-6 py-6">{children}</main>
            </div>
        </div>
    );
}
