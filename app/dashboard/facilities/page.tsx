import { createClient } from "@/utils/supabase/server";
import { AddFacilityModal } from "./(sections)/AddFacilityModal";
import SearchFilterBar from "./(sections)/SearchFilterBar";
import { Facility } from "@/app/(interfaces)/facility";
import Header from "./(sections)/Header";
import FacilitiesTable from "./(sections)/FacilitiesTable";
import Providers from "./(sections)/Providers";
import { getFacilities } from "./actions";

export default async function FacilitiesPage() {
  const facilities = await getFacilities();

  return (
    <Providers facilities={facilities}>
      <div className="p-8 w-full mx-auto space-y-6 select-none h-full">
        <Header />
        <AddFacilityModal />
        <div>
          <SearchFilterBar />
          <FacilitiesTable filtered={facilities} />
        </div>
      </div>
    </Providers>
  );
}
