"use client";

import { useState } from "react";
import { createQuickBooksInvoice } from "../quickbooks-actions";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  DollarSign,
} from "lucide-react";

interface Props {
  orderId: string;
  orderDocNumber: string;
  qbInvoiceId?: string | null;
  qbInvoiceStatus?: string | null;
  facilityQbCustomerId?: string | null;
  productQbItemId?: string | null;
}

export default function QuickBooksInvoiceBadge({
  orderId,
  orderDocNumber,
  qbInvoiceId,
  qbInvoiceStatus,
  facilityQbCustomerId,
  productQbItemId,
}: Props) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  async function handleCreateInvoice() {
    setIsSyncing(true);
    setResult(null);
    try {
      const res = await createQuickBooksInvoice(orderId);
      setResult(res);
    } catch {
      setResult({ success: false, message: "Unexpected error occurred" });
    } finally {
      setIsSyncing(false);
    }
  }

  // ─── Already has invoice ──────────────────────────────────────────
  if (qbInvoiceId) {
    return (
      <div className="flex flex-col gap-1">
        {/* Invoice Status Badge */}
        <div className="flex items-center gap-1">
          {qbInvoiceStatus === "paid" ? (
            <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
              <DollarSign className="w-3 h-3" />
              Paid
            </span>
          ) : qbInvoiceStatus === "void" ? (
            <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full font-medium">
              <XCircle className="w-3 h-3" />
              Voided
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
              <FileText className="w-3 h-3" />
              Invoice #{qbInvoiceId}
            </span>
          )}
        </div>

        {/* Re-sync button */}
        <button
          onClick={handleCreateInvoice}
          disabled={isSyncing}
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-[#2db0b0] transition-colors cursor-pointer disabled:opacity-50"
        >
          {isSyncing ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <RefreshCw className="w-3 h-3" />
              Re-sync
            </>
          )}
        </button>

        {result && (
          <p
            className={`text-xs ${result.success ? "text-emerald-600" : "text-red-500"}`}
          >
            {result.success ? "✅" : "❌"} {result.message}
          </p>
        )}
      </div>
    );
  }

  // ─── Not yet synced ───────────────────────────────────────────────
  const canSync = facilityQbCustomerId && productQbItemId;

  return (
    <div className="flex flex-col gap-1">
      {/* Not synced status */}
      <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
        <XCircle className="w-3.5 h-3.5" />
        No Invoice
      </span>

      {/* Create invoice button */}
      <button
        onClick={handleCreateInvoice}
        disabled={isSyncing || !canSync}
        title={
          !canSync
            ? "Sync facility and product to QB first"
            : `Create QB invoice for ${orderDocNumber}`
        }
        className="inline-flex items-center gap-1 text-xs text-[#2db0b0] hover:text-[#249191] font-medium disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        {isSyncing ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <FileText className="w-3.5 h-3.5" />
            {canSync ? "Create Invoice" : "Sync QB first"}
          </>
        )}
      </button>

      {result && (
        <p
          className={`text-xs ${result.success ? "text-emerald-600" : "text-red-500"}`}
        >
          {result.success ? "✅" : "❌"} {result.message}
        </p>
      )}
    </div>
  );
}
