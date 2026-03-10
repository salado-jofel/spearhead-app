import ContractCards from "./(sections)/ContactCards";
import Header from "./(sections)/Header";

export default function ContractsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <Header />
      <ContractCards />
    </div>
  );
}
