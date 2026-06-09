import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Reveal } from "./reveal";

export function CTA() {
  return (
    <section id="cta" className="relative py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Reveal variant="scale">
          <div
            className="relative overflow-hidden rounded-3xl p-12 sm:p-20 text-center shadow-elevated"
            style={{
              background:
                "radial-gradient(ellipse 60% 80% at 15% 20%, oklch(0.32 0.18 295 / 0.9), transparent 60%), radial-gradient(ellipse 60% 70% at 90% 85%, oklch(0.32 0.16 320 / 0.85), transparent 60%), linear-gradient(135deg, oklch(0.12 0.04 270) 0%, oklch(0.1 0.03 265) 100%)",
            }}
          >
            {/* subtle moving glow */}
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-1/2 opacity-30 blur-3xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, oklch(0.5 0.28 295), transparent 50%), radial-gradient(circle at 70% 70%, oklch(0.55 0.24 320), transparent 50%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.08] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
                backgroundSize: "48px 48px",
                maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 80%)",
              }}
            />

            <div className="relative">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-white/80 backdrop-blur"
              >
                <Sparkles className="h-3 w-3 text-white" />
                Limited spots for 2026 cohort
              </motion.div>

              <h2 className="mt-6 font-display text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.05] text-white">
                Transform the way
                <br />
                your school{" "}
                <span
                  className="italic font-normal"
                  style={{
                    fontFamily: "var(--font-serif)",
                    background:
                      "linear-gradient(100deg, oklch(0.9 0.05 295), oklch(0.82 0.14 200))",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  operates
                </span>
              </h2>
              <p className="mt-5 text-white/60 max-w-xl mx-auto text-sm sm:text-base">
                Join modern schools using EduFlow to simplify administration and improve academic
                performance.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <motion.a
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  href="/auth"
                  className="group inline-flex h-11 items-center gap-2 px-6 rounded-full bg-white text-zinc-900 font-medium text-sm shadow-lg hover:shadow-xl transition-shadow"
                >
                  Get Started Today
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </motion.a>
                <a
                  href="#"
                  className="inline-flex h-11 items-center px-6 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-colors backdrop-blur"
                >
                  Talk to sales
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
