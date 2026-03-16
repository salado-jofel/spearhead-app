import FacilitiesTable from "./(sections)/FacilitiesTable";
import Header from "./(sections)/Header";
import Providers from "./(sections)/Providers";
import SearchFilterBar from "./(sections)/SearchFilterBar";
import { getFacilities } from "./actions";

export default async function FacilitiesPage() {
  const facilities = await getFacilities();
  return (
    <Providers facilities={facilities}>
      <div className="p-4 md:p-8 w-full mx-auto space-y-6 select-none h-full overflow-y-auto">
        <Header /> 
        <SearchFilterBar />
        <FacilitiesTable />
      </div>
    </Providers>
  );
}
