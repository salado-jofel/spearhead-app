// app/sign-up/(sections)/SignUpFormSkeleton.tsx

export default function SignUpFormSkeleton() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100">
        {/* "Create Account" title */}
        <div className="h-7 w-44 bg-slate-200 animate-pulse rounded-md mb-2" />

        {/* "Fill in your details to get started" subtitle */}
        <div className="h-4 w-56 bg-slate-200 animate-pulse rounded-md mb-6" />

        {/* "I am a" label */}
        <div className="h-4 w-16 bg-slate-200 animate-pulse rounded-md mb-3" />

        {/* Role selector — Sales Rep & Doctor cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Sales Representative card (selected state) */}
          <div className="h-24 bg-slate-200 animate-pulse rounded-xl" />
          {/* Doctor card */}
          <div className="h-24 bg-slate-200 animate-pulse rounded-xl" />
        </div>

        <div className="space-y-4">
          {/* First Name + Last Name side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="h-4 w-20 bg-slate-200 animate-pulse rounded-md" />
              <div className="h-10 w-full bg-slate-200 animate-pulse rounded-md" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-20 bg-slate-200 animate-pulse rounded-md" />
              <div className="h-10 w-full bg-slate-200 animate-pulse rounded-md" />
            </div>
          </div>

          {/* Email field */}
          <div className="space-y-2">
            <div className="h-4 w-12 bg-slate-200 animate-pulse rounded-md" />
            <div className="h-10 w-full bg-slate-200 animate-pulse rounded-md" />
          </div>

          {/* Phone field */}
          <div className="space-y-2">
            <div className="h-4 w-12 bg-slate-200 animate-pulse rounded-md" />
            <div className="h-10 w-full bg-slate-200 animate-pulse rounded-md" />
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <div className="h-4 w-20 bg-slate-200 animate-pulse rounded-md" />
            <div className="h-10 w-full bg-slate-200 animate-pulse rounded-md" />
          </div>

          {/* Create Account button */}
          <div className="h-12 w-full bg-slate-200 animate-pulse rounded-md mt-2" />
        </div>

        {/* "Already have an account? Sign in" */}
        <div className="mt-6 flex justify-center items-center gap-2">
          <div className="h-4 w-40 bg-slate-200 animate-pulse rounded-md" />
          <div className="h-4 w-12 bg-slate-200 animate-pulse rounded-md" />
        </div>
      </div>
    </div>
  );
}
