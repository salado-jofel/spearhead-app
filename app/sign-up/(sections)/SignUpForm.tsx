"use client";

import { useActionState, useState } from "react";
import { signup } from "../actions";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Stethoscope,
  BriefcaseMedical,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

type Role = "sales_representative" | "doctor";

const initialState = { error: "" };

export default function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signup, initialState);
  const [role, setRole] = useState<Role>("sales_representative");

  return (
    <div
      className="w-full max-w-md select-none rounded-2xl border p-8 space-y-6"
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(16px)",
        borderColor: "rgba(0,212,200,0.15)",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div className="flex flex-col items-center text-center">
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
        <h1 className="text-2xl font-black tracking-tight uppercase text-white">
          Spearhead <span style={{ color: "#00d4c8" }}>Medical</span>
        </h1>
        <p
          className="text-sm font-medium mt-1"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          Create your account to get started
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {/* Hidden role field */}
        <input type="hidden" name="role" value={role} />

        {/* Role selector */}
        <div className="space-y-2">
          <label
            className="text-sm font-medium"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            I am a
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("sales_representative")}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer"
              style={{
                borderColor:
                  role === "sales_representative"
                    ? "#00d4c8"
                    : "rgba(255,255,255,0.1)",
                background:
                  role === "sales_representative"
                    ? "rgba(0,212,200,0.1)"
                    : "rgba(255,255,255,0.03)",
                color:
                  role === "sales_representative"
                    ? "#00d4c8"
                    : "rgba(255,255,255,0.35)",
              }}
            >
              <BriefcaseMedical className="w-6 h-6" />
              <span className="text-xs font-semibold">
                Sales Representative
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole("doctor")}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer"
              style={{
                borderColor:
                  role === "doctor" ? "#00d4c8" : "rgba(255,255,255,0.1)",
                background:
                  role === "doctor"
                    ? "rgba(0,212,200,0.1)"
                    : "rgba(255,255,255,0.03)",
                color: role === "doctor" ? "#00d4c8" : "rgba(255,255,255,0.35)",
              }}
            >
              <Stethoscope className="w-6 h-6" />
              <span className="text-xs font-semibold">Doctor</span>
            </button>
          </div>
        </div>

        {/* First + Last Name */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "First Name", name: "first_name", placeholder: "John" },
            { label: "Last Name", name: "last_name", placeholder: "Doe" },
          ].map((field) => (
            <div key={field.name}>
              <label
                className="text-sm font-medium"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                {field.label}
              </label>
              <Input
                name={field.name}
                placeholder={field.placeholder}
                required
                className="mt-1 h-11 text-white placeholder:text-white/25 focus-visible:ring-0 focus-visible:ring-offset-0"
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
            </div>
          ))}
        </div>

        {/* Email */}
        <div>
          <label
            className="text-sm font-medium"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            Email
          </label>
          <Input
            name="email"
            type="email"
            placeholder="john@example.com"
            required
            className="mt-1 h-11 text-white placeholder:text-white/25 focus-visible:ring-0 focus-visible:ring-offset-0"
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
        </div>

        {/* Phone */}
        <div>
          <label
            className="text-sm font-medium"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            Phone
          </label>
          <Input
            name="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            className="mt-1 h-11 text-white placeholder:text-white/25 focus-visible:ring-0 focus-visible:ring-offset-0"
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
        </div>

        {/* Password */}
        <div>
          <label
            className="text-sm font-medium"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            Password
          </label>
          <Input
            name="password"
            type="password"
            placeholder="••••••••"
            required
            className="mt-1 h-11 text-white placeholder:text-white/25 focus-visible:ring-0 focus-visible:ring-offset-0"
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
        </div>

        {/* Error */}
        {state?.error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <p className="text-sm text-red-300">{state.error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full h-12 rounded-md font-bold text-white transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          style={{
            background: "linear-gradient(135deg, #00d4c8, #00a89e)",
            boxShadow: "0 4px 15px rgba(0,212,200,0.3)",
          }}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      {/* Footer */}
      <p
        className="text-sm text-center"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium transition-colors"
          style={{ color: "#00d4c8" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#5ee8e2")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#00d4c8")}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
