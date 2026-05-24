import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function Section({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: SectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || actions) && (
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-0.5">
            {title ? (
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="text-[13px] text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      )}
      <div className={cn(bodyClassName)}>{children}</div>
    </section>
  );
}

interface SurfaceProps {
  children: ReactNode;
  className?: string;
  /** When false, removes default padding so tables/lists can flush to the edge */
  padded?: boolean;
}

export function Surface({ children, className, padded = true }: SurfaceProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface",
        padded && "p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
