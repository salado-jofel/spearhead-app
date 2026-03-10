import SearchFilterBar from "./(sections)/SearchFilterBar";
import Header from "./(sections)/Header";
import FacilitiesTable from "./(sections)/FacilitiesTable";
import Providers from "./(sections)/Providers";
import { getFacilities } from "./actions";

export default async function FacilitiesPage() {
  const facilities = await getFacilities();

  return (
    <Providers facilities={facilities}>
      <div className="p-8 w-full mx-auto space-y-6 select-none  h-full overflow-y-auto">
        <Header />
        <SearchFilterBar />
        <FacilitiesTable />
      </div>
    </Providers>
  );
}
