"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login } from "../action";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 select-none">
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-xl shadow-slate-200/60 p-8 md:p-12 border border-slate-100">
        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-12 h-12 text-emerald-500 mb-4">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-emerald-600 uppercase">
            Spearhead Medical
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Sales Representative Portal
          </p>
        </div>

        {/* Dynamic Error Message */}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Form Section */}
        <form className="space-y-6">
          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="flex items-center gap-2 text-slate-700"
              >
                <Mail className="w-4 h-4 text-emerald-500" /> Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="flex items-center gap-2 text-slate-700"
              >
                <Lock className="w-4 h-4 text-emerald-500" /> Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 pr-10"
                />
                <button
                  type="button" // Critical: prevents form submission
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                className="border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium text-slate-600 cursor-pointer"
              >
                Remember me
              </label>
            </div>
            <Link
              href="#"
              className="text-sm font-medium text-emerald-500 hover:text-emerald-600"
            >
              Forgot password?
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 pt-2">
            <Button
              formAction={login}
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg gap-2 rounded-lg transition-all active:scale-[0.98]"
            >
              <LogIn className="w-5 h-5" /> Sign In
            </Button>

            <div className="relative flex items-center justify-center py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100" />
              </div>
              <span className="relative px-4 bg-white text-xs text-slate-400 uppercase tracking-widest">
                or
              </span>
            </div>

            <Button
              asChild
              variant="outline"
              className="w-full h-12 border-emerald-500 text-emerald-500 hover:bg-emerald-50 font-bold gap-2 rounded-lg"
            >
              <Link href="/sign-up">
                <UserPlus className="w-5 h-5" /> Create New Account
              </Link>
            </Button>
          </div>
        </form>

        {/* Footer Link */}
        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Main Site
          </Link>
        </div>
      </div>
    </div>
  );
}
