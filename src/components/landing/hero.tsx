import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { DashboardMockup } from "./dashboard-mockup";

export function Hero() {
  return (
    <section className="relative pt-36 pb-24 overflow-hidden">
      {/* ambient gradient washes — purple/cyan/pink */}
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[600px] grid-bg pointer-events-none opacity-40" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass text-xs text-muted-foreground"
        >
          <Sparkles className="h-3 w-3 text-primary" />
          <span>Introducing EduFlow 2026 — AI-powered school operations</span>
        </motion.div>

        <h1 className="mt-7 font-display font-semibold tracking-[-0.04em] text-4xl sm:text-6xl lg:text-7xl leading-[1.05]">
          <span className="block overflow-hidden">
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ delay: 0.45, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block"
            >
              Manage your entire school
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ delay: 0.57, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block"
            >
              from{" "}
              <span
                className="text-gradient italic font-normal tracking-tight"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                one intelligent
              </span>{" "}
              platform
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.7 }}
          className="mt-6 mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed"
        >
          Track attendance, manage students, record marks, generate reports, and gain real-time
          insights — all from one powerful platform built for modern education.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1, delayChildren: 1.0 } },
          }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <motion.a
            variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            href="/auth"
            className="group inline-flex h-11 items-center gap-2 px-6 rounded-full bg-foreground text-background font-medium text-sm transition-shadow hover:shadow-elevated"
          >
            Start Free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </motion.a>
          <motion.a
            variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            href="#analytics"
            className="inline-flex h-11 items-center gap-2 px-6 rounded-full border border-border bg-background hover:bg-secondary font-medium text-sm transition-colors"
          >
            <Play className="h-3.5 w-3.5 fill-primary text-primary" />
            Book Demo
          </motion.a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="mt-5 flex items-center justify-center gap-4 text-xs text-muted-foreground"
        >
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            No credit card required
          </span>
          <span className="text-border">·</span>
          <span>14-day free trial</span>
        </motion.div>

        <div className="mt-16 sm:mt-20">
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}
