import { AddFacilityModal } from "./AddFacilityModal";

export default function Header() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Facilities</h1>
        <p className="text-slate-500 text-sm">
          Manage your healthcare facilities
        </p>
      </div>

      <AddFacilityModal />
    </div>
  );
}
