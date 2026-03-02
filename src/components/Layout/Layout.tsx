// src/components/layout/Layout.tsx — ИСПРАВЛЕННЫЙ
import { type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { Navigate } from "react-router-dom";

export function Layout({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return (
        <div
            className="flex h-screen overflow-hidden"
            style={{ background: "var(--bg)", color: "var(--text)" }}
        >
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="min-h-full p-6 animate-fade-in">{children}</div>
            </main>
        </div>
    );
}
