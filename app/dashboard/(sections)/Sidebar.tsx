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
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { SignOutButton } from "../(components)/SignOutButton";
import { useSidebar } from "../(components)/SidebarContext";
import { useAppSelector } from "@/store/hooks";
import { NavItem } from "@/app/(components)/NavItem";
import { SidebarUserCard } from "@/app/(components)/SidebarUserCard";
import { SpearheadBrand } from "@/app/(components)/SpearheadBrand";

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

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const userData = useAppSelector((state) => state.dashboard);
  const isDoctor = userData.role === "doctor";

  useEffect(() => {
    close();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div
        className={`
          fixed inset-0 bg-black/40 z-40 md:hidden top-16
          transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={close}
        aria-hidden="true"
      />

      <aside
        className={`
          w-64 bg-white border-r border-slate-100 flex flex-col
          fixed z-50 select-none
          top-16 h-[calc(100%-4rem)]
          md:top-0 md:h-full
          transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="hidden md:flex p-8 flex-col items-center select-none">
          <SpearheadBrand
            layout="col"
            iconSize="w-10 h-10"
            textSize="text-base"
          />
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4">
          {navItems
            .filter((item) => !(isDoctor && item.doctorHidden))
            .map((item) => (
              <NavItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={pathname === item.href}
              />
            ))}
        </nav>

        <div className="p-4 border-t border-slate-50 bg-white">
          <SidebarUserCard
            name={userData.name}
            email={userData.email}
            initials={userData.initials}
            role={userData.role}
          />
          <SignOutButton />
        </div>
      </aside>
    </>
  );
}
