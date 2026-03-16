import React from "react";
import VerifyEmailForm from "./(sections)/VerifyEmailForm";

export default function Page() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0a1f2e 0%, #0d2d35 50%, #0a2420 100%)",
      }}
    >
      {/* Background star particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { top: "8%", left: "10%", size: 2 },
          { top: "18%", left: "82%", size: 1.5 },
          { top: "32%", left: "18%", size: 1 },
          { top: "12%", left: "58%", size: 2 },
          { top: "55%", left: "6%", size: 1.5 },
          { top: "72%", left: "88%", size: 2 },
          { top: "88%", left: "28%", size: 1 },
          { top: "48%", left: "76%", size: 1.5 },
          { top: "92%", left: "68%", size: 1 },
          { top: "4%", left: "43%", size: 1.5 },
          { top: "38%", left: "93%", size: 1 },
          { top: "65%", left: "52%", size: 2 },
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

      <VerifyEmailForm />
    </div>
  );
}
