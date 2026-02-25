import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useI18n, type Lang } from "../i18n";
import { useTheme } from "../contexts/ThemeContext";
import { Shield, Lock, Mail, Sun, Moon, UserPlus, LogIn } from "lucide-react";

const LANGS: { code: Lang; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "ru", label: "RU" },
    { code: "tk", label: "TK" },
];

export default function Login() {
    const navigate = useNavigate();
    const { login, register } = useAuth();
    const { t, lang, setLang } = useI18n();
    const { theme, toggleTheme } = useTheme();
    const [mode, setMode] = useState<"login" | "register">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr("");
        setLoading(true);
        try {
            if (mode === "login") await login(email, password);
            else await register(email, password);
            navigate("/");
        } catch (error: any) {
            const msg = String(error?.message ?? "");
            if (msg.includes("already exists")) setErr("User already exists");
            else setErr(t("invalidCreds"));
        } finally {
            setLoading(false);
        }
    };

    const inputSt: React.CSSProperties = {
        background: "var(--bg)",
        border: "1px solid var(--border)",
        color: "var(--text-bright)",
        fontSize: "15px",
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center relative"
            style={{ background: "var(--bg)", color: "var(--text)" }}
        >
            <div className="absolute inset-0 opacity-[0.025] scanline-bg pointer-events-none" />
            <div
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle, color-mix(in srgb, var(--accent) 12%, transparent), transparent 70%)",
                }}
            />

            {/* Top-right controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <div className="flex gap-1">
                    {LANGS.map(({ code, label }) => (
                        <button
                            key={code}
                            onClick={() => setLang(code)}
                            className="px-2.5 py-1.5 rounded text-sm font-mono transition-all"
                            style={{
                                background:
                                    lang === code
                                        ? "color-mix(in srgb, var(--accent) 15%, transparent)"
                                        : "var(--bg-2)",
                                color:
                                    lang === code
                                        ? "var(--accent)"
                                        : "var(--text-dim)",
                                border: `1px solid ${lang === code ? "color-mix(in srgb, var(--accent) 30%, transparent)" : "var(--border)"}`,
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded transition-all"
                    style={{
                        background: "var(--bg-2)",
                        border: "1px solid var(--border)",
                        color: "var(--text-dim)",
                    }}
                >
                    {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                </button>
            </div>

            {/* Card */}
            <div className="relative z-10 w-full max-w-sm animate-fade-in px-4">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                        style={{
                            background:
                                "color-mix(in srgb, var(--accent) 12%, transparent)",
                            border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                            boxShadow:
                                "0 0 32px color-mix(in srgb, var(--accent) 20%, transparent)",
                        }}
                    >
                        <Shield
                            className="w-7 h-7"
                            style={{ color: "var(--accent)" }}
                        />
                    </div>
                    <h1 className="font-mono font-bold text-3xl tracking-widest uppercase text-text-bright">
                        IDS Lab
                    </h1>
                    <p className="font-mono text-sm uppercase tracking-widest text-text-dim mt-1">
                        {t("secureAccess")}
                    </p>
                </div>

                <div
                    className="rounded-2xl p-7 shadow-panel"
                    style={{
                        background: "var(--bg-2)",
                        border: "1px solid var(--border)",
                    }}
                >
                    {/* Mode switcher */}
                    <div
                        className="flex rounded-lg overflow-hidden mb-6"
                        style={{ border: "1px solid var(--border)" }}
                    >
                        {(["login", "register"] as const).map((m) => (
                            <button
                                key={m}
                                onClick={() => {
                                    setMode(m);
                                    setErr("");
                                }}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 font-mono text-sm uppercase tracking-wide transition-all"
                                style={{
                                    background:
                                        mode === m
                                            ? "color-mix(in srgb, var(--accent) 15%, transparent)"
                                            : "transparent",
                                    color:
                                        mode === m
                                            ? "var(--accent)"
                                            : "var(--text-dim)",
                                    borderRight:
                                        m === "login"
                                            ? "1px solid var(--border)"
                                            : undefined,
                                }}
                            >
                                {m === "login" ? (
                                    <LogIn size={13} />
                                ) : (
                                    <UserPlus size={13} />
                                )}
                                {m === "login" ? t("login") : "Register"}
                            </button>
                        ))}
                    </div>

                    <p
                        className="font-mono text-sm uppercase tracking-widest mb-5"
                        style={{ color: "var(--accent)" }}
                    >
                        //{" "}
                        {mode === "login" ? "authenticate" : "create account"}
                    </p>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="font-mono text-sm uppercase tracking-wide block mb-2 text-text-dim">
                                {t("email")}
                            </label>
                            <div className="relative">
                                <Mail
                                    size={14}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim"
                                />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full rounded-lg px-3 py-3 pl-9 font-mono focus:outline-none transition-colors"
                                    style={inputSt}
                                    placeholder="admin@test.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="font-mono text-sm uppercase tracking-wide block mb-2 text-text-dim">
                                {t("password")}
                            </label>
                            <div className="relative">
                                <Lock
                                    size={14}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim"
                                />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                    minLength={6}
                                    className="w-full rounded-lg px-3 py-3 pl-9 font-mono focus:outline-none transition-colors"
                                    style={inputSt}
                                    placeholder="••••••••"
                                />
                            </div>
                            {mode === "register" && (
                                <p className="font-mono text-xs text-text-dim mt-1">
                                    Minimum 6 characters
                                </p>
                            )}
                        </div>

                        {err && (
                            <p
                                className="font-mono text-sm px-3 py-2.5 rounded-lg"
                                style={{
                                    background:
                                        "color-mix(in srgb, var(--danger) 10%, transparent)",
                                    color: "var(--danger)",
                                    border: "1px solid color-mix(in srgb, var(--danger) 20%, transparent)",
                                }}
                            >
                                {err}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-lg font-mono text-base uppercase tracking-widest transition-all disabled:opacity-50 shadow-accent-sm"
                            style={{
                                background: "var(--accent)",
                                color: "var(--bg)",
                            }}
                        >
                            {loading
                                ? t("authenticating")
                                : mode === "login"
                                  ? t("login")
                                  : "Register"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
