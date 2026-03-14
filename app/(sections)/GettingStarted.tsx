"use client";

import { VIEWPORT, badgePop, fadeUp } from "@/components/ui/animations";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
    ),
    title: "Call or Text Scottie",
    description:
      "Reach out to Scottie Jennings at (404) 213-2994. Most reps get a same-day response.",
  },
  {
    number: "02",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 10l4.553-2.069A1 1 0 0121 8.868V15.13a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    ),
    title: "Product Demo & Onboarding",
    description:
      "Join a 60-minute live demo and meet your rep success manager.",
  },
  {
    number: "03",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
    title: "Get Your Starter Kit",
    description:
      "Receive your full sample kit, clinical materials, and digital assets — ready to walk into any office.",
  },
  {
    number: "04",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
        />
      </svg>
    ),
    title: "Start Closing",
    description:
      "Hit the field with full support. First commission check typically arrives within 30 days.",
  },
];

export function GettingStarted() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Badge */}
        <motion.div
          className="flex justify-center mb-6"
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          variants={badgePop}
        >
          <span className="bg-teal-50 text-teal-600 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full border border-teal-200">
            Getting Started
          </span>
        </motion.div>

        {/* Heading */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          variants={fadeUp}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            From First Call to <span className="text-teal-500">First Sale</span>{" "}
            in 5 Days
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative flex flex-col md:flex-row items-start justify-center">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="flex md:flex-col items-start md:items-center gap-4 md:gap-0 flex-1"
            >
              <motion.div
                className="flex flex-col md:items-center md:text-center flex-1"
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.55,
                      delay: index * 0.15,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  },
                }}
              >
                <p className="text-teal-400/50 text-xs font-bold tracking-widest mb-2">
                  {step.number}
                </p>
                <motion.div
                  className="w-14 h-14 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-200 mb-4 flex-shrink-0"
                  whileHover={{ scale: 1.12, rotate: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  {step.icon}
                </motion.div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-[200px]">
                  {step.description}
                </p>
              </motion.div>

              {/* Arrow */}
              {index < steps.length - 1 && (
                <motion.div
                  className="hidden md:flex items-center justify-center w-8 mt-9 flex-shrink-0 text-teal-300"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.3, duration: 0.4 }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
