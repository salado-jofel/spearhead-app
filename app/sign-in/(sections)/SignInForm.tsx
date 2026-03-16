"use client";

import React, { useActionState, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { login } from "../actions";
import SubmitButton from "@/app/(components)/SubmitButton";
import ErrorAlert from "@/app/(components)/ErrorAlert";
import { useSearchParams } from "next/navigation";

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
    <div
      className="w-full max-w-md select-none rounded-2xl border p-8 md:p-10"
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(16px)",
        borderColor: "rgba(0,212,200,0.15)",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* QB Error */}
      {qbError && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p className="text-sm text-red-300">{decodeURIComponent(qbError)}</p>
        </div>
      )}

      {/* Logo & Header */}
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

      {/* Form */}
      <form action={formAction} className="space-y-5">
        <div className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              <Mail className="w-4 h-4" style={{ color: "#00d4c8" }} />
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
              value={formValues.email}
              onChange={handleChange}
              className="h-12 text-white placeholder:text-white/25 focus-visible:ring-0 focus-visible:ring-offset-0"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(0,212,200,0.2)",
                outline: "none",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "rgba(0,212,200,0.6)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "rgba(0,212,200,0.2)")
              }
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              <Lock className="w-4 h-4" style={{ color: "#00d4c8" }} />
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
                value={formValues.password}
                onChange={handleChange}
                className="h-12 pr-10 text-white placeholder:text-white/25 focus-visible:ring-0 focus-visible:ring-offset-0"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(0,212,200,0.2)",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(0,212,200,0.6)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(0,212,200,0.2)")
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "rgba(255,255,255,0.35)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#00d4c8")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.35)")
                }
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {state?.error && <ErrorAlert errorMessage={state.error} />}
        </div>

        {/* Remember me */}
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

        {/* Buttons */}
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

          {/* Divider */}
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

      {/* Footer */}
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
