"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSearch } from "../(redux)/products-slice";
import { Search } from "lucide-react";

export default function SearchFilterBar() {
  const dispatch = useAppDispatch();
  const search = useAppSelector((state) => state.products.search);

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            dispatch(setSearch(e.target.value))
          }
          className="w-full pl-9 bg-white pr-4 py-3 border border-slate-300 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
        />
      </div>
    </div>
  );
}
