"use client";

import { useAppSelector } from "@/store/hooks";

export default function Header() {
  const total = useAppSelector((state) => state.products.items.length);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-800">
          Products
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {total} product{total !== 1 ? "s" : ""} across all facilities
        </p>
      </div>
    </div>
  );
}
