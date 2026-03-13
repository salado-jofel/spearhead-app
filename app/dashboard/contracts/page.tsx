import { getContractMaterials } from "./actions";
import Providers from "./(sections)/Providers";
import ContractCards from "./(sections)/ContactCards";

export default async function ContractsPage() {
  const contracts = await getContractMaterials();

  return (
    <Providers contracts={contracts}>
      <div className="p-8 mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Contracts</h1>
          <p className="text-sm text-slate-500 mt-1">
            Your contractor documents & forms
          </p>
        </div>
        <ContractCards />
      </div>
    </Providers>
  );
}
