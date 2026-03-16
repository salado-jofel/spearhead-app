import { AddFacilityModal } from "./AddFacilityModal";

export default function Header() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-800">
          Facilities
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Manage your healthcare facilities
        </p>
      </div>
    </div>
  );
}
