"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeFacilityFromStore } from "../(redux)/facilities-slice";
import { deleteFacility } from "../actions";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Trash2, Building2, CheckCircle2, XCircle } from "lucide-react";
import ConfirmModal from "@/app/(components)/ConfirmModal";
import type { Facility } from "@/app/(interfaces)/facility";

export default function FacilitiesTable() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const items = useAppSelector((state) => state.facilities.items);
  const search = useAppSelector((state) => state.facilities.search);
  const typeFilter = useAppSelector((state) => state.facilities.typeFilter);

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    return items.filter((f: Facility) => {
      const matchesSearch =
        !search ||
        f.name?.toLowerCase().includes(search.toLowerCase()) ||
        f.contact?.toLowerCase().includes(search.toLowerCase());
      const matchesType =
        !typeFilter || typeFilter === "All Types" || f.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [items, search, typeFilter]);

  async function handleDelete() {
    if (!pendingDeleteId) return;
    setIsDeleting(true);
    try {
      await deleteFacility(pendingDeleteId);
      dispatch(removeFacilityFromStore(pendingDeleteId));
      setShowConfirm(false);
      setPendingDeleteId(null);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeleting(false);
    }
  }

  function triggerDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setPendingDeleteId(id);
    setShowConfirm(true);
  }

  const statusCls = (status?: string) =>
    status === "Active"
      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
      : "bg-slate-100 text-slate-500 border border-slate-200";

  const qbSyncedLabel = (facility: Facility) => {
    if (!facility.qb_customer_id) return null;
    const date = facility.qb_synced_at
      ? new Date(facility.qb_synced_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null;
    return date;
  };

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
      <p className="font-medium">No facilities found</p>
    </div>
  );

  return (
    <>
      <ConfirmModal
        open={showConfirm}
        onOpenChange={(open) => {
          if (!isDeleting) {
            setShowConfirm(open);
            if (!open) setPendingDeleteId(null);
          }
        }}
        title="Delete Facility"
        description="Are you sure you want to delete this facility? This action cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />

      {/* ── Mobile card list (below md) ───────────────────────────── */}
      <div className="md:hidden bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          emptyState
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((facility: Facility) => (
              <div
                key={facility.id}
                onClick={() =>
                  router.push(`/dashboard/facilities/${facility.id}`)
                }
                className="p-4 flex flex-col gap-3 cursor-pointer hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                {/* Row 1: Name + Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-[#2db0b0]" />
                    </div>
                    <span className="font-semibold text-slate-800 text-sm truncate">
                      {facility.name}
                    </span>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusCls(facility.status)}`}
                  >
                    {facility.status}
                  </span>
                </div>

                {/* Row 2: Type · Contact */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                  {facility.type && <span>{facility.type}</span>}
                  {facility.type && facility.contact && (
                    <span className="text-slate-300">·</span>
                  )}
                  {facility.contact && <span>{facility.contact}</span>}
                </div>

                {/* Row 3: Phone */}
                {facility.phone && (
                  <p className="text-xs text-slate-500">{facility.phone}</p>
                )}

                {/* Row 4: QB status + Delete */}
                <div
                  className="flex items-center justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  {facility.qb_customer_id ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      QB Synced
                      {qbSyncedLabel(facility) && (
                        <span className="text-slate-400 font-normal">
                          · {qbSyncedLabel(facility)}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <XCircle className="w-3.5 h-3.5" />
                      Not Synced
                    </span>
                  )}

                  <button
                    onClick={(e) => triggerDelete(e, facility.id!)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-400">
          Showing {filtered.length} of {items.length} facilities
        </div>
      </div>

      {/* ── Desktop table (md+) ───────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 text-slate-500 font-medium">
                Name
              </th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">
                Type
              </th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">
                Contact
              </th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">
                Phone
              </th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">
                Status
              </th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">
                QuickBooks
              </th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-slate-400">
                  <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No facilities found</p>
                </td>
              </tr>
            ) : (
              filtered.map((facility: Facility) => (
                <tr
                  key={facility.id}
                  onClick={() =>
                    router.push(`/dashboard/facilities/${facility.id}`)
                  }
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {facility.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{facility.type}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {facility.contact}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{facility.phone}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCls(facility.status)}`}
                    >
                      {facility.status}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {facility.qb_customer_id ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        QB Synced
                        {qbSyncedLabel(facility) && (
                          <span className="text-slate-400 font-normal">
                            · {qbSyncedLabel(facility)}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <XCircle className="w-3.5 h-3.5" />
                        Not Synced
                      </span>
                    )}
                  </td>
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => triggerDelete(e, facility.id!)}
                      className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-400">
          Showing {filtered.length} of {items.length} facilities
        </div>
      </div>
    </>
  );
}
