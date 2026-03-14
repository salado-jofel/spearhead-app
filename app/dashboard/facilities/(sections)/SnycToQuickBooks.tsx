"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { syncFacilityToQuickBooks } from "../quickbook-actions";

interface Props {
  facilityId: string;
  facilityName: string;
  qbCustomerId?: string | null;
  qbSyncedAt?: string | null;
}

export default function SyncToQuickBooks({
  facilityId,
  facilityName,
  qbCustomerId,
  qbSyncedAt,
}: Props) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  async function handleSync() {
    setIsSyncing(true);
    setResult(null);
    try {
      const res = await syncFacilityToQuickBooks(facilityId);
      setResult(res);
    } catch {
      setResult({ success: false, message: "Unexpected error occurred" });
    } finally {
      setIsSyncing(false);
    }
  }

  const syncedDate = qbSyncedAt
    ? new Date(qbSyncedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Sync Status */}
      <div className="flex items-center gap-1.5">
        {qbCustomerId ? (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            QB Synced
            {syncedDate && (
              <span className="text-slate-400 font-normal">· {syncedDate}</span>
            )}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
            <XCircle className="w-3.5 h-3.5" />
            Not Synced
          </span>
        )}
      </div>

      {/* Sync Button */}
      <button
        onClick={handleSync}
        disabled={isSyncing}
        title={`Sync ${facilityName} to QuickBooks`}
        className="inline-flex items-center gap-1.5 text-xs text-[#2db0b0] hover:text-[#249191] font-medium disabled:opacity-50 cursor-pointer transition-colors"
      >
        {isSyncing ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Syncing...
          </>
        ) : (
          <>
            <RefreshCw className="w-3.5 h-3.5" />
            {qbCustomerId ? "Re-sync" : "Sync to QB"}
          </>
        )}
      </button>

      {/* Result Message */}
      {result && (
        <p
          className={`text-xs ${
            result.success ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {result.success ? "✅" : "❌"} {result.message}
        </p>
      )}
    </div>
  );
}
