import { Megaphone } from "lucide-react";

export default function Header() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#2db0b0]/10 flex items-center justify-center">
        <Megaphone className="w-5 h-5 text-[#2db0b0]" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-slate-800">Marketing</h1>
        <p className="text-sm text-slate-400">
          Your marketing materials &amp; resources
        </p>
      </div>
    </div>
  );
}
