export const dynamic = "force-dynamic";

import { getMarketingMaterials } from "./actions";
import Providers from "./(sections)/Providers";
import Header from "./(sections)/Header";
import MarketingCards from "./(sections)/MarketingCards";

export default async function MarketingPage() {
  const materials = await getMarketingMaterials();

  return (
    <Providers materials={materials}>
      <div className="p-4 md:p-8 mx-auto space-y-6">
        <Header />
        <MarketingCards />
      </div>
    </Providers>
  );
}
