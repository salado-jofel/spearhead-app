import { getFacilityById, getProductsByFacilityId } from "./actions";
import { notFound } from "next/navigation";
import Providers from "./(sections)/Providers";
import Header from "./(sections)/Header";
import FacilityDetails from "./(sections)/FacilityDetails";
import ProductsTable from "./(sections)/ProductsTable";

export default async function FacilityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [facility, products] = await Promise.all([
    getFacilityById(id),
    getProductsByFacilityId(id),
  ]);

  if (!facility) notFound();

  return (
    <Providers facility={facility} products={products}>
      <div className="p-8  w-full mx-auto space-y-6 select-none h-full overflow-y-auto bg-slate-50">
        <Header />
        <FacilityDetails />
        <ProductsTable />
      </div>
    </Providers>
  );
}
