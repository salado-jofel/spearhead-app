"use client";

import { Facility } from "@/app/(interfaces)/facility";
import { useAppSelector } from "@/store/hooks";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

export default function SearchFilterBar() {
  const state = useAppSelector((state) => state.facilities);
  const [search, setSearch] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("All Types");
  const typeOptions: string[] = useMemo(() => {
    const types = Array.from(
      new Set(state.items.map((f: Facility) => f.type).filter(Boolean)),
    );
    return ["All Types", ...types];
  }, [state.items]);

  return (
    <div className="flex items-center gap-2 mb-4 shadow-2xl">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          className="w-full pl-9 bg-white pr-4 py-3 border border-slate-300 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
        />
      </div>
      <select
        value={typeFilter}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          setTypeFilter(e.target.value)
        }
        className="border border-slate-300 rounded-lg px-3 py-3 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
      >
        {typeOptions.map((t: string) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}
