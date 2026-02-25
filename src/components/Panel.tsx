import { CSSProperties, ReactNode } from "react";
import clsx from "clsx";

export default function Panel({
    children,
    className,
    style,
}: {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
}) {
    return (
        <div
            className={clsx(
                "rounded-xl border bg-bg-2 shadow-panel",
                className,
            )}
            style={{ borderColor: "var(--border)", ...style }}
        >
            {children}
        </div>
    );
}
