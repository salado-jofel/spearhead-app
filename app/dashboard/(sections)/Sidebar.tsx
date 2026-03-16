"use client";

import {
  LayoutDashboard,
  ShoppingCart,
  Building2,
  Package,
  UserCircle,
  Megaphone,
  ScrollText,
  BookOpen,
  User,
  Stethoscope,
  BriefcaseMedical,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { SignOutButton } from "../(components)/SignOutButton";
import { useSidebar } from "../(components)/SidebarContext";
import { useAppSelector } from "@/store/hooks";

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const userData = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    close();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const isDoctor = userData.role === "doctor";

  const navItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/dashboard",
      doctorHidden: false,
    },
    {
      icon: ShoppingCart,
      label: "Orders",
      href: "/dashboard/orders",
      doctorHidden: false,
    },
    {
      icon: Building2,
      label: "Facilities",
      href: "/dashboard/facilities",
      doctorHidden: true,
    },
    {
      icon: Package,
      label: "Products",
      href: "/dashboard/products",
      doctorHidden: false,
    },
    {
      icon: UserCircle,
      label: "Profile",
      href: "/dashboard/profile",
      doctorHidden: false,
    },
    {
      icon: Megaphone,
      label: "Marketing",
      href: "/dashboard/marketing",
      doctorHidden: true,
    },
    {
      icon: ScrollText,
      label: "Contracts",
      href: "/dashboard/contracts",
      doctorHidden: false,
    },
    {
      icon: BookOpen,
      label: "Trainings",
      href: "/dashboard/trainings",
      doctorHidden: true,
    },
  ];

  return (
    <>
      {/* ── Overlay (mobile only) ─────────────────────────── */}
      <div
        className={`
          fixed inset-0 bg-black/40 z-40 md:hidden top-16
          transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={close}
        aria-hidden="true"
      />

      {/* ── Sidebar panel ─────────────────────────────────── */}
      <aside
        className={`
          w-64 bg-white flex flex-col select-none
          fixed z-50
          top-16 h-[calc(100%-4rem)]
          md:top-0 md:h-full
          transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ borderRight: "1px solid #e8f8f7" }}
      >
        {/* ── Branding — desktop only ── */}
        <div className="hidden md:flex p-8 flex-col items-center select-none">
          <div className="w-10 h-10 mb-3" style={{ color: "#00d4c8" }}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
          </div>
          <span
            className="font-black tracking-widest uppercase text-base"
            style={{ color: "#00d4c8" }}
          >
            Spearhead
          </span>
          <span className="text-xs tracking-widest uppercase mt-0.5 text-slate-400">
            Medical
          </span>
        </div>

        {/* ── Divider ── */}
        <div
          className="hidden md:block mx-6 mb-2"
          style={{ height: "1px", background: "#e8f8f7" }}
        />

        {/* ── Navigation ── */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4">
          {navItems
            .filter((item) => !(isDoctor && item.doctorHidden))
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? "rounded-l-none"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                  style={
                    isActive
                      ? {
                          background: "#f0fafa",
                          color: "#00d4c8",
                          borderLeft: "3px solid #00d4c8",
                          borderRadius: "0 8px 8px 0",
                          paddingLeft: "13px",
                        }
                      : {}
                  }
                >
                  <item.icon
                    className="w-5 h-5 shrink-0"
                    style={{ color: isActive ? "#00d4c8" : undefined }}
                  />
                  {item.label}
                </Link>
              );
            })}
        </nav>

        {/* ── Footer ── */}
        <div className="p-4" style={{ borderTop: "1px solid #e8f8f7" }}>
          {/* User card */}
          <div
            className="flex items-center gap-3 p-3 rounded-xl mb-3"
            style={{
              background: "#f7fefe",
              border: "1px solid #e8f8f7",
            }}
          >
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{
                background: "linear-gradient(135deg, #00d4c8, #00a89e)",
                boxShadow: "0 2px 8px rgba(0,212,200,0.25)",
              }}
            >
              {userData.initials || <User className="w-5 h-5" />}
            </div>

            {/* Info */}
            <div className="flex flex-col overflow-hidden gap-0.5 min-w-0">
              <span className="text-sm font-bold leading-tight truncate text-slate-800">
                {userData.name || "—"}
              </span>
              <span className="text-[10px] truncate text-slate-400">
                {userData.email || "—"}
              </span>

              {/* Role badge */}
              {userData.role && (
                <div
                  className="inline-flex items-center gap-1.5 mt-1 w-fit px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border"
                  style={
                    isDoctor
                      ? {
                          background: "#eff6ff",
                          border: "1px solid #bfdbfe",
                          color: "#3b82f6",
                        }
                      : {
                          background: "#f0fafa",
                          border: "1px solid #99e9e6",
                          color: "#00a89e",
                        }
                  }
                >
                  {isDoctor ? (
                    <>
                      <Stethoscope className="w-3 h-3" /> Doctor
                    </>
                  ) : (
                    <>
                      <BriefcaseMedical className="w-3 h-3" /> Sales Rep
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <SignOutButton />
        </div>
      </aside>
    </>
  );
}
