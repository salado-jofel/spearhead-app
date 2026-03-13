"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Building2,
  Package,
  UserCircle,
  Megaphone,
  FileText,
  User,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; // Adjust path to your supabase client
import { SignOutButton } from "../(components)/SignOutButton";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: ShoppingCart, label: "Orders", href: "/dashboard/orders" },
  { icon: Building2, label: "Facilities", href: "/dashboard/facilities" },
  { icon: Package, label: "Products", href: "/dashboard/products" },
  { icon: UserCircle, label: "Profile", href: "/dashboard/profile" },
  { icon: Megaphone, label: "Marketing", href: "/dashboard/marketing" },
  { icon: FileText, label: "Contracts", href: "/dashboard/contracts" },
  { icon: BookOpen, label: "Trainings", href: "/dashboard/trainings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const supabase = createClient();

  // State for user data
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
    initials: string;
  } | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Get name from metadata (stored during signup)
        const firstName = user.user_metadata?.first_name || "";
        const lastName = user.user_metadata?.last_name || "";
        const fullName = `${firstName} ${lastName}`.trim() || "User";

        // Generate initials
        const initials =
          `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";

        setUserData({
          name: fullName,
          email: user.email || "",
          initials: initials,
        });
      }
    };

    getUser();
  }, [supabase]);

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col fixed h-full z-40 select-none">
      {/* Branding Section */}
      <div className="p-8 flex flex-col items-center select-none">
        <div className="w-10 h-10 text-[#2db0b0] mb-3">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
          </svg>
        </div>
        <span className="font-black text-[#2db0b0] tracking-widest uppercase text-base">
          Spearhead
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                isActive
                  ? "bg-[#f0f9f9] text-[#2db0b0] border-l-4 border-[#2db0b0] rounded-l-none"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon
                className={`w-5 h-5 ${isActive ? "text-[#2db0b0]" : "text-slate-400"}`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-50 bg-white">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafb] border border-slate-100 mb-3">
          {/* Dynamic Initials Avatar */}
          <div className="w-10 h-10 rounded-full bg-[#1db0b0] flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {userData?.initials || <User className="w-5 h-5" />}
          </div>

          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold text-[#1e293b] leading-tight truncate">
              {userData?.name || "Loading..."}
            </span>
            <span className="text-[10px] text-slate-500 font-medium truncate">
              {userData?.email || "Sales Representative"}
            </span>
          </div>
        </div>
        <SignOutButton />
      </div>
    </aside>
  );
}
