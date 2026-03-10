"use client";

import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarketingCard {
  id: number;
  title: string;
  tag: string;
  description: string;
  file: string;
}

const MARKETING_MATERIALS: MarketingCard[] = [
  {
    id: 1,
    title: "Non Hydrolyzed Collagen Powerpoint",
    tag: "PDF + Sales Presentation",
    description:
      "Advanced bioactive scaffold for superior surgical wound healing and tissue regeneration. Full sales pitch deck for physician presentations.",
    file: "#",
  },
  {
    id: 2,
    title: "Non-Hydrolyzed vs Hydrolyzed Collagen",
    tag: "PDF + Clinical Brochure",
    description:
      "Clinical comparison brochure explaining the key differences between Non-Hydrolyzed and Hydrolyzed Collagen for wound healing applications.",
    file: "#",
  },
  {
    id: 3,
    title: "Clinical Collagen Dressing Study",
    tag: "PDF + Clinical Reference",
    description:
      "Clinical reference document covering bioactive collagen dressings — indications, wound types, and evidence-based applications for surgical and chronic wound care.",
    file: "#",
  },
];

function MarketingCard({ card }: { card: MarketingCard }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* ── Card Header ─────────────────────────────────────── */}
      <div className="bg-[#2db0b0] p-4 flex items-start gap-3">
        <div className="p-2 bg-white/20 rounded-lg shrink-0">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-snug">
            {card.title}
          </p>
          <p className="text-xs text-teal-100 mt-0.5">{card.tag}</p>
        </div>
      </div>

      {/* ── Card Body ───────────────────────────────────────── */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-4">
        <p className="text-sm text-slate-500 leading-relaxed">
          {card.description}
        </p>
        <Button
          asChild
          className="w-full bg-[#2db0b0] hover:bg-[#249191] text-white text-sm"
        >
          <a href={card.file} download>
            <Download className="w-4 h-4 mr-2" />
            Download
          </a>
        </Button>
      </div>
    </div>
  );
}

export default function MarketingCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {MARKETING_MATERIALS.map((card) => (
        <MarketingCard key={card.id} card={card} />
      ))}
    </div>
  );
}
