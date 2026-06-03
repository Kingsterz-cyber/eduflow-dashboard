import { motion } from "framer-motion";
import { Building2, ClipboardList, GraduationCap, UserCheck, Users } from "lucide-react";
import { Reveal } from "./reveal";

const steps = [
  { icon: Building2, title: "Create your school", desc: "Set up your school in under a minute." },
  { icon: GraduationCap, title: "Invite teachers", desc: "Securely invite staff with the right permissions." },
  { icon: Users, title: "Enroll students", desc: "Import a CSV or add students one by one." },
  { icon: UserCheck, title: "Track attendance", desc: "One-tap daily attendance from any device." },
  { icon: ClipboardList, title: "Generate reports", desc: "Beautiful term reports — ready to share." },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-28 bg-surface/40 border-y border-border">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Reveal variant="blur" className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-[0.18em] text-accent font-medium">How it works</div>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl font-semibold tracking-tight">
            From zero to running in <span className="text-gradient">five steps.</span>
          </h2>
        </Reveal>

        <div className="relative mt-16">
          <div className="absolute left-6 sm:left-1/2 sm:-translate-x-1/2 top-0 bottom-0 w-px bg-border" />
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ originY: 0 }}
            className="absolute left-6 sm:left-1/2 sm:-translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-indigo via-violet to-cyan"
          />
          <div className="space-y-12">
            {steps.map((s, i) => (
              <Reveal
                key={s.title}
                variant={i % 2 === 0 ? "right" : "left"}
                delay={i * 0.05}
                className={`relative flex sm:items-center gap-5 sm:gap-0 ${
                  i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                }`}
              >
                <div className="sm:w-1/2 flex sm:justify-end pl-16 sm:pl-0 sm:pr-12 sm:[&]:pr-0 sm:px-12">
                  <div
                    className={`max-w-sm ${i % 2 === 0 ? "sm:text-right sm:pr-12" : "sm:text-left sm:pl-12"}`}
                  >
                    <div className="text-xs text-muted-foreground">Step {i + 1}</div>
                    <h3 className="mt-1 font-display text-xl font-semibold tracking-tight">{s.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="absolute left-6 sm:left-1/2 -translate-x-1/2 h-12 w-12 rounded-full bg-background border border-border grid place-items-center shadow-card z-10"
                >
                  <s.icon className="h-5 w-5 text-indigo" />
                </motion.div>
                <div className="hidden sm:block sm:w-1/2" />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
