import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dna, TrendingUp, ShieldCheck, Handshake } from "lucide-react";

const details = [
  {
    title: "Clinically Differentiated",
    desc: "Full-chain, non-denatured collagen matrix that outperforms hydrolyzed alternatives in bioavailability and tissue integration studies.",
    icon: Dna,
  },
  {
    title: "Proven Clinical Outcomes",
    desc: "Supported by peer-reviewed data showing measurable improvements in patient outcomes — giving you the science to close confidently.",
    icon: TrendingUp,
  },
  {
    title: "Regulatory Compliant",
    desc: "Fully compliant and market-ready. Focus on selling, not paperwork — we handle the backend so you can focus on revenue.",
    icon: ShieldCheck,
  },
  {
    title: "Physician-Preferred Formula",
    desc: "Designed with feedback from leading practitioners. Physicians ask for it by name — making reorders effortless and pipeline sticky.",
    icon: Handshake,
  },
];

export function Product() {
  return (
    <section  className="py-24 bg-slate-50/50">
      <div className="container mx-auto px-4 w-full max-w-7xl">
        {/* Header Section */}
        <div className="text-center max-w-4xl mx-auto mb-20 space-y-6">
          <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-emerald-500/20 bg-emerald-500/5 text-emerald-600 px-4">
            The Product
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
            Non-Hydrolyzed Collagen — <br />
            <span className="text-emerald-500 italic">Redefining Regeneration</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Unlike traditional hydrolyzed collagen, our Non-Hydrolyzed Collagen preserves the full native molecular structure — delivering superior bioavailability and clinical outcomes that set you apart in every room.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 max-w-6xl mx-auto">
          {/* Left Side: Circular Graphic */}
          <div className="lg:w-1/2 flex flex-col items-center">
            <div className="relative flex items-center justify-center">
              {/* Concentric Rings */}
              <div className="absolute w-70 h-70 rounded-full border border-emerald-500/10" />
              <div className="absolute w-85 h-85 rounded-full border border-emerald-500/5" />
              
              {/* Main Icon Circle */}
              <div className="relative w-24 h-24 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Dna className="text-white w-10 h-10" />
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <h4 className="font-bold text-slate-900 text-lg uppercase tracking-tight">
                Non-Hydrolyzed Collagen™
              </h4>
              <p className="text-emerald-600 text-sm font-medium mt-1">
                Native Molecular Structure Preserved
              </p>
            </div>
          </div>

          {/* Right Side: Info Cards */}
          <div className="lg:w-1/2 space-y-4">
            {details.map((item, i) => (
              <Card key={i} className="border-none shadow-sm shadow-slate-200/50 bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="mt-1 shrink-0 w-10 h-10 rounded-lg bg-emerald-500/5 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900">{item.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}