import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./reveal";

export function CTA() {
  return (
    <section id="cta" className="relative py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Reveal variant="scale">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-12 sm:p-20 text-center shadow-elevated">
            {/* animated bg */}
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-1/2 bg-gradient-hero opacity-20 blur-3xl pointer-events-none"
              style={{
                maskImage: "radial-gradient(circle at center, black 30%, transparent 70%)",
              }}
            />
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

            <div className="relative">
              <h2 className="font-display text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.05]">
                Transform the way your school <span className="text-gradient">operates.</span>
              </h2>
              <p className="mt-5 text-muted-foreground max-w-xl mx-auto">
                Join modern schools using EduFlow to simplify administration and lift academic
                performance. Free for up to 50 students — forever.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <motion.a
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  href="#"
                  className="group inline-flex h-12 items-center gap-2 px-6 rounded-xl bg-gradient-hero text-white font-medium shadow-glow-primary"
                >
                  Get started today
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </motion.a>
                <a
                  href="#"
                  className="inline-flex h-12 items-center px-6 rounded-xl border border-border bg-background hover:bg-secondary font-medium transition-colors"
                >
                  Book a 15-min demo
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
