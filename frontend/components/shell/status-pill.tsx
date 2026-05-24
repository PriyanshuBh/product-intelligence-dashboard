import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "info" | "success" | "warning" | "danger";

const TONE: Record<Tone, string> = {
  neutral:
    "border-border bg-surface-muted text-muted-strong",
  info: "border-[color:var(--brand)]/20 bg-brand-soft text-[color:var(--brand)]",
  success:
    "border-[color:var(--success)]/20 bg-[color:var(--success)]/10 text-[color:var(--success)]",
  warning:
    "border-[color:var(--warning)]/25 bg-[color:var(--warning)]/12 text-[color:var(--warning)]",
  danger:
    "border-[color:var(--danger)]/20 bg-[color:var(--danger)]/10 text-[color:var(--danger)]",
};

interface StatusPillProps {
  tone?: Tone;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}

export function StatusPill({ tone = "neutral", children, dot, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        TONE[tone],
        className,
      )}
    >
      {dot ? (
        <span
          className={cn(
            "size-1.5 rounded-full",
            tone === "neutral" && "bg-muted",
            tone === "info" && "bg-[color:var(--brand)]",
            tone === "success" && "bg-[color:var(--success)]",
            tone === "warning" && "bg-[color:var(--warning)]",
            tone === "danger" && "bg-[color:var(--danger)]",
          )}
        />
      ) : null}
      {children}
    </span>
  );
}
