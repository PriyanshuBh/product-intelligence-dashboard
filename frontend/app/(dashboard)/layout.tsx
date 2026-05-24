import { AppSidebar } from '@/components/nav/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Topbar } from '@/components/shell/topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Topbar />
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-6 py-8 md:px-10 md:py-10">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
