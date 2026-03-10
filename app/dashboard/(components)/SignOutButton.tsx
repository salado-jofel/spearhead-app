"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "../actions";

export function SignOutButton() {
  return (
    <Button
      size={"lg"}
      variant="ghost"
      onClick={() => signOut()}
      className="flex items-center gap-2 text-white bg-red-500 transition-colors w-full cursor-pointer hover:text-red-500 hover:border-red-500"
    >
      <LogOut className="w-4 h-4" />
      <span>Logout</span>
    </Button>
  );
}
