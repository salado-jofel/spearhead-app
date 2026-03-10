import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, Eye, UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SignUpForm() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 select-none">
      <div className="w-full max-w-120 bg-white rounded-2xl shadow-xl shadow-slate-200/60 p-8 md:p-10 border border-slate-100">
        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 text-emerald-500 mb-4">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
          </div>
          <div className="text-2xl font-black tracking-tight text-emerald-600 uppercase ">
            Spearhead Medical
          </div>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Create Your Account
          </p>
        </div>

        {/* Form Section */}
        <form className="space-y-5">
          {/* Grid for Names - Fixed to fill space correctly */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="flex items-center gap-2 text-slate-700 select-none cursor-pointer"
              >
                <User className="w-4 h-4 text-emerald-500" /> First Name
              </Label>
              <Input
                id="firstName"
                placeholder="John"
                className="h-11 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="flex items-center gap-2 text-slate-700 select-none cursor-pointer"
              >
                <User className="w-4 h-4 text-emerald-500" /> Last Name
              </Label>
              <Input
                id="lastName"
                placeholder="Doe"
                className="h-11 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="flex items-center gap-2 text-slate-700 select-none cursor-pointer"
            >
              <Mail className="w-4 h-4 text-emerald-500" /> Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              className="h-11 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10"
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="flex items-center gap-2 text-slate-700 select-none cursor-pointer"
            >
              <User className="w-4 h-4 text-emerald-500" /> Username
            </Label>
            <Input
              id="username"
              placeholder="Choose a username"
              className="h-11 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="flex items-center gap-2 text-slate-700 select-none cursor-pointer"
            >
              <Lock className="w-4 h-4 text-emerald-500" /> Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                className="h-11 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-600 focus:outline-none"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 pt-4">
            <Button className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg gap-2 rounded-lg transition-transform active:scale-[0.98]">
              <UserPlus className="w-5 h-5" /> Create Account
            </Button>

            <div className="relative flex items-center justify-center py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100" />
              </div>
              <span className="relative px-4 bg-white text-xs text-slate-400 uppercase tracking-widest select-none">
                or
              </span>
            </div>

            <Button
              variant="outline"
              asChild
              className="w-full h-12 border-emerald-500 text-emerald-500 hover:bg-emerald-50 font-bold gap-2 rounded-lg"
            >
              <Link href="/login">
                <ArrowLeft className="w-5 h-5" /> Back to Login
              </Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
