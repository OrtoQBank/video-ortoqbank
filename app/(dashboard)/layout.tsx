"use client";

import { SessionProvider } from "@/components/providers/session-provider";
import {
  TenantProvider,
  useTenant,
} from "@/components/providers/tenant-provider";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MobileBottomNav } from "@/components/nav/mobile-bottom-nav";
import { useCurrentUser } from "@/hooks/useCurrentUser";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isLoading: isUserLoading } = useCurrentUser();
  const { isLoading: isTenantLoading, error: tenantError } = useTenant();

  // Show loading while user or tenant is being loaded
  if (isUserLoading || isTenantLoading) {
    return (
      <div className="from-brand-blue/10 flex min-h-screen items-center justify-center bg-gradient-to-br to-indigo-100">
        <div className="text-center">
          <div className="border-brand-blue mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show error if tenant not found
  if (tenantError) {
    return (
      <div className="from-brand-blue/10 flex min-h-screen items-center justify-center bg-gradient-to-br to-indigo-100">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-600">Erro</h1>
          <p className="text-gray-600">{tenantError}</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <SessionProvider>
        {/* Sidebar visible only on md and larger screens */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        <main className="via-brand-blue/10 min-h-screen w-full bg-gradient-to-b from-slate-50 to-indigo-100">
          {/* Add padding-bottom for mobile nav, remove for desktop */}
          <div className="mx-auto">{children}</div>
        </main>

        {/* Mobile bottom nav visible only on screens smaller than md */}
        <MobileBottomNav />
      </SessionProvider>
    </SidebarProvider>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <TenantProvider>
      <DashboardContent>{children}</DashboardContent>
    </TenantProvider>
  );
}
