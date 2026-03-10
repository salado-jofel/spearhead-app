import { Button } from "@/components/ui/button";
import { Phone, PlayCircle } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center py-20  overflow-hidden bg-[#051a1d] text-white">
      {/* Background Radial Gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-[#0e2c3f]  to-[#1c6869]" />

      <div className="container relative z-10 mx-auto px-4 text-center w-full max-w-7xl">
        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-8 leading-[1.1]">
          The Next Big Thing in <br />
          <span className="text-emerald-300 italic">Medical Sales</span> <br />
          Is Here.
        </h1>

        {/* Subtext */}
        <p className="max-w-2xl mx-auto text-slate-300 text-lg mb-12 leading-relaxed">
          Spearhead Medical is seeking elite independent reps to own exclusive markets with our breakthrough <span className="text-emerald-400 font-semibold underline decoration-emerald-400/30 underline-offset-4">Non-Hydrolyzed Collagen</span> product — a clinically differentiated solution that sells itself.
        </p>

        {/* Hero Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Button size="lg" className="bg-emerald-400 hover:bg-emerald-500 text-emerald-950 font-bold h-14 px-8 rounded-full text-lg gap-3">
            <Phone className="w-5 h-5 fill-current" />
            Talk to Scottie Today
          </Button>
          <Button size="lg" variant="outline" className="border-white/40 bg-white/5 hover:bg-white/10 text-white font-medium h-14 px-8 rounded-full text-lg gap-3 backdrop-blur-sm">
            <PlayCircle className="w-5 h-5" />
            See the Product
          </Button>
        </div>

        {/* Stats Glass Card */}
        <div className="max-w-4xl mx-auto p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="flex flex-col items-center pt-6 md:pt-0">
              <span className="text-4xl font-bold text-white mb-2">94%</span>
              <span className="text-[10px] tracking-[0.2em] text-emerald-400 uppercase font-black">Rep Satisfaction</span>
            </div>
            <div className="flex flex-col items-center pt-6 md:pt-0">
              <span className="text-4xl font-bold text-white mb-2">3x</span>
              <span className="text-[10px] tracking-[0.2em] text-emerald-400 uppercase font-black">Avg. Commission Growth</span>
            </div>
            <div className="flex flex-col items-center pt-6 md:pt-0">
              <span className="text-4xl font-bold text-white mb-2">50+</span>
              <span className="text-[10px] tracking-[0.2em] text-emerald-400 uppercase font-black">Open Sales Markets</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}