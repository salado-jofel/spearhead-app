"use client";

import React, { useActionState, useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, UserPlus, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { login } from "../actions";
import SubmitButton from "@/app/(components)/SubmitButton";
import ErrorAlert from "@/app/(components)/ErrorAlert";
import { useSearchParams } from "next/navigation";
import { AuthField } from "@/app/(components)/AuthField";
import { PasswordToggle } from "@/app/(components)/PasswordToggle";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(login, null);
  const [formValues, setFormValues] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (state?.error) {
      setFormValues((prev) => ({ ...prev, password: "" }));
    }
  }, [state]);

  const searchParams = useSearchParams();
  const qbError = searchParams.get("error");

  return (
    <div className="w-full max-w-md select-none rounded-2xl border p-8 md:p-10 bg-white/5 backdrop-blur-2xl border-[#00d4c8]/15 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]">
      {qbError && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p className="text-sm text-red-300">{decodeURIComponent(qbError)}</p>
        </div>
      )}

      <div className="flex flex-col items-center text-center mb-8">
        <div
          className="w-14 h-14 mb-4 flex items-center justify-center rounded-full"
          style={{
            background: "rgba(0,212,200,0.1)",
            border: "1px solid rgba(0,212,200,0.25)",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-7 h-7"
            style={{ color: "#00d4c8" }}
          >
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
          </svg>
        </div>
        <h1
          className="text-2xl font-black tracking-tight uppercase"
          style={{ color: "#ffffff" }}
        >
          Spearhead <span style={{ color: "#00d4c8" }}>Medical</span>
        </h1>
        <p
          className="text-sm mt-1 font-medium"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          Sales Representative Portal
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        <div className="space-y-4">
          <AuthField
            id="email"
            name="email"
            label="Email"
            icon={<Mail className="w-4 h-4" style={{ color: "#00d4c8" }} />}
            type="email"
            placeholder="Enter your email"
            value={formValues.email}
            onChange={handleChange}
          />

          <AuthField
            id="password"
            name="password"
            label="Password"
            icon={<Lock className="w-4 h-4" style={{ color: "#00d4c8" }} />}
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formValues.password}
            onChange={handleChange}
            rightElement={
              <PasswordToggle
                show={showPassword}
                onToggle={() => setShowPassword((prev) => !prev)}
              />
            }
          />

          {state?.error && <ErrorAlert errorMessage={state.error} />}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            name="remember"
            className="border-white/20 data-[state=checked]:bg-teal-400 data-[state=checked]:border-teal-400"
          />
          <label
            htmlFor="remember"
            className="text-sm font-medium cursor-pointer"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Remember me
          </label>
        </div>

        <div className="space-y-3 pt-1">
          <SubmitButton
            classname="h-12 w-full font-bold transition-all active:scale-95 text-white"
            style={{
              background: "linear-gradient(135deg, #00d4c8, #00a89e)",
              boxShadow: "0 4px 15px rgba(0,212,200,0.3)",
            }}
            isPending={isPending}
            type={"submit"}
            cta={"Sign In"}
            variant={"default"}
            size={"lg"}
            isPendingMesssage={"Signing in..."}
          />

          <div className="relative flex items-center justify-center py-1">
            <div className="absolute inset-0 flex items-center">
              <span
                className="w-full border-t"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              />
            </div>
            <span
              className="relative px-4 text-xs uppercase tracking-widest"
              style={{
                color: "rgba(255,255,255,0.3)",
                background: "transparent",
              }}
            >
              or
            </span>
          </div>

          <SubmitButton
            classname="h-12 w-full cursor-pointer font-bold transition-all active:scale-95"
            style={{
              background: "rgba(0,212,200,0.08)",
              border: "1px solid rgba(0,212,200,0.35)",
              color: "#00d4c8",
            }}
            type={"button"}
            cta={
              <Link
                href="/sign-up"
                className="flex gap-2 items-center justify-center w-full h-full"
              >
                <UserPlus className="w-5 h-5" /> Create New Account
              </Link>
            }
            variant={"outline"}
            size={"lg"}
          />
        </div>
      </form>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: "rgba(255,255,255,0.35)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#00d4c8")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "rgba(255,255,255,0.35)")
          }
        >
          <ArrowLeft className="w-4 h-4" /> Back to Main Site
        </Link>
      </div>
    </div>
  );
}
