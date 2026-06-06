import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { DashboardMockup } from "./dashboard-mockup";

const headlineLines = ["Manage your entire school", "from one intelligent platform."];

export function Hero() {
  return (
    <section className="relative pt-36 pb-24 overflow-hidden">
      {/* ambient glow */}
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[600px] grid-bg pointer-events-none opacity-60" />
      <div className="absolute left-1/2 -translate-x-1/2 top-20 h-[420px] w-[820px] rounded-full bg-gradient-hero opacity-20 blur-[120px] pointer-events-none animate-pulse-glow" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 text-center">
        <motion.a
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          href="#features"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Sparkles className="h-3 w-3 text-accent" />
          <span>EduFlow 2.0 — analytics rebuilt from the ground up</span>
          <ArrowRight className="h-3 w-3" />
        </motion.a>

        <h1 className="mt-7 font-display font-semibold tracking-[-0.04em] text-4xl sm:text-6xl lg:text-7xl leading-[1.02]">
          {headlineLines.map((line, i) => (
            <span key={i} className="block overflow-hidden">
              <motion.span
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ delay: 0.45 + i * 0.12, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block"
              >
                {i === 1 ? <span className="text-gradient">{line}</span> : line}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.7 }}
          className="mt-6 mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed"
        >
          Track attendance, manage students, record marks, generate reports, and gain real-time
          insights — all from one beautifully crafted platform built for modern schools.
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
            href="/app"
            className="group inline-flex h-11 items-center gap-2 px-5 rounded-xl bg-gradient-hero text-white font-medium text-sm shadow-glow-primary transition-shadow hover:shadow-elevated"
          >
            Open dashboard
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </motion.a>
          <motion.a
            variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            href="#analytics"
            className="inline-flex h-11 items-center gap-2 px-5 rounded-xl border border-border bg-background hover:bg-secondary font-medium text-sm transition-colors"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Book demo
          </motion.a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="mt-5 text-xs text-muted-foreground"
        >
          Free for up to 50 students · No credit card required
        </motion.div>

        <div className="mt-16 sm:mt-20">
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}
