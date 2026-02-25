import { createContext, useContext, useState, type ReactNode } from "react";
import { authApi } from "../api/client";

interface AuthCtx {
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(() =>
        localStorage.getItem("token"),
    );

    const login = async (email: string, password: string) => {
        const res = await authApi.login(email, password);
        localStorage.setItem("token", res.access_token);
        setToken(res.access_token);
    };

    const register = async (email: string, password: string) => {
        const res = await authApi.register(email, password);
        localStorage.setItem("token", res.access_token);
        setToken(res.access_token);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
    };

    return (
        <AuthContext.Provider
            value={{ token, login, register, logout, isAuthenticated: !!token }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
