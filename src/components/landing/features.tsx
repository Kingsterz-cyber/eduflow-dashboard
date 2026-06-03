import { motion } from "framer-motion";
import {
  BarChart3,
  Calendar,
  ClipboardList,
  GraduationCap,
  LineChart,
  Users,
} from "lucide-react";
import { Reveal, StaggerChildren, childVariant } from "./reveal";
import { motion as m } from "framer-motion";

const features = [
  {
    icon: Users,
    title: "Student Management",
    desc: "Enroll, organize, and track every student across classes and schools with zero friction.",
    span: "lg:col-span-2",
    preview: <StudentPreview />,
  },
  {
    icon: GraduationCap,
    title: "Teacher Management",
    desc: "Securely invite teachers and manage permissions per school.",
    preview: <TeacherPreview />,
  },
  {
    icon: Calendar,
    title: "Attendance Tracking",
    desc: "One-tap daily attendance with smart pattern detection.",
    preview: <AttendancePreview />,
  },
  {
    icon: ClipboardList,
    title: "Academic Reports",
    desc: "Beautiful printable reports for parents, generated in seconds.",
    span: "lg:col-span-2",
    preview: <ReportPreview />,
  },
  {
    icon: BarChart3,
    title: "School Analytics",
    desc: "Real-time dashboards across attendance, grades and growth.",
    span: "lg:col-span-2",
    preview: <AnalyticsPreview />,
  },
  {
    icon: LineChart,
    title: "Performance Monitoring",
    desc: "Spot at-risk students early with subject-level insights.",
    preview: <PerfPreview />,
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal variant="blur" className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-[0.18em] text-accent font-medium">Features</div>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl font-semibold tracking-tight">
            Everything a school needs.
            <span className="text-gradient block">Nothing it doesn't.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Six powerful modules that work together as one product — not a patchwork of tools.
          </p>
        </Reveal>

        <StaggerChildren className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <motion.div key={f.title} variants={childVariant} className={f.span ?? ""}>
              <FeatureCard {...f} />
            </motion.div>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  preview,
}: {
  icon: typeof Users;
  title: string;
  desc: string;
  preview: React.ReactNode;
}) {
  return (
    <m.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group relative h-full rounded-2xl border border-border bg-card p-6 overflow-hidden shadow-card hover:shadow-elevated transition-shadow"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-glow" />
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-hero/10 border border-border grid place-items-center">
            <Icon className="h-5 w-5 text-indigo" />
          </div>
          <h3 className="font-display font-semibold text-lg tracking-tight">{title}</h3>
        </div>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{desc}</p>
        <div className="mt-6">{preview}</div>
      </div>
    </m.div>
  );
}

/* mini previews */
function StudentPreview() {
  return (
    <div className="rounded-xl border border-border bg-background p-3 space-y-2">
      {["Aarav Sharma · 10-B", "Lina Park · 9-A", "Emma Costa · 11-C"].map((s, i) => (
        <div key={s} className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-full bg-gradient-hero" />
          <div className="flex-1 text-xs">{s}</div>
          <div className="text-[10px] text-success">Active</div>
        </div>
      ))}
    </div>
  );
}

function TeacherPreview() {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="text-[10px] text-muted-foreground mb-2">Pending invites</div>
      <div className="flex -space-x-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-7 w-7 rounded-full bg-gradient-hero border-2 border-card" />
        ))}
        <div className="h-7 w-7 rounded-full border-2 border-card bg-secondary grid place-items-center text-[10px]">
          +6
        </div>
      </div>
    </div>
  );
}

function AttendancePreview() {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 28 }).map((_, i) => {
          const lvl = (i * 7) % 5;
          const op = 0.15 + lvl * 0.2;
          return <div key={i} className="aspect-square rounded-sm" style={{ background: `oklch(0.52 0.22 275 / ${op})` }} />;
        })}
      </div>
    </div>
  );
}

function ReportPreview() {
  return (
    <div className="rounded-xl border border-border bg-background p-4 grid grid-cols-3 gap-3">
      {["Term 1", "Term 2", "Term 3"].map((t, i) => (
        <div key={t} className="rounded-lg border border-border p-3">
          <div className="text-[10px] text-muted-foreground">{t}</div>
          <div className="mt-1 text-lg font-display font-semibold">A{i === 1 ? "+" : ""}</div>
          <div className="mt-2 h-1 rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-gradient-hero" style={{ width: `${75 + i * 7}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsPreview() {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-end gap-2 h-24">
        {[40, 60, 50, 78, 65, 88, 72, 95].map((h, i) => (
          <m.div
            key={i}
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 rounded-t-md bg-gradient-hero"
          />
        ))}
      </div>
    </div>
  );
}

function PerfPreview() {
  return (
    <div className="rounded-xl border border-border bg-background p-3 space-y-2">
      {[
        { s: "Math", v: 92 },
        { s: "Science", v: 86 },
      ].map((b) => (
        <div key={b.s}>
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-muted-foreground">{b.s}</span>
            <span className="font-medium">{b.v}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-gradient-hero" style={{ width: `${b.v}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
