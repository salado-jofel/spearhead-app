"use client";

import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteFacility } from "../actions";
import { useAppDispatch } from "@/store/hooks";
import { clearFacility } from "../(redux)/facility-slice";
import { StatusBadge } from "../../../(components)/StatusBadge";

export default function Header() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const item = useAppSelector((state) => state.facility.item);

  async function handleDelete() {
    if (!item?.id) return;
    dispatch(clearFacility());
    await deleteFacility(item.id);
    router.push("/dashboard/facilities");
  }

  return (
    <div className="space-y-6 ">
      {/* ── Back Button ── */}
      <button
        type="button"
        onClick={() => router.push("/dashboard/facilities")}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#2db0b0] transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Facilities
      </button>

      {/* ── Hero Card ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* ── Icon Avatar ── */}
            <div className="w-14 h-14 rounded-xl bg-[#2db0b0]/10 flex items-center justify-center shrink-0">
              <Building2 className="w-7 h-7 text-[#2db0b0]" />
            </div>

            {/* ── Name + Meta ── */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-800">
                {item?.name ?? "—"}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {item?.type ?? "—"}
                </span>
                {item?.status && <StatusBadge status={item.status} />}
              </div>
            </div>
          </div>

          {/* ── Delete Button ── */}
          <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
            className="text-red-400 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Facility
          </Button>
        </div>
      </div>
    </div>
  );
}
