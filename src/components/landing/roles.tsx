import { motion } from "framer-motion";
import { GraduationCap, ShieldCheck, User } from "lucide-react";
import { Reveal, StaggerChildren, childVariant } from "./reveal";

const roles = [
  {
    icon: ShieldCheck,
    name: "Administrator",
    accent: "var(--indigo)",
    desc: "Run the whole school. Monitor performance, generate reports, manage staff.",
    items: ["Multi-school control", "Permissions & roles", "Org-wide analytics"],
  },
  {
    icon: GraduationCap,
    name: "Teacher",
    accent: "var(--violet)",
    desc: "Record attendance, manage marks, and track every student's growth.",
    items: ["One-tap attendance", "Gradebook", "Class insights"],
  },
  {
    icon: User,
    name: "Student",
    accent: "var(--cyan)",
    desc: "View grades, monitor attendance, and track academic progress.",
    items: ["Personal dashboard", "Term reports", "Progress timeline"],
  },
];

export function Roles() {
  return (
    <section id="roles" className="relative py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal variant="blur" className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-[0.18em] text-accent font-medium">For everyone</div>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl font-semibold tracking-tight">
            Built for every role in your school.
          </h2>
        </Reveal>

        <StaggerChildren className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {roles.map((r) => (
            <motion.div key={r.name} variants={childVariant}>
              <RoleCard {...r} />
            </motion.div>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

function RoleCard({
  icon: Icon,
  name,
  accent,
  desc,
  items,
}: {
  icon: typeof User;
  name: string;
  accent: string;
  desc: string;
  items: string[];
}) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group relative h-full rounded-2xl border border-border bg-card p-7 overflow-hidden shadow-card hover:shadow-elevated transition-all"
    >
      <div
        className="absolute -top-24 -right-24 h-56 w-56 rounded-full opacity-20 blur-3xl group-hover:opacity-40 transition-opacity duration-700"
        style={{ background: accent }}
      />
      <motion.div
        whileHover={{ rotate: -6, scale: 1.08 }}
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
        className="relative h-12 w-12 rounded-xl grid place-items-center border border-border"
        style={{ background: `color-mix(in oklab, ${accent} 16%, transparent)` }}
      >
        <Icon className="h-6 w-6" style={{ color: accent }} strokeWidth={2.2} />
      </motion.div>
      <h3 className="relative mt-5 font-display text-2xl font-semibold tracking-tight">{name}</h3>
      <p className="relative mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
      <ul className="relative mt-5 space-y-2">
        {items.map((it) => (
          <li key={it} className="flex items-center gap-2 text-sm">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
            {it}
          </li>
        ))}
      </ul>
      <div className="relative mt-6 flex items-center gap-2 text-sm font-medium" style={{ color: accent }}>
        <span>Explore {name.toLowerCase()} view</span>
        <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>→</motion.span>
      </div>
    </motion.div>
  );
}
