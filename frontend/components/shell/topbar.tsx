'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { ChevronRight } from 'lucide-react';

const SEGMENT_LABEL: Record<string, string> = {
  upload: 'Ingest',
  jobs: 'Processing',
  dashboard: 'Overview',
  products: 'Catalog',
  alerts: 'Alerts',
};

function prettify(segment: string): string {
  if (SEGMENT_LABEL[segment]) return SEGMENT_LABEL[segment];
  // SKU-like / id segments — keep as-is
  if (/^[0-9a-f-]{8,}$/i.test(segment)) return segment.slice(0, 8);
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function Topbar() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 md:px-6">
      <SidebarTrigger className="-ml-1 size-7 text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" className="mx-1 h-4" />

      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[13px]">
        <Link
          href="/dashboard"
          className="font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Home
        </Link>
        {segments.map((segment, idx) => {
          const href = '/' + segments.slice(0, idx + 1).join('/');
          const isLast = idx === segments.length - 1;
          return (
            <span key={href} className="flex min-w-0 items-center gap-1.5">
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />
              {isLast ? (
                <span className="truncate font-medium text-foreground">
                  {prettify(segment)}
                </span>
              ) : (
                <Link
                  href={href}
                  className="truncate font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {prettify(segment)}
                </Link>
              )}
            </span>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-1.5">
        <kbd className="hidden items-center gap-1 rounded-md border border-border bg-surface px-1.5 py-0.5 font-mono text-[10.5px] font-medium text-muted-foreground sm:inline-flex">
          ⌘ B
        </kbd>
      </div>
    </header>
  );
}
