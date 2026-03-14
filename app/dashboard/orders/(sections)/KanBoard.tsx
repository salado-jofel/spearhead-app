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

// ─── Only 3 statuses shown on the board ──────────────────────────────────────
const BOARD_STATUSES = ["Processing", "Shipped", "Delivered"] as const;
type BoardStatus = (typeof BOARD_STATUSES)[number];

// ─── Status color config ──────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  BoardStatus,
  { badge: string; dot: string; next?: BoardStatus }
> = {
  Processing: {
    badge: "bg-yellow-50 text-yellow-600",
    dot: "bg-yellow-400",
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
  const config = STATUS_CONFIG[order.status as BoardStatus];
  const [isAdvancing, setIsAdvancing] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

  async function handleAdvance() {
    if (!order.id || !config?.next || isAdvancing) return;
    setIsAdvancing(true);
    try {
      const formData = new FormData();
      formData.set("status", config.next);
      await updateOrderStatus(order.id, formData);
      dispatch(updateOrderInStore({ ...order, status: config.next }));
    } catch (err) {
      console.error("[handleAdvance] Error:", err);
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
      console.error("[handleDelete] Error:", err);
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
        {/* ── Top Row ── */}
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
            title="Delete order"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
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

        {/* ── QuickBooks Invoice Badge ── */}
        <QuickBooksInvoiceBadge
          orderId={order.id!}
          orderDocNumber={order.order_id}
          qbInvoiceId={order.qb_invoice_id}
          qbInvoiceStatus={order.qb_invoice_status}
          facilityQbCustomerId={order.facility_qb_customer_id}
          productQbItemId={order.product_qb_item_id}
        />

        {/* ── Divider ── */}
        <div className="border-t border-slate-100" />

        {/* ── Bottom Row ── */}
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
              title={`Move to ${config.next}`}
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

// ─── Kanban Column ────────────────────────────────────────────────────────────
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
      {/* ── Column Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${config.dot}`} />
          <span className="text-sm font-semibold text-slate-700">{status}</span>
        </div>
        <span className="min-w-5.5 h-5.5 flex items-center justify-center rounded-full bg-[#2db0b0] text-white text-xs font-bold">
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
    return BOARD_STATUSES.reduce<Record<BoardStatus, Order[]>>(
      (acc, status) => {
        acc[status] = items.filter((o) => o.status === status);
        return acc;
      },
      {} as Record<BoardStatus, Order[]>,
    );
  }, [items]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {BOARD_STATUSES.map((status) => (
        <KanbanColumn key={status} status={status} orders={grouped[status]} />
      ))}
    </div>
  );
}
