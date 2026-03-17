"use client";

import { Menu, X } from "lucide-react";
import { useSidebar } from "../(components)/SidebarContext";
import { SpearheadBrand } from "@/app/(components)/SpearheadBrand";

export function MobileTopBar() {
  const { isOpen, toggle } = useSidebar();

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 shadow-sm">
      <SpearheadBrand layout="row" iconSize="w-7 h-7" textSize="text-sm" />

      <button
        onClick={toggle}
        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
    </header>
  );
}
