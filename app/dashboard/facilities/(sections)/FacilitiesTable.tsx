"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeFacilityFromStore } from "../(redux)/facilities-slice";
import { deleteFacility } from "../actions";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Trash2, Building2, CheckCircle2, XCircle } from "lucide-react";
import ConfirmModal from "@/app/(components)/ConfirmModal";
import type { Facility } from "@/app/(interfaces)/facility";
import { AddFacilityModal } from "./AddFacilityModal";

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
    return facility.qb_synced_at
      ? new Date(facility.qb_synced_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null;
  };

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

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[calc(100vh-220px)] md:h-[calc(100vh-267px)]">
        {/* ── Card Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold text-slate-700">
              All Facilities
            </h2>
            <p className="text-xs text-slate-400">
              Showing{" "}
              <span className="font-medium text-slate-600">
                {filtered.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-600">{items.length}</span>{" "}
              facilities
            </p>
          </div>
          <AddFacilityModal />
        </div>

        {/* ── Scrollable Content ── */}
        <div className="overflow-auto flex-1">
          {/* ── Mobile card list (below md) ── */}
          <div className="md:hidden">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No facilities found</p>
              </div>
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
                        <div className="w-8 h-8 rounded-lg bg-[#2db0b0]/10 flex items-center justify-center shrink-0">
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
          </div>

          {/* ── Desktop table (md+) ── */}
          <table className="hidden md:table w-full text-sm text-left">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#2db0b0] text-white">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">QuickBooks</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-20">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No facilities found</p>
                      <p className="text-xs text-slate-300 mt-1">
                        Try adjusting your search or filter
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((facility: Facility) => (
                  <tr
                    key={facility.id}
                    onClick={() =>
                      router.push(`/dashboard/facilities/${facility.id}`)
                    }
                    className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#2db0b0]/10 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 text-[#2db0b0]" />
                        </div>
                        <span className="text-slate-700 font-medium text-sm">
                          {facility.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-sm">
                      {facility.type}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-sm">
                      {facility.contact}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-sm">
                      {facility.phone}
                    </td>
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
                        className="p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Footer ── */}
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60 shrink-0">
          <p className="text-xs text-slate-400">
            Showing{" "}
            <span className="font-medium text-slate-600">
              {filtered.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-600">{items.length}</span>{" "}
            facilities
          </p>
        </div>
      </div>
    </>
  );
}
