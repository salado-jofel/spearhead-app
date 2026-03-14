"use client";

import { VIEWPORT, badgePop, fadeLeft, staggerContainer, fadeUp, fadeRight } from "@/components/ui/animations";
import { motion } from "framer-motion";


const demoSessions = [
  { day: "Tuesday", time: "11:00 AM EST", status: "open" },
  { day: "Thursday", time: "2:00 PM EST", status: "open" },
  { day: "Friday", time: "10:00 AM EST", status: "limited" },
];

const demoTopics = [
  "The science behind Non-Hydrolyzed Collagen",
  "Clinical data and real-world case studies",
  "The sales process and objection handling",
  "Commission structure and market area terms",
  "Q&A with the Spearhead Medical team",
];

export function LiveDemo() {
  return (
    <section
      id="demo"
      className="py-24 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at bottom left, #0d5a6a 0%, #0a3040 45%, #061d28 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Badge */}
        <motion.div
          className="flex justify-center mb-10"
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          variants={badgePop}
        >
          <span className="bg-white/10 text-teal-400 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full border border-white/20">
            See It Live
          </span>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Left: Content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            variants={fadeLeft}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-5">
              Watch the Product <span className="text-teal-400">In Action</span>
            </h2>
            <p className="text-white/60 mb-8 text-lg leading-relaxed">
              Join one of our live weekly demo sessions and see exactly why
              physicians and clinics are switching to Non-Hydrolyzed Collagen.
            </p>

            <motion.ul
              className="space-y-3 mb-10"
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
              variants={staggerContainer}
            >
              {demoTopics.map((topic) => (
                <motion.li
                  key={topic}
                  variants={fadeUp}
                  className="flex items-center gap-3 text-white/75 text-sm"
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-500/30 border border-teal-400/50 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-teal-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  {topic}
                </motion.li>
              ))}
            </motion.ul>

            <motion.a
              href="tel:4042132994"
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-semibold px-7 py-3.5 rounded-full transition-colors text-sm shadow-lg shadow-teal-900/40"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <svg
                className="w-4 h-4"
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
              Talk to Scottie — (404) 213-2994
            </motion.a>
          </motion.div>

          {/* Right: Schedule Card */}
          <motion.div
            className="bg-white/8 backdrop-blur-sm border border-white/15 rounded-2xl p-6"
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            variants={fadeRight}
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <p className="text-white/80 text-sm font-semibold">
                Live Demo Sessions — Weekly
              </p>
            </div>

            <motion.div
              className="space-y-3"
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.12 } },
              }}
            >
              {demoSessions.map((session) => (
                <motion.div
                  key={session.day}
                  variants={fadeUp}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 cursor-default"
                >
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {session.day}
                    </p>
                    <p className="text-white/50 text-xs mt-0.5">
                      {session.time}
                    </p>
                  </div>
                  {session.status === "open" ? (
                    <span className="bg-teal-500 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      Spots Open
                    </span>
                  ) : (
                    <span className="bg-orange-500 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      2 Spots Left
                    </span>
                  )}
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-6 flex items-center justify-center gap-2 text-white/40 text-xs">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Secure Zoom · 60 min · No obligation
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
