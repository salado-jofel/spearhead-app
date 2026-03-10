import { Button } from "@/components/ui/button";
import {  Phone, User } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0d2b3f] border-b border-white/5">
      {/* 3. The inner container handles the centering, max-width, and padding */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 text-emerald-400">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-black tracking-tighter text-white uppercase">
              Spearhead
            </span>
            <span className="text-[10px] tracking-[0.2em] text-emerald-400/80 uppercase font-medium">
              Medical
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button className="bg-emerald-400 hover:bg-emerald-500 text-emerald-950 font-bold rounded-full h-9 px-5 gap-2 transition-all hover:scale-105">
            <Phone className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">Get In Touch</span>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10 rounded-full h-9 px-5 gap-2 backdrop-blur-md"
          >
            <Link href="/sign-in">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Rep Portal</span>
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
