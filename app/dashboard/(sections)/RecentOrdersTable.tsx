"use client";

import { useAppSelector } from "@/store/hooks";
import { Inbox } from "lucide-react";
import { useMemo } from "react";
import { StatusBadge } from "../(components)/StatusBadge";

export default function RecentOrdersTable() {
  const orders = useAppSelector((state) => state.orders.items);

  const recent = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.created_at ?? 0).getTime() -
            new Date(a.created_at ?? 0).getTime(),
        )
        .slice(0, 10),
    [orders],
  );

  const formatDate = (dateStr?: string | null) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—";

  const formatAmount = (amount?: number | null) =>
    `$${(amount ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-700">Recent Orders</h2>
      </div>

      {recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Inbox className="w-10 h-10 mb-3 text-slate-300 stroke-1" />
          <p className="text-sm font-medium text-slate-400">No Orders Yet</p>
        </div>
      ) : (
        <>
          {/* ── Mobile card list (hidden on md+) ─────────────── */}
          <div className="divide-y divide-slate-100 md:hidden">
            {recent.map((order) => (
              <div key={order.id} className="p-4 space-y-2">
                {/* Row 1: Order ID + Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-slate-700 truncate">
                    {order.order_id}
                  </span>
                  <StatusBadge status={order.status} />
                </div>

                {/* Row 2: Facility + Product */}
                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                  <span className="font-medium text-slate-600">
                    {order.facility_name ?? "—"}
                  </span>
                  {order.product_name && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span>{order.product_name}</span>
                    </>
                  )}
                </div>

                {/* Row 3: Amount + Date */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">
                    {formatAmount(order.amount)}
                  </span>
                  <span className="text-slate-400">
                    {formatDate(order.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Desktop table (hidden below md) ──────────────── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 font-medium text-slate-400">
                    Order ID
                  </th>
                  <th className="px-5 py-3 font-medium text-[#2db0b0]">
                    Facility
                  </th>
                  <th className="px-5 py-3 font-medium text-[#2db0b0]">
                    Product
                  </th>
                  <th className="px-5 py-3 font-medium text-[#2db0b0]">
                    Amount
                  </th>
                  <th className="px-5 py-3 font-medium text-[#2db0b0]">
                    Status
                  </th>
                  <th className="px-5 py-3 font-medium text-red-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recent.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3 text-slate-700 font-medium">
                      {order.order_id}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {order.facility_name ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {order.product_name ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-700 font-medium">
                      {formatAmount(order.amount)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">
                      {formatDate(order.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
