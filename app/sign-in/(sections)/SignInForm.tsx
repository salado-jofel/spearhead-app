import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Lock, Eye, LogIn, UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SignInForm() {
  return (
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

      {/* Form Section */}
      <form className="space-y-6">
        <div className="space-y-4">
          {/* Username */}
          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="flex items-center gap-2 text-slate-700"
            >
              <User className="w-4 h-4 text-emerald-500" /> Username
            </Label>
            <Input
              id="username"
              placeholder="Enter your username"
              className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10"
            />
          </div>

          {/* Password */}
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
                type="password"
                placeholder="Enter your password"
                className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-600"
              >
                <Eye className="w-4 h-4" />
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
          <Button className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg gap-2 rounded-lg">
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
            <Link href={"/sign-up"}>
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
  );
}
