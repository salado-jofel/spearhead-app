import { Suspense } from "react";
import SignInForm from "./(sections)/SignInForm";

export default function Page() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
