// app/sign-in/(sections)/SignInFormSkeleton.tsx

export default function SignInFormSkeleton() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-110 bg-white rounded-2xl shadow-xl shadow-slate-200/60 p-8 md:p-12 border border-slate-100">
        {/* Logo icon */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-12 h-12 rounded-full bg-slate-200 animate-pulse mb-4" />

          {/* "SPEARHEAD MEDICAL" title */}
          <div className="h-6 w-52 bg-slate-200 animate-pulse rounded-md mb-2" />

          {/* "Sales Representative Portal" subtitle */}
          <div className="h-4 w-44 bg-slate-200 animate-pulse rounded-md" />
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            {/* Email field */}
            <div className="space-y-2">
              <div className="h-4 w-20 bg-slate-200 animate-pulse rounded-md" />
              <div className="h-12 w-full bg-slate-200 animate-pulse rounded-md" />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <div className="h-4 w-24 bg-slate-200 animate-pulse rounded-md" />
              <div className="h-12 w-full bg-slate-200 animate-pulse rounded-md" />
            </div>
          </div>

          {/* Remember me checkbox */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-slate-200 animate-pulse rounded-sm" />
            <div className="h-4 w-24 bg-slate-200 animate-pulse rounded-md" />
          </div>

          <div className="space-y-4 pt-2">
            {/* Sign In button */}
            <div className="h-12 w-full bg-slate-200 animate-pulse rounded-md" />

            {/* OR divider */}
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-slate-200" />
              <div className="h-3 w-6 bg-slate-200 animate-pulse rounded" />
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Create New Account button */}
            <div className="h-12 w-full bg-slate-200 animate-pulse rounded-md" />
          </div>
        </div>

        {/* Back to Main Site */}
        <div className="mt-10 flex justify-center">
          <div className="h-4 w-32 bg-slate-200 animate-pulse rounded-md" />
        </div>
      </div>
    </div>
  );
}
