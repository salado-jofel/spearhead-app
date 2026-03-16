import { MailCheck } from "lucide-react";
import Link from "next/link";
import SubmitButton from "@/app/(components)/SubmitButton";

export default function VerifyEmailForm() {
  return (
    <div
      className="w-full max-w-md select-none rounded-2xl border p-8 text-center"
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(16px)",
        borderColor: "rgba(0,212,200,0.15)",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center mb-6">
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
      </div>

      {/* Mail icon */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{
          background: "rgba(0,212,200,0.1)",
          border: "1px solid rgba(0,212,200,0.25)",
        }}
      >
        <MailCheck className="w-9 h-9" style={{ color: "#00d4c8" }} />
      </div>

      {/* Text */}
      <h2 className="text-xl font-bold text-white mb-3">Check your email</h2>
      <p
        className="text-sm mb-8 leading-relaxed"
        style={{ color: "rgba(255,255,255,0.5)" }}
      >
        We've sent a verification link to your email address. Please click the
        link to activate your{" "}
        <span style={{ color: "#00d4c8" }}>Spearhead Medical</span> account.
      </p>

      {/* Actions */}
      <div className="space-y-4">
        <SubmitButton
          type="button"
          variant="outline"
          size="lg"
          cta={
            <Link
              href="/sign-in"
              className="flex gap-2 items-center justify-center w-full h-full"
            >
              Back to login
            </Link>
          }
          classname="h-12 w-full font-bold transition-all active:scale-95"
          style={{
            background: "rgba(0,212,200,0.08)",
            border: "1px solid rgba(0,212,200,0.35)",
            color: "#00d4c8",
          }}
        />

        <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
          Didn't receive an email? Check your spam folder or try signing up
          again.
        </p>
      </div>
    </div>
  );
}
