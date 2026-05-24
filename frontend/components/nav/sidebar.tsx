'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Upload,
  ListChecks,
  LayoutDashboard,
  Package,
  Bell,
  LogOut,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const navGroups = [
  {
    label: 'Inventory',
    items: [
      { href: '/upload', label: 'Ingest', icon: Upload, tooltip: 'Ingest products & data' },
      { href: '/jobs', label: 'Processing', icon: ListChecks, tooltip: 'Background jobs' },
    ],
  },
  {
    label: 'Analysis',
    items: [
      { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, tooltip: 'Quality overview' },
      { href: '/products', label: 'Catalog', icon: Package, tooltip: 'Product catalog' },
      { href: '/alerts', label: 'Alerts', icon: Bell, tooltip: 'Actionable alerts' },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile, state } = useSidebar();
  const { data: session } = authClient.useSession();

  const isCollapsed = state === 'collapsed';

  const handleLogout = async () => {
    try {
      await authClient.signOut();
    } catch (e) {
      console.error('Logout request failed', e);
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  const user = session?.user;
  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || '';
  const initials = displayName ? displayName.slice(0, 1).toUpperCase() : null;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="px-2 py-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-3">
        <Link
          href="/dashboard"
          className={cn(
            'group/logo flex items-center gap-2.5 rounded-lg transition-opacity hover:opacity-80',
            'group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:p-0',
            'px-2',
          )}
        >
          <span
            aria-hidden
            className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background"
          >
            <span className="font-mono text-[13px] font-medium leading-none">P</span>
            <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-[color:var(--brand)]" />
          </span>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-[13px] font-semibold tracking-tight text-foreground">
              Product Insights
            </span>
            <span className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Listing intelligence
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <div
        aria-hidden
        className="mx-3 h-px bg-sidebar-border group-data-[collapsible=icon]:mx-2"
      />

      <SidebarContent
        className={cn(
          'gap-1 px-2 pt-3',
          'group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:pt-2',
        )}
      >
        {navGroups.map((group, gi) => (
          <SidebarGroup
            key={group.label}
            className={cn(
              'px-1 py-1 transition-[margin] duration-200 ease-linear',
              'group-data-[collapsible=icon]:py-0',
              isCollapsed && gi > 0 && 'mt-1.5',
            )}
          >
            <SidebarGroupLabel
              className={cn(
                'h-7 px-2 text-[10.5px] font-medium uppercase tracking-[0.18em] text-muted-foreground',
                'group-data-[collapsible=icon]:hidden',
              )}
            >
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-1">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <SidebarMenuItem key={item.href} className="group-data-[collapsible=icon]:w-auto">
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.tooltip}
                        className={cn(
                          'relative h-9 gap-2.5 rounded-lg px-2.5 text-[13.5px] font-medium text-muted-strong',
                          'transition-[width,height,padding,background-color,color] duration-200 ease-linear',
                          'hover:bg-sidebar-accent hover:text-foreground',
                          'data-[active=true]:bg-sidebar-accent data-[active=true]:text-foreground',
                          'group-data-[collapsible=icon]:size-9! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center',
                        )}
                      >
                        <Link href={item.href} onClick={() => setOpenMobile(false)}>
                          {isActive ? (
                            <span
                              aria-hidden
                              className={cn(
                                'absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-r-full bg-[color:var(--brand)]',
                                'group-data-[collapsible=icon]:hidden',
                              )}
                            />
                          ) : null}
                          <item.icon
                            className={cn(
                              'size-[16px] shrink-0 transition-colors',
                              isActive ? 'text-[color:var(--brand)]' : 'text-muted-foreground',
                            )}
                            strokeWidth={isActive ? 2.25 : 1.75}
                          />
                          <span className="truncate group-data-[collapsible=icon]:hidden">
                            {item.label}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter
        className={cn(
          'border-t border-sidebar-border p-2',
          'group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:py-2',
        )}
      >
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg px-1.5 py-1',
            'group-data-[collapsible=icon]:flex-col-reverse group-data-[collapsible=icon]:gap-1.5 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-0',
          )}
        >
          <div
            className={cn(
              'flex min-w-0 flex-1 items-center gap-2.5',
              'group-data-[collapsible=icon]:flex-none',
            )}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="size-7 shrink-0 rounded-md">
                  {user?.image ? (
                    <AvatarImage src={user.image} alt={displayName} />
                  ) : null}
                  <AvatarFallback className="rounded-md bg-foreground text-[12px] font-medium text-background">
                    {initials ?? <span className="size-1 rounded-full bg-background/60" />}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              {isCollapsed && displayName ? (
                <TooltipContent side="right" align="center">
                  {displayName}
                </TooltipContent>
              ) : null}
            </Tooltip>

            <div className="flex min-w-0 flex-1 flex-col leading-tight group-data-[collapsible=icon]:hidden">
              {user?.name ? (
                <span className="truncate text-[13px] font-medium text-foreground">
                  {user.name}
                </span>
              ) : null}
              {user?.email ? (
                <span className="truncate text-[11px] text-muted-foreground">
                  {user.email}
                </span>
              ) : null}
            </div>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Log out"
                className={cn(
                  'inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors',
                  'hover:bg-[color:var(--danger)]/10 hover:text-[color:var(--danger)] focus-visible:bg-[color:var(--danger)]/10 focus-visible:text-[color:var(--danger)] focus-visible:outline-none',
                )}
              >
                <LogOut className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side={isCollapsed ? 'right' : 'top'} align="center">
              Log out
            </TooltipContent>
          </Tooltip>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
