export const dynamic = "force-dynamic";

import { getAllOrders } from "./orders/actions";
import { getFacilities } from "./facilities/actions";
import Providers from "./(sections)/Providers";
import RecentOrdersTable from "./(sections)/RecentOrdersTable";
import { createClient } from "@/utils/supabase/server";
import StatsCards from "./(sections)/StatsCard";
import Headers from "./(sections)/Headers";
import { getUserData } from "./actions";

async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export default async function DashboardPage() {
  const [facilities, orders, user, userData] = await Promise.all([
    getFacilities(),
    getAllOrders(),
    getCurrentUser(),
    getUserData(),
  ]);

  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split("@")[0] ??
    "there";

  // ── Compute stats server-side — no Redux, no hydration mismatch ──
  const totalFacilities = facilities.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.amount ?? 0), 0);
  const activeOrders = orders.filter(
    (o) => o.status !== "Delivered" && o.status !== "Draft",
  ).length;

  return (
    <Providers facilities={facilities} orders={orders} userData={userData}>
      <div className="p-4 md:p-8 w-full mx-auto space-y-6 select-none">
        <Headers />
        <StatsCards
          totalFacilities={totalFacilities}
          totalOrders={totalOrders}
          totalRevenue={totalRevenue}
          activeOrders={activeOrders}
        />
        <RecentOrdersTable />
      </div>
    </Providers>
  );
}
