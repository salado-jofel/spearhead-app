"use client";

import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContractCard {
  id: number;
  title: string;
  tag: string;
  description: string;
  headerBg: string;
  file: string;
}

const CONTRACTS: ContractCard[] = [
  {
    id: 1,
    title: "Contractor I-9",
    tag: "PDF + Identity & Employment Eligibility",
    description:
      "Employment eligibility verification form required for all independent contractors working with Spaarhead Medical.",
    headerBg: "bg-[#2db0b0]",
    file: "#",
  },
  {
    id: 2,
    title: "IC Contract — Spearhead Medical",
    tag: "PDF + Independent Contractor Agreement",
    description:
      "Independent Contractor and Consulting Agreement between Spearhead Medical (Meridian Surgical Supplies LLC) and the contractor. Outlines services, terms, and conditions.",
    headerBg: "bg-slate-700",
    file: "#",
  },
  {
    id: 3,
    title: "W-9 Contractor",
    tag: "PDF + Tax Form",
    description:
      "W-9 tax form required for independent contractor payment processing and IRS reporting purposes.",
    headerBg: "bg-[#2db0b0]",
    file: "#",
  },
];

function ContractCard({ card }: { card: ContractCard }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* ── Card Header ─────────────────────────────────────── */}
      <div className={`${card.headerBg} p-4 flex items-start gap-3`}>
        <div className="p-2 bg-white/20 rounded-lg shrink-0">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-snug">
            {card.title}
          </p>
          <p className="text-xs text-white/70 mt-0.5">{card.tag}</p>
        </div>
      </div>

      {/* ── Card Body ───────────────────────────────────────── */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-4">
        <p className="text-sm text-[#2db0b0] leading-relaxed">
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

export default function ContractCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
      {CONTRACTS.map((card) => (
        <ContractCard key={card.id} card={card} />
      ))}
    </div>
  );
}
