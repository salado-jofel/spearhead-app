import { getAllOrders } from "./orders/actions";
import { getFacilities } from "./facilities/actions";
import Providers from "./(sections)/Providers";
import RecentOrdersTable from "./(sections)/RecentOrdersTable";
import { createClient } from "@/utils/supabase/server";
import StatsCards from "./(sections)/StatsCard";
import Headers from "./(sections)/Headers";

async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export default async function DashboardPage() {
  const [facilities, orders, user] = await Promise.all([
    getFacilities(),
    getAllOrders(),
    getCurrentUser(),
  ]);

  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split("@")[0] ??
    "there";

  return (
    <Providers facilities={facilities} orders={orders}>
      <div className="p-8  w-full mx-auto space-y-6 select-none h-full overflow-y-auto">
        {/* ── Page Header ──────────────────────────────────────── */}
        <Headers displayName={displayName} />
        {/* ── Stat Cards ───────────────────────────────────────── */}
        <StatsCards />

        {/* ── Recent Orders ────────────────────────────────────── */}
        <RecentOrdersTable />
      </div>
    </Providers>
  );
}
