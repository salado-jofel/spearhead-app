"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateOrderInStore,
  removeOrderFromStore,
} from "../(redux)/orders-slice";
import { updateOrderStatus, deleteOrder } from "../actions";
import type { Order, OrderStatus } from "@/app/(interfaces)/order";
import { ORDER_STATUSES } from "@/app/(interfaces)/order";
import { Trash2, Package, Building2, User, ChevronRight } from "lucide-react";
import { useMemo } from "react";

// ─── Status color config ──────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  OrderStatus,
  { badge: string; dot: string; next?: OrderStatus }
> = {
  Draft: {
    badge: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
    next: "Submitted",
  },
  Submitted: {
    badge: "bg-blue-50 text-blue-600",
    dot: "bg-blue-400",
    next: "Processing",
  },
  Processing: {
    badge: "bg-yellow-50 text-yellow-600",
    dot: "bg-yellow-400",
    next: "Approved",
  },
  Approved: {
    badge: "bg-teal-50 text-teal-600",
    dot: "bg-[#2db0b0]",
    next: "Shipped",
  },
  Shipped: {
    badge: "bg-purple-50 text-purple-600",
    dot: "bg-purple-400",
    next: "Delivered",
  },
  Delivered: {
    badge: "bg-emerald-50 text-emerald-600",
    dot: "bg-emerald-400",
    next: undefined,
  },
};

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order }: { order: Order }) {
  const dispatch = useAppDispatch();
  const config = STATUS_CONFIG[order.status];

  async function handleAdvance() {
    if (!order.id || !config.next) return;

    const updated: Order = { ...order, status: config.next };
    dispatch(updateOrderInStore(updated));

    const formData = new FormData();
    formData.set("status", config.next);
    await updateOrderStatus(order.id, formData);
  }

  async function handleDelete() {
    if (!order.id) return;
    dispatch(removeOrderFromStore(order.id));
    await deleteOrder(order.id);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow">
      {/* ── Top Row ── */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#2db0b0] tracking-wide">
          {order.order_id}
        </span>
        <button
          type="button"
          onClick={handleDelete}
          className="p-1 text-slate-300 hover:text-red-500 transition-colors rounded"
          title="Delete order"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Product ── */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-[#2db0b0]/10 flex items-center justify-center shrink-0">
          <Package className="w-3.5 h-3.5 text-[#2db0b0]" />
        </div>
        <span className="text-sm font-medium text-slate-700 truncate">
          {order.product_name}
        </span>
      </div>

      {/* ── Facility ── */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <span className="text-xs text-slate-500 truncate">
          {order.facility_name}
        </span>
      </div>

      {/* ── Created By ── */}
      {order.created_by_email && (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-xs text-slate-400 truncate">
            {order.created_by_email}
          </span>
        </div>
      )}

      {/* ── Divider ── */}
      <div className="border-t border-slate-100" />

      {/* ── Bottom Row ── */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-slate-800">
          ${Number(order.amount).toFixed(2)}
        </span>

        {/* ── Advance Status Button ── */}
        {config.next && (
          <button
            type="button"
            onClick={handleAdvance}
            className="flex items-center gap-1 text-xs text-[#2db0b0] hover:text-[#249191] font-medium transition-colors"
            title={`Move to ${config.next}`}
          >
            {config.next}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Kanban Column ────────────────────────────────────────────────────────────
function KanbanColumn({
  status,
  orders,
}: {
  status: OrderStatus;
  orders: Order[];
}) {
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-xl min-w-[220px] flex-1">
      {/* ── Column Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${config.dot}`} />
          <span className="text-sm font-semibold text-slate-700">{status}</span>
        </div>
        <span className="min-w-[22px] h-[22px] flex items-center justify-center rounded-full bg-[#2db0b0] text-white text-xs font-bold">
          {orders.length}
        </span>
      </div>

      {/* ── Cards ── */}
      <div className="flex flex-col gap-3 p-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
        {orders.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-xs text-slate-400">No orders</p>
          </div>
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </div>
  );
}

// ─── Main Board ───────────────────────────────────────────────────────────────
export default function KanbanBoard() {
  const items = useAppSelector((state) => state.orders.items);

  const grouped = useMemo(() => {
    return ORDER_STATUSES.reduce<Record<OrderStatus, Order[]>>(
      (acc, status) => {
        acc[status] = items.filter((o) => o.status === status);
        return acc;
      },
      {} as Record<OrderStatus, Order[]>,
    );
  }, [items]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {ORDER_STATUSES.map((status) => (
        <KanbanColumn key={status} status={status} orders={grouped[status]} />
      ))}
    </div>
  );
}
