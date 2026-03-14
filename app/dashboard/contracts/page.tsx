import { getContractMaterials } from "./actions";
import Providers from "./(sections)/Providers";
import ContractCards from "./(sections)/ContactCards";
import Header from "./(sections)/Header";

export default async function ContractsPage() {
  const contracts = await getContractMaterials();

  return (
    <Providers contracts={contracts}>
      <div className="p-4 md:p-8 mx-auto space-y-6">
        <Header />
        <ContractCards />
      </div>
    </Providers>
  );
}
