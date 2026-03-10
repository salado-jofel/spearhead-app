import { MailCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SubmitButton from "@/app/(components)/SubmitButton";

export default function VerifyEmailForm() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 select-none">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <MailCheck className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Check your email
        </h1>
        <p className="text-slate-600 mb-8">
          We've sent a verification link to your email address. Please click the
          link to activate your Spearhead Medical account.
        </p>

        <div className="space-y-4">
          <SubmitButton
            classname="h-12 w-full cursor-pointer bg-white border-emerald-500 text-emerald-500 hover:bg-emerald-50 transition-all active:scale-95 font-bold"
            type={"button"}
            cta={
              <Link
                href="/sign-in"
                className="flex gap-2 items-center justify-center"
              >
                Back to login
              </Link>
            }
            variant={"outline"}
            size={"lg"}
          />
          <p className="text-xs text-slate-400">
            Didn't receive an email? Check your spam folder or try signing up
            again.
          </p>
        </div>
      </div>
    </div>
  );
}
