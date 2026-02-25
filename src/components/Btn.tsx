import clsx from "clsx";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "ghost" | "danger";
    size?: "sm" | "md";
    children: ReactNode;
}

export default function Btn({
    variant = "primary",
    size = "md",
    className,
    children,
    ...props
}: Props) {
    return (
        <button
            className={clsx(
                "inline-flex items-center gap-1.5 font-mono rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed",
                size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-base",
                variant === "primary" &&
                    "bg-accent text-bg hover:bg-accent-dim shadow-accent-sm",
                variant === "ghost" &&
                    "border border-border text-text-dim hover:border-border-bright hover:text-text bg-transparent",
                variant === "danger" &&
                    "border border-danger\/40 text-danger hover:bg-danger\/10",
                className,
            )}
            {...props}
        >
            {children}
        </button>
    );
}
