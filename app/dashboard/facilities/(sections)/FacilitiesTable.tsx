"use client";

import { useState } from "react";
import type { Facility } from "@/app/(interfaces)/facility";
import { deleteFacility } from "../actions";
import { StatusBadge } from "../../(components)/StatusBadge";
import ConfirmModal from "@/app/(components)/ConfirmModal";
import { Building2, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeFacilityFromStore } from "../(redux)/facilities-slice";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

export default function FacilitiesTable() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.facilities.items);
  const search = useAppSelector((state) => state.facilities.search);
  const typeFilter = useAppSelector((state) => state.facilities.typeFilter);

  // ── Modal state ─────────────────────────────────────────
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered: Facility[] = useMemo(() => {
    return items.filter((f: Facility) => {
      const q = search.toLowerCase();
      const matchesSearch =
        search === "" ||
        f.name?.toLowerCase().includes(q) ||
        f.type?.toLowerCase().includes(q) ||
        f.contact?.toLowerCase().includes(q) ||
        f.phone?.toLowerCase().includes(q);

      const matchesType = typeFilter === "All Types" || f.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [items, search, typeFilter]);

  function handleRowClick(id: string) {
    router.push(`/dashboard/facilities/${id}`);
  }

  // ── Step 1: open modal, store which ID to delete ─────────
  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setPendingDeleteId(id);
    setConfirmOpen(true);
  }

  // ── Step 2: user confirmed — actually delete ─────────────
  async function handleConfirmDelete() {
    if (!pendingDeleteId) return;
    setIsDeleting(true);
    try {
      await deleteFacility(pendingDeleteId);
      dispatch(removeFacilityFromStore(pendingDeleteId));
      setConfirmOpen(false);
      setPendingDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      {/* ── Confirm Modal ─────────────────────────────────── */}
      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Facility?"
        description="This will permanently remove the facility and all its data. This action cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />

      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl flex flex-col h-[calc(100vh-267px)]">
        {/* ── Scrollable Table Body ── */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm text-left">
            {/* ── Sticky Header ── */}
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#2db0b0] text-white">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filtered.map((facility: Facility) => (
                <tr
                  key={facility.id}
                  onClick={() => facility.id && handleRowClick(facility.id)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 text-slate-700 font-medium">
                    {facility.name}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{facility.type}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {facility.contact}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{facility.phone}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={facility.status} />
                  </td>
                  <td className="px-4 py-3">
                    {facility.id && (
                      <button
                        type="button"
                        onClick={(e: React.MouseEvent) =>
                          handleDelete(e, facility.id!)
                        }
                        className="p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded"
                        title="Delete facility"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── Empty State ── */}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <Building2 className="w-12 h-12 mb-3 text-slate-200 stroke-1" />
              <p className="text-base font-medium text-slate-400">
                No Facilities Yet
              </p>
            </div>
          )}
        </div>

        {/* ── Footer: Row Count ── */}
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
