"use client";

import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { getSignedDownloadUrl } from "../actions";
import {
  FileText,
  ScrollText,
  FileCheck2,
  Receipt,
  ArrowDownToLine,
  Loader2,
} from "lucide-react";
import { ContractMaterial } from "@/app/(interfaces)/contracts";

function getCardIcon(tag: string) {
  const t = tag?.toLowerCase() ?? "";
  if (t.includes("agreement") || t.includes("contract"))
    return <ScrollText className="w-6 h-6 text-white" />;
  if (t.includes("tax") || t.includes("w-9"))
    return <Receipt className="w-6 h-6 text-white" />;
  if (t.includes("i-9") || t.includes("verification"))
    return <FileCheck2 className="w-6 h-6 text-white" />;
  return <FileText className="w-6 h-6 text-white" />;
}

function ContractCard({ card }: { card: ContractMaterial }) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setIsDownloading(true);
    try {
      const signedUrl = await getSignedDownloadUrl(card.file_url);
      const link = document.createElement("a");
      link.href = signedUrl;
      link.target = "_blank";
      link.rel = "noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("[handleDownload]", err);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    // ✅ Removed max-w-70 — grid controls sizing now
    <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col w-full">
      {/* Header */}
      <div className="bg-linear-to-br from-[#2db0b0] to-[#1a8f8f] p-5 relative overflow-hidden">
        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -left-4 w-20 h-20 rounded-full bg-white/10" />

        <div className="relative z-10 flex items-start justify-between">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-sm">
            {getCardIcon(card.tag)}
          </div>
          <span className="text-xs font-semibold bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
            {card.tag?.split("•")[0]?.trim() ?? "PDF"}
          </span>
        </div>

        <div className="relative z-10 mt-4">
          <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">
            {card.title}
          </h3>
          {card.tag?.includes("•") && (
            <p className="text-xs text-white/70 mt-1">
              {card.tag.split("•")[1]?.trim()}
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-4">
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
          {card.description}
        </p>
        <Button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full bg-[#2db0b0] hover:bg-[#249191] text-white text-sm font-medium cursor-pointer shadow-sm transition-all duration-200 disabled:opacity-70"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Preparing...
            </>
          ) : (
            <>
              <ArrowDownToLine className="w-4 h-4 mr-2" />
              Download
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function ContractCards() {
  const items = useAppSelector((state) => state.contracts.items);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-base font-semibold text-slate-400">
          No contracts available
        </p>
        <p className="text-sm text-slate-300 mt-1">
          Contracts will appear here once added
        </p>
      </div>
    );
  }

  return (
    // ✅ Responsive grid: 1 col mobile → 2 col tablet → 3 col desktop → 4 col xl
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {items.map((card) => (
        <ContractCard key={card.id} card={card} />
      ))}
    </div>
  );
}
