import { Facility } from "@/app/(interfaces)/facility";
import { deleteFacility } from "../actions";
import { StatusBadge } from "../../(components)/StatusBadge";
import { Building2, Trash2 } from "lucide-react";

export default function FacilitiesTable({
  filtered,
}: {
  filtered: Facility[];
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-4 py-3 font-medium text-slate-500">Name</th>
            <th className="px-4 py-3 font-medium text-slate-500">Type</th>
            <th className="px-4 py-3 font-medium text-slate-500">Contact</th>
            <th className="px-4 py-3 font-medium text-[#2db0b0]">Phone</th>
            <th className="px-4 py-3 font-medium text-slate-500">Status</th>
            <th className="px-4 py-3 font-medium text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filtered.map((facility: Facility) => (
            <tr
              key={facility.id}
              className="hover:bg-slate-50 transition-colors"
            >
              <td className="px-4 py-3 text-slate-700 font-medium">
                {facility.name}
              </td>
              <td className="px-4 py-3 text-slate-500">{facility.type}</td>
              <td className="px-4 py-3 text-slate-500">{facility.contact}</td>
              <td className="px-4 py-3 text-slate-500">{facility.phone}</td>
              <td className="px-4 py-3">
                <StatusBadge status={facility.status} />
              </td>
              <td className="px-4 py-3">
                <form action={deleteFacility.bind(null, facility.id)}>
                  <button
                    type="submit"
                    className="p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded"
                    title="Delete facility"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Empty State ─────────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Building2 className="w-12 h-12 mb-3 text-slate-200 stroke-1" />
          <p className="text-base font-medium text-slate-400">
            No Facilities Yet
          </p>
        </div>
      )}
    </div>
  );
}
