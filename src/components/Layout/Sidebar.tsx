import { NavLink, useNavigate } from "react-router-dom";
import clsx from "clsx";
import {
    LayoutDashboard,
    FlaskConical,
    Target,
    ShieldCheck,
    Bell,
    LogOut,
    Activity,
    Sun,
    Moon,
    Globe,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../contexts/ThemeContext";
import { useI18n, type Lang } from "../../i18n";

const LANGS: { code: Lang; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "ru", label: "RU" },
    { code: "tk", label: "TK" },
];

export function Sidebar() {
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { t, lang, setLang } = useI18n();
    const navigate = useNavigate();

    const nav = [
        { to: "/", icon: LayoutDashboard, label: t("dashboard") },
        { to: "/experiments", icon: FlaskConical, label: t("experiments") },
        { to: "/scenarios", icon: Target, label: t("scenarios") },
        { to: "/ids-profiles", icon: ShieldCheck, label: t("idsProfiles") },
        { to: "/alerts", icon: Bell, label: t("alerts") },
    ];

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <aside
            className="flex h-screen w-60 flex-col flex-shrink-0"
            style={{
                background: "var(--bg-2)",
                borderRight: "1px solid var(--border)",
            }}
        >
            {/* Logo */}
            <div
                className="flex items-center gap-3 px-5 py-5"
                style={{ borderBottom: "1px solid var(--border)" }}
            >
                <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0"
                    style={{
                        background:
                            "color-mix(in srgb, var(--accent) 12%, transparent)",
                        border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                        boxShadow:
                            "0 0 12px color-mix(in srgb, var(--accent) 15%, transparent)",
                    }}
                >
                    <Activity
                        className="h-5 w-5"
                        style={{ color: "var(--accent)" }}
                    />
                </div>
                <div>
                    <p className="font-mono text-base font-bold leading-tight text-text-bright">
                        IDS Lab
                    </p>
                    <p className="font-mono text-[11px] uppercase tracking-widest text-text-dim">
                        Assessment
                    </p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {nav.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === "/"}
                        className={({ isActive }) =>
                            clsx(
                                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-mono transition-all border",
                                isActive
                                    ? "border-accent/20 text-text-bright"
                                    : "border-transparent text-text-dim hover:text-text hover:bg-bg-3",
                            )
                        }
                        style={({ isActive }) =>
                            isActive
                                ? {
                                      background:
                                          "color-mix(in srgb, var(--accent) 10%, transparent)",
                                      borderColor:
                                          "color-mix(in srgb, var(--accent) 25%, transparent)",
                                  }
                                : undefined
                        }
                    >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="tracking-wide">{label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Controls */}
            <div
                className="px-3 pb-4 space-y-3"
                style={{
                    borderTop: "1px solid var(--border)",
                    paddingTop: "14px",
                }}
            >
                {/* Language switcher */}
                <div>
                    <div className="flex items-center gap-1.5 px-1 mb-2">
                        <Globe size={11} style={{ color: "var(--text-dim)" }} />
                        <span className="font-mono text-[11px] uppercase tracking-widest text-text-dim">
                            Language
                        </span>
                    </div>
                    <div className="flex gap-1">
                        {LANGS.map(({ code, label }) => (
                            <button
                                key={code}
                                onClick={() => setLang(code)}
                                className="flex-1 py-1.5 rounded text-xs font-mono transition-all"
                                style={{
                                    background:
                                        lang === code
                                            ? "color-mix(in srgb, var(--accent) 15%, transparent)"
                                            : "var(--bg-3)",
                                    color:
                                        lang === code
                                            ? "var(--accent)"
                                            : "var(--text-dim)",
                                    border: `1px solid ${
                                        lang === code
                                            ? "color-mix(in srgb, var(--accent) 30%, transparent)"
                                            : "var(--border)"
                                    }`,
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-mono transition-all"
                    style={{
                        background: "var(--bg-3)",
                        border: "1px solid var(--border)",
                        color: "var(--text-dim)",
                    }}
                >
                    {theme === "dark" ? (
                        <>
                            <Sun size={14} style={{ color: "var(--warn)" }} />
                            <span>Light mode</span>
                        </>
                    ) : (
                        <>
                            <Moon
                                size={14}
                                style={{ color: "var(--accent)" }}
                            />
                            <span>Dark mode</span>
                        </>
                    )}
                </button>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-mono transition-all hover:bg-danger\/10 hover:text-danger"
                    style={{
                        color: "var(--text-dim)",
                        border: "1px solid transparent",
                    }}
                >
                    <LogOut size={14} />
                    <span>{t("logout")}</span>
                </button>
            </div>
        </aside>
    );
}
