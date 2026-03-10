"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, Eye, UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { signup } from "../action";

export default function SignUpForm() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 select-none">
      <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-xl shadow-slate-200/60 p-8 md:p-10 border border-slate-100">
        {/* ... Header remains the same ... */}

        <form className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="flex items-center gap-2 text-slate-700"
              >
                <User className="w-4 h-4 text-emerald-500" /> First Name
              </Label>
              <Input
                id="firstName"
                name="firstName" // Added name
                required
                placeholder="John"
                className="h-11 border-slate-200 focus:border-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="flex items-center gap-2 text-slate-700"
              >
                <User className="w-4 h-4 text-emerald-500" /> Last Name
              </Label>
              <Input
                id="lastName"
                name="lastName" // Added name
                required
                placeholder="Doe"
                className="h-11 border-slate-200 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="flex items-center gap-2 text-slate-700"
            >
              <Mail className="w-4 h-4 text-emerald-500" /> Email
            </Label>
            <Input
              id="email"
              name="email" // Added name
              type="email"
              required
              placeholder="john@example.com"
              className="h-11 border-slate-200 focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="flex items-center gap-2 text-slate-700"
            >
              <User className="w-4 h-4 text-emerald-500" /> Username
            </Label>
            <Input
              id="username"
              name="username" // Added name
              required
              placeholder="Choose a username"
              className="h-11 border-slate-200 focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="flex items-center gap-2 text-slate-700"
            >
              <Lock className="w-4 h-4 text-emerald-500" /> Password
            </Label>
            <Input
              id="password"
              name="password" // Added name
              type="password"
              required
              placeholder="Create a password"
              className="h-11 border-slate-200 focus:border-emerald-500"
            />
          </div>

          <div className="space-y-4 pt-4">
            {/* Added formAction here */}
            <Button
              formAction={signup}
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg gap-2 rounded-lg transition-transform active:scale-[0.98]"
            >
              <UserPlus className="w-5 h-5" /> Create Account
            </Button>

            {/* ... "or" separator and Back button ... */}
          </div>
        </form>
      </div>
    </div>
  );
}
