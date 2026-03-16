import { Suspense } from "react";
import SignInForm from "./(sections)/SignInForm";
import SignInFormSkeleton from "./(sections)/SignInFormSkeleton";

export default function Page() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0a1f2e 0%, #0d2d35 50%, #0a2420 100%)",
      }}
    >
      {/* Background star/dot particles matching the dashboard */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { top: "10%", left: "8%", size: 2 },
          { top: "20%", left: "85%", size: 1.5 },
          { top: "35%", left: "15%", size: 1 },
          { top: "15%", left: "60%", size: 2 },
          { top: "60%", left: "5%", size: 1.5 },
          { top: "75%", left: "90%", size: 2 },
          { top: "85%", left: "25%", size: 1 },
          { top: "50%", left: "78%", size: 1.5 },
          { top: "90%", left: "70%", size: 1 },
          { top: "5%", left: "45%", size: 1.5 },
          { top: "40%", left: "95%", size: 1 },
          { top: "68%", left: "50%", size: 2 },
        ].map((dot, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-30"
            style={{
              top: dot.top,
              left: dot.left,
              width: dot.size,
              height: dot.size,
            }}
          />
        ))}
      </div>

      <Suspense fallback={<SignInFormSkeleton />}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
