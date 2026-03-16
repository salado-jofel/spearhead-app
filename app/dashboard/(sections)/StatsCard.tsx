"use client";

import { Building2, ShoppingCart, DollarSign, RefreshCw } from "lucide-react";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-start justify-between shadow-sm">
      <div>
        <p className="text-xs text-slate-400 font-medium mb-2">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
      <div className="p-2.5 bg-teal-50 rounded-lg">
        <Icon className="w-5 h-5 text-[#2db0b0]" />
      </div>
    </div>
  );
}

interface Props {
  totalFacilities: number;
  totalOrders: number;
  totalRevenue: number;
  activeOrders: number;
}

export default function StatsCards({
  totalFacilities,
  totalOrders,
  totalRevenue,
  activeOrders,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Facilities"
        value={totalFacilities}
        icon={Building2}
      />
      <StatCard label="Total Orders" value={totalOrders} icon={ShoppingCart} />
      <StatCard
        label="Total Revenue"
        value={`$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
        icon={DollarSign}
      />
      <StatCard label="Active Orders" value={activeOrders} icon={RefreshCw} />
    </div>
  );
}
