"use client";

import { useActionState, useState } from "react";
import { signup } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Stethoscope, BriefcaseMedical } from "lucide-react";

type Role = "sales_representative" | "doctor";

const initialState = { error: "" };

export default function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signup, initialState);
  const [role, setRole] = useState<Role>("sales_representative");

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 w-full max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Create Account</h1>
          <p className="text-sm text-slate-500 mt-1">
            Fill in your details to get started
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          {/* Hidden role field — submitted with form */}
          <input type="hidden" name="role" value={role} />

          {/* Role selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("sales_representative")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  role === "sales_representative"
                    ? "border-[#2db0b0] bg-teal-50 text-[#2db0b0]"
                    : "border-slate-200 text-slate-400 hover:border-slate-300"
                }`}
              >
                <BriefcaseMedical className="w-6 h-6" />
                <span className="text-xs font-semibold">
                  Sales Representative
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole("doctor")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  role === "doctor"
                    ? "border-[#2db0b0] bg-teal-50 text-[#2db0b0]"
                    : "border-slate-200 text-slate-400 hover:border-slate-300"
                }`}
              >
                <Stethoscope className="w-6 h-6" />
                <span className="text-xs font-semibold">Doctor</span>
              </button>
            </div>
          </div>

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700">
                First Name
              </label>
              <Input
                name="first_name"
                placeholder="John"
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Last Name
              </label>
              <Input
                name="last_name"
                placeholder="Doe"
                required
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <Input
              name="email"
              type="email"
              placeholder="john@example.com"
              required
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Phone</label>
            <Input
              name="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Password
            </label>
            <Input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="mt-1"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
              {state.error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#2db0b0] hover:bg-[#249191] text-white cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating
                account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <p className="text-sm text-center text-slate-500">
          Already have an account?{" "}
          <a
            href="/sign-in"
            className="text-[#2db0b0] font-medium hover:underline"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
