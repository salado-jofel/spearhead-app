import { exchangeCodeForTokens } from "../actions";
import { AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    code?: string;
    realmId?: string;
    error?: string;
    state?: string;
  }>;
}

export default async function QuickBooksCallbackPage({ searchParams }: Props) {
  const params = await searchParams;

  // ─── Handle QB OAuth error ────────────────────────────────────────
  if (params.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-red-100">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Connection Failed
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            QuickBooks authorization was denied or failed. Please try again.
          </p>
          <a
            href="/dashboard/quickbooks"
            className="inline-flex items-center justify-center w-full h-11 bg-[#2db0b0] hover:bg-[#249191] text-white font-medium rounded-lg transition-colors"
          >
            Try Again
          </a>
        </div>
      </div>
    );
  }

  // ─── Handle missing params ────────────────────────────────────────
  if (!params.code || !params.realmId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-yellow-100">
          <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Invalid Callback
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Missing required parameters from QuickBooks. Please try connecting
            again.
          </p>
          <a
            href="/dashboard/quickbooks"
            className="inline-flex items-center justify-center w-full h-11 bg-[#2db0b0] hover:bg-[#249191] text-white font-medium rounded-lg transition-colors"
          >
            Go Back
          </a>
        </div>
      </div>
    );
  }

  // ─── Exchange code for tokens ─────────────────────────────────────
  try {
    await exchangeCodeForTokens(params.code, params.realmId);
  } catch (err) {
    // NEXT_REDIRECT is not a real error — let it propagate
    if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
      throw err;
    }

    console.error("[Callback] Error:", err);
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-red-100">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Token Exchange Failed
          </h2>
          <p className="text-red-400 text-xs font-mono bg-red-50 p-3 rounded-lg mb-6 text-left break-all">
            {err instanceof Error ? err.message : "Unknown error"}
          </p>
          <a
            href="/dashboard/quickbooks"
            className="inline-flex items-center justify-center w-full h-11 bg-[#2db0b0] hover:bg-[#249191] text-white font-medium rounded-lg transition-colors"
          >
            Try Again
          </a>
        </div>
      </div>
    );
  }


  // ─── Success — redirect handled inside exchangeCodeForTokens ─────
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-6 h-6 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Connecting...</h2>
        <p className="text-slate-500 text-sm">
          Completing your QuickBooks connection. Please wait.
        </p>
      </div>
    </div>
  );
}
