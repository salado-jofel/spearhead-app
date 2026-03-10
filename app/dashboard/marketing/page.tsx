import Header from "./(sections)/Header";
import MarketingCards from "./(sections)/MarketingCards";

export default function MarketingPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <Header />
      <MarketingCards />
    </div>
  );
}
