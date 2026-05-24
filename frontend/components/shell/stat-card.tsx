import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  trend?: { value: string; direction: "up" | "down" | "flat" };
  tone?: "default" | "success" | "warning" | "danger";
  className?: string;
}

const toneToValueClass: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-foreground",
  success: "text-[color:var(--success)]",
  warning: "text-[color:var(--warning)]",
  danger: "text-[color:var(--danger)]",
};

const trendIcon: Record<NonNullable<StatCardProps["trend"]>["direction"], string> = {
  up: "↑",
  down: "↓",
  flat: "→",
};

export function StatCard({
  label,
  value,
  hint,
  trend,
  tone = "default",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-border-strong",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
        {trend ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums",
              trend.direction === "up" && "bg-[color:var(--success)]/10 text-[color:var(--success)]",
              trend.direction === "down" && "bg-[color:var(--danger)]/10 text-[color:var(--danger)]",
              trend.direction === "flat" && "bg-muted/10 text-muted-foreground",
            )}
          >
            <span>{trendIcon[trend.direction]}</span>
            {trend.value}
          </span>
        ) : null}
      </div>
      <p
        className={cn(
          "font-mono text-[34px] font-medium leading-none tracking-tight tabular-nums",
          toneToValueClass[tone],
        )}
      >
        {value}
      </p>
      {hint ? <p className="text-[12px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
