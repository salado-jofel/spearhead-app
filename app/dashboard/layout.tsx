import { Sidebar } from "./(sections)/Sidebar";
import { SidebarProvider } from "./(components)/SidebarContext";
import { MobileTopBar } from "./(sections)/MobileTopBar";
import NextTopLoader from "nextjs-toploader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <NextTopLoader
        color="#2db0b0"
        shadow="0 0 10px #2db0b0, 0 0 5px #2db0b0"
        height={3}
        showSpinner={false}
      />
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
