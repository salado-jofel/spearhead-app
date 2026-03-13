"use client";

import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import type { MarketingMaterial } from "@/app/(interfaces)/marketing";
import { Button } from "@/components/ui/button";
import { getSignedDownloadUrl } from "../actions";
import {
  FileText,
  Presentation,
  BookOpen,
  FlaskConical,
  FileBarChart2,
  ScrollText,
  ArrowDownToLine,
  Loader2,
} from "lucide-react";

// ─── Pick icon based on tag keyword ──────────────────────────────────────────
function getCardIcon(tag: string) {
  const t = tag?.toLowerCase() ?? "";
  if (t.includes("presentation") || t.includes("powerpoint"))
    return <Presentation className="w-6 h-6 text-white" />;
  if (t.includes("clinical") || t.includes("study") || t.includes("reference"))
    return <FlaskConical className="w-6 h-6 text-white" />;
  if (t.includes("brochure") || t.includes("comparison"))
    return <BookOpen className="w-6 h-6 text-white" />;
  if (t.includes("report") || t.includes("data"))
    return <FileBarChart2 className="w-6 h-6 text-white" />;
  if (t.includes("contract") || t.includes("agreement"))
    return <ScrollText className="w-6 h-6 text-white" />;
  return <FileText className="w-6 h-6 text-white" />;
}

// ─── Group label from tag ─────────────────────────────────────────────────────
function getGroup(tag?: string): string {
  const t = (tag ?? "").toLowerCase();
  if (t.includes("reimbursement")) return "Reimbursement Guides";
  if (t.includes("product document")) return "Product Documents";
  return "Marketing Materials";
}

const GROUP_ORDER = [
  "Marketing Materials",
  "Reimbursement Guides",
  "Product Documents",
];

// ─── Card ─────────────────────────────────────────────────────────────────────
function MarketingCard({ card }: { card: MarketingMaterial }) {
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
      console.error("[handleDownload] Error:", err);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col w-full max-w-[280px]">
      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-[#2db0b0] to-[#1a8f8f] p-5 relative overflow-hidden">
        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -left-4 w-20 h-20 rounded-full bg-white/10" />

        <div className="relative z-10 flex items-start justify-between">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-sm">
            {getCardIcon(card.tag)}
          </div>
          <span className="text-xs font-semibold bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
            {card.tag?.split("+")[0]?.trim() ?? "PDF"}
          </span>
        </div>

        <div className="relative z-10 mt-4">
          <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">
            {card.title}
          </h3>
          {card.tag?.includes("+") && (
            <p className="text-xs text-white/70 mt-1">
              {card.tag.split("+")[1]?.trim()}
            </p>
          )}
        </div>
      </div>

      {/* ── Body ── */}
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

// ─── Section heading + divider ────────────────────────────────────────────────
function SectionGroup({
  title,
  items,
}: {
  title: string;
  items: MarketingMaterial[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-5">
      {/* Title + divider */}
      <div className="flex items-center gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 whitespace-nowrap">
          {title}
        </h2>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Cards */}
      <div className="flex flex-wrap gap-5">
        {items.map((card) => (
          <MarketingCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MarketingCards() {
  const items = useAppSelector((state) => state.marketing.items);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-base font-semibold text-slate-400">
          No materials available
        </p>
        <p className="text-sm text-slate-300 mt-1">
          Materials will appear here once added
        </p>
      </div>
    );
  }

  // Group items by tag category, preserving sort_order within each group
  const grouped = GROUP_ORDER.reduce<Record<string, MarketingMaterial[]>>(
    (acc, group) => {
      acc[group] = items.filter((item) => getGroup(item.tag) === group);
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-10">
      {GROUP_ORDER.map((group) => (
        <SectionGroup key={group} title={group} items={grouped[group]} />
      ))}
    </div>
  );
}
