"use client";

import { VIEWPORT, badgePop, fadeUp, staggerContainer } from "@/components/ui/animations";
import { motion } from "framer-motion";


const testimonials = [
  {
    quote:
      "I've been in medical sales for 12 years. The Non-Hydrolyzed Collagen product basically sells itself once physicians see the data. I closed 6 new accounts in my first 45 days.",
    name: "Jason M.",
    role: "Independent Rep — Southeast",
    initials: "JM",
    highlight: false,
  },
  {
    quote:
      "Spearhead gave me a protected market with a clear lane. The commission structure is unlike anything I've seen — and the reorder rate is extraordinary. I'm building real residual income.",
    name: "Sarah R.",
    role: "Senior Rep — Midwest",
    initials: "SR",
    highlight: true,
  },
  {
    quote:
      "The clinical differentiation story is powerful. Physicians understand the science immediately. I'm having better conversations than I ever had with commodity products.",
    name: "David L.",
    role: "Medical Rep — Pacific Northwest",
    initials: "DL",
    highlight: false,
  },
];

function StarRating() {
  return (
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <motion.svg
          key={i}
          className="w-4 h-4 text-yellow-400 fill-yellow-400"
          viewBox="0 0 24 24"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.07, type: "spring", stiffness: 300 }}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </motion.svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
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
            Rep Stories
          </span>
        </motion.div>

        {/* Heading */}
        <motion.div
          className="text-center mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          variants={fadeUp}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Reps Are{" "}
            <span className="text-teal-500 italic">Already Winning</span>
          </h2>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          variants={staggerContainer}
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 50,
                  rotate: i === 0 ? -2 : i === 2 ? 2 : 0,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  rotate: 0,
                  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className={`p-7 rounded-2xl flex flex-col justify-between cursor-default ${
                t.highlight
                  ? "bg-[#0a3040] text-white shadow-xl"
                  : "bg-white border border-gray-100 shadow-sm"
              }`}
            >
              <div>
                <StarRating />
                <p
                  className={`text-sm leading-relaxed italic mb-6 ${
                    t.highlight ? "text-white/85" : "text-gray-600"
                  }`}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                    t.highlight
                      ? "bg-teal-500 text-white"
                      : "bg-teal-100 text-teal-700"
                  }`}
                >
                  {t.initials}
                </div>
                <div>
                  <p
                    className={`font-semibold text-sm ${t.highlight ? "text-white" : "text-gray-900"}`}
                  >
                    {t.name}
                  </p>
                  <p
                    className={`text-xs ${t.highlight ? "text-white/50" : "text-gray-400"}`}
                  >
                    {t.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
