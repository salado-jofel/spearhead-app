import { Sidebar } from "./(sections)/Sidebar";
import { SidebarProvider } from "./(components)/SidebarContext";
import { MobileTopBar } from "./(sections)/MobileTopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-slate-100">
        {/* Sidebar — fixed on desktop, drawer on mobile */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex flex-col flex-1 md:ml-64 min-w-0">
          {/* Mobile-only top bar */}
          <MobileTopBar />

          {/* Page content — offset by topbar height on mobile */}
          <main className="flex-1 pt-16 md:pt-0 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
