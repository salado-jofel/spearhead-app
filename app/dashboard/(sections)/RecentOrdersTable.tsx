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

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-700">Recent Orders</h2>
      </div>

      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-5 py-3 font-medium text-slate-400">Order ID</th>
            <th className="px-5 py-3 font-medium text-[#2db0b0]">Facility</th>
            <th className="px-5 py-3 font-medium text-[#2db0b0]">Product</th>
            <th className="px-5 py-3 font-medium text-[#2db0b0]">Amount</th>
            <th className="px-5 py-3 font-medium text-[#2db0b0]">Status</th>
            <th className="px-5 py-3 font-medium text-red-400">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {recent.map((order) => (
            <tr key={order.id} className="hover:bg-slate-50 transition-colors">
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
                $
                {(order.amount ?? 0).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </td>
              <td className="px-5 py-3">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-5 py-3 text-slate-400 text-xs">
                {order.created_at
                  ? new Date(order.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {recent.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <Inbox className="w-10 h-10 mb-3 text-slate-300 stroke-1" />
          <p className="text-sm font-medium text-slate-400">No Orders Yet</p>
        </div>
      )}
    </div>
  );
}
