import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#0d1f2d] text-white py-12 px-6 border-t border-white/5">
      <div className="container mx-auto max-w-4xl text-center">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex flex-col leading-none mb-2">
            <span className="text-2xl font-black tracking-tighter uppercase">
              Spearhead
            </span>
            <span className="text-[10px] tracking-[0.4em] text-emerald-400/80 uppercase font-medium">
              Medical
            </span>
          </div>
          <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
            Empowering independent reps with cutting-edge medical solutions.
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-12">
          {["Product", "Why Us", "Demo", "Contact Scottie"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(" ", "-")}`}
              className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors"
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="w-full h-px bg-linear-to-r from-transparent via-white/10 to-transparent mb-8" />

        {/* Legal Info */}
        <div className="space-y-2">
          <p className="text-[11px] text-slate-500 uppercase tracking-widest">
            © 2026 Spearhead Medical. All rights reserved.
          </p>
          <p className="text-[10px] text-slate-600 italic">
            This page is intended for prospective independent sales
            representatives only.
          </p>
        </div>
      </div>
    </footer>
  );
}
