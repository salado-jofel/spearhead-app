"use client";

import { Menu, X } from "lucide-react";
import { useSidebar } from "../(components)/SidebarContext";

export function MobileTopBar() {
  const { isOpen, toggle } = useSidebar();

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 shadow-sm">
      {/* Branding */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 text-[#2db0b0]">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
          </svg>
        </div>
        <span className="font-black text-[#2db0b0] tracking-widest uppercase text-sm">
          Spearhead
        </span>
      </div>

      {/* Hamburger toggle */}
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
