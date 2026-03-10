import { Sidebar } from "@/app/dashboard/(sections)/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#fcfdfe]">
      <Sidebar />
      <main className="flex-1 ml-64 p-10">{children}</main>
    </div>
  );
}
