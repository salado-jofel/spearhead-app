import { getAllProducts } from "./actions";
import Providers from "./(sections)/Providers";
import Header from "./(sections)/Header";
import SearchFilterBar from "./(sections)/SearchFilterBar";
import ProductsTable from "./(sections)/ProductsTable";

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <Providers products={products}>
      <div className="p-8 w-full mx-auto space-y-6 select-none h-full overflow-y-auto bg-slate-50">
        <Header />
        <SearchFilterBar />
        <ProductsTable />
      </div>
    </Providers>
  );
}
