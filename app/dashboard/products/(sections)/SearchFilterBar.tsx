"use client";

import type { Product } from "@/app/(interfaces)/product";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSearch, setFacilityFilter } from "../(redux)/products-slice";
import { Search } from "lucide-react";
import { useMemo } from "react";

export default function SearchFilterBar() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.products.items);
  const search = useAppSelector((state) => state.products.search);
  const facilityFilter = useAppSelector(
    (state) => state.products.facilityFilter,
  );

  const facilityOptions: string[] = useMemo(() => {
    const names = Array.from(
      new Set(
        items
          .map((p: Product) => p.facility_name)
          .filter((n): n is string => Boolean(n)),
      ),
    );
    return ["All Facilities", ...names];
  }, [items]);

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
      <select
        value={facilityFilter}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          dispatch(setFacilityFilter(e.target.value))
        }
        className="border border-slate-300 rounded-lg px-3 py-3 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
      >
        {facilityOptions.map((f: string) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>
    </div>
  );
}
