"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateOrderInStore,
  removeOrderFromStore,
} from "../(redux)/orders-slice";
import { updateOrderStatus, deleteOrder } from "../actions";
import type { Order, OrderStatus } from "@/app/(interfaces)/order";
import {
  Trash2,
  Package,
  Building2,
  User,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import ConfirmModal from "@/app/(components)/ConfirmModal";
import QuickBooksInvoiceBadge from "./QuickBooksInvoiceBadge";

// ─── Statuses ─────────────────────────────────────────────────────────────────
const BOARD_STATUSES = ["Processing", "Shipped", "Delivered"] as const;
type BoardStatus = (typeof BOARD_STATUSES)[number];

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  BoardStatus,
  { badge: string; dot: string; tab: string; next?: BoardStatus }
> = {
  Processing: {
    badge: "bg-yellow-50 text-yellow-600",
    dot: "bg-yellow-400",
    tab: "text-yellow-600",
    next: "Shipped",
  },
  Shipped: {
    badge: "bg-purple-50 text-purple-600",
    dot: "bg-purple-400",
    tab: "text-purple-600",
    next: "Delivered",
  },
  Delivered: {
    badge: "bg-emerald-50 text-emerald-600",
    dot: "bg-emerald-400",
    tab: "text-emerald-600",
    next: undefined,
  },
};

// ─── Order Card (unchanged — already card-based, works great on mobile) ───────
function OrderCard({ order }: { order: Order }) {
  const dispatch = useAppDispatch();
  const config = STATUS_CONFIG[order.status as BoardStatus];
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleAdvance() {
    if (!order.id || !config?.next || isAdvancing) return;
    setIsAdvancing(true);
    try {
      const formData = new FormData();
      formData.set("status", config.next);
      await updateOrderStatus(order.id, formData);
      dispatch(updateOrderInStore({ ...order, status: config.next }));
    } catch (err) {
      console.error("[handleAdvance]", err);
    } finally {
      setIsAdvancing(false);
    }
  }

  async function handleDelete() {
    if (!order.id) return;
    setIsDeleting(true);
    try {
      await deleteOrder(order.id);
      dispatch(removeOrderFromStore(order.id));
    } catch (err) {
      console.error("[handleDelete]", err);
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <>
      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Order?"
        description={`Order ${order.order_id} will be permanently deleted and cannot be recovered.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />

      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow">
        {/* Top Row */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#2db0b0] tracking-wide">
            {order.order_id}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setConfirmOpen(true)}
            disabled={isDeleting}
            className="h-6 w-6 text-slate-300 hover:text-red-500 hover:bg-red-50 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Product */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#2db0b0]/10 flex items-center justify-center shrink-0">
            <Package className="w-3.5 h-3.5 text-[#2db0b0]" />
          </div>
          <span className="text-sm font-medium text-slate-700 truncate">
            {order.product_name}
          </span>
        </div>

        {/* Facility */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-xs text-slate-500 truncate">
            {order.facility_name}
          </span>
        </div>

        {/* Created By */}
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

        <div className="border-t border-slate-100" />

        <QuickBooksInvoiceBadge
          orderId={order.id!}
          orderDocNumber={order.order_id}
          qbInvoiceId={order.qb_invoice_id}
          qbInvoiceStatus={order.qb_invoice_status}
          facilityQbCustomerId={order.facility_qb_customer_id}
          productQbItemId={order.product_qb_item_id}
        />

        <div className="border-t border-slate-100" />

        {/* Bottom Row */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-800">
            ${Number(order.amount).toFixed(2)}
          </span>
          {config?.next && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAdvance}
              disabled={isAdvancing}
              className="h-7 px-2 text-xs text-[#2db0b0] hover:text-[#249191] hover:bg-teal-50 font-medium cursor-pointer"
            >
              {isAdvancing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  Moving...
                </>
              ) : (
                <>
                  {config.next}
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Desktop Kanban Column (unchanged) ───────────────────────────────────────
function KanbanColumn({
  status,
  orders,
}: {
  status: BoardStatus;
  orders: Order[];
}) {
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-xl min-w-55 flex-1">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${config.dot}`} />
          <span className="text-sm font-semibold text-slate-700">{status}</span>
        </div>
        <span className="min-w-5.5 h-5.5 flex items-center justify-center rounded-full bg-[#2db0b0] text-white text-xs font-bold px-1.5">
          {orders.length}
        </span>
      </div>
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

// ─── Mobile Tab Switcher ──────────────────────────────────────────────────────
function MobileKanbanTabs({
  grouped,
}: {
  grouped: Record<BoardStatus, Order[]>;
}) {
  const [activeTab, setActiveTab] = useState<BoardStatus>("Processing");
  const config = STATUS_CONFIG[activeTab];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex bg-slate-100 rounded-xl p-1 gap-1 mb-4">
        {BOARD_STATUSES.map((status) => {
          const isActive = activeTab === status;
          const cfg = STATUS_CONFIG[status];
          return (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`
                flex flex-1 items-center justify-center gap-1.5
                py-2 px-2 rounded-lg text-xs font-semibold
                transition-all duration-200
                ${
                  isActive
                    ? "bg-white shadow-sm text-slate-800"
                    : "text-slate-400 hover:text-slate-600"
                }
              `}
            >
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
              <span className="truncate">{status}</span>
              <span
                className={`
                  shrink-0 min-w-[18px] h-[18px] flex items-center justify-center
                  rounded-full text-[10px] font-bold px-1
                  ${
                    isActive
                      ? "bg-[#2db0b0] text-white"
                      : "bg-slate-200 text-slate-500"
                  }
                `}
              >
                {grouped[status].length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active column indicator */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
        <span className="text-sm font-semibold text-slate-700">
          {activeTab}
        </span>
        <span className="text-xs text-slate-400">
          {grouped[activeTab].length}{" "}
          {grouped[activeTab].length === 1 ? "order" : "orders"}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {grouped[activeTab].length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-sm font-medium text-slate-400">No orders</p>
            <p className="text-xs text-slate-300 mt-1">
              Nothing in {activeTab} yet
            </p>
          </div>
        ) : (
          grouped[activeTab].map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main Board ───────────────────────────────────────────────────────────────
export default function KanbanBoard() {
  const items = useAppSelector((state) => state.orders.items);

  const grouped = useMemo(
    () =>
      BOARD_STATUSES.reduce<Record<BoardStatus, Order[]>>(
        (acc, status) => {
          acc[status] = items.filter((o) => o.status === status);
          return acc;
        },
        {} as Record<BoardStatus, Order[]>,
      ),
    [items],
  );

  return (
    <>
      {/* ── Mobile: tab-based column switcher ── */}
      <div className="md:hidden">
        <MobileKanbanTabs grouped={grouped} />
      </div>

      {/* ── Desktop: 3-column horizontal layout ── */}
      <div className="hidden md:flex gap-4 overflow-x-auto pb-4">
        {BOARD_STATUSES.map((status) => (
          <KanbanColumn key={status} status={status} orders={grouped[status]} />
        ))}
      </div>
    </>
  );
}
