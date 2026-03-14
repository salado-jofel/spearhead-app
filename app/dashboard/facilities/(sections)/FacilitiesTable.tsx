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

      <div className="overflow-x-auto rounded-xl border border-slate-200">
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
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        facility.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {facility.status}
                    </span>
                  </td>

                  {/* QuickBooks — display only, auto-synced */}
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {facility.qb_customer_id ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        QB Synced
                        {facility.qb_synced_at && (
                          <span className="text-slate-400 font-normal">
                            ·{" "}
                            {new Date(facility.qb_synced_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
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

                  {/* Actions */}
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setPendingDeleteId(facility.id!);
                        setShowConfirm(true);
                      }}
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

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-400">
          Showing {filtered.length} of {items.length} facilities
        </div>
      </div>
    </>
  );
}
