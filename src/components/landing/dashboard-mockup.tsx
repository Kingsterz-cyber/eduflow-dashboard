import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Activity, ArrowUpRight, BookOpen, Calendar, GraduationCap, TrendingUp, Users } from "lucide-react";
import { useEffect, useRef } from "react";
import { Counter } from "./counter";

export function DashboardMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 120, damping: 18 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      mx.set((e.clientX - r.left) / r.width - 0.5);
      my.set((e.clientY - r.top) / r.height - 0.5);
    };
    const onLeave = () => {
      mx.set(0);
      my.set(0);
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [mx, my]);

  return (
    <div ref={ref} className="relative" style={{ perspective: 1400 }}>
      {/* Floating side card - attendance */}
      <motion.div
        initial={{ opacity: 0, x: -40, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.9, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -left-6 sm:-left-12 top-16 z-20 hidden sm:block"
      >
        <div className="animate-float-slow">
          <div className="glass-card rounded-2xl border border-border p-4 shadow-elevated w-[200px]">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-success/15 grid place-items-center">
                <Calendar className="h-4 w-4 text-success" />
              </div>
              <div className="text-xs text-muted-foreground">Attendance today</div>
            </div>
            <div className="text-2xl font-display font-semibold tracking-tight">
              <Counter to={96.4} decimals={1} />%
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "96%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
                className="h-full bg-gradient-hero"
              />
            </div>
            <div className="mt-2 text-[11px] text-success flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +2.1% vs last week
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating side card - activity */}
      <motion.div
        initial={{ opacity: 0, x: 40, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.9, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -right-4 sm:-right-10 bottom-20 z-20 hidden sm:block"
      >
        <div className="animate-float">
          <div className="glass-card rounded-2xl border border-border p-4 shadow-elevated w-[220px]">
            <div className="text-xs text-muted-foreground mb-3">Recent activity</div>
            <div className="space-y-2.5">
              {[
                { name: "Ms. Adler", action: "graded Algebra II", time: "2m" },
                { name: "Mr. Patel", action: "marked attendance", time: "8m" },
                { name: "Class 10-B", action: "report generated", time: "21m" },
              ].map((a, i) => (
                <motion.div
                  key={a.name}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.8 + i * 0.15, duration: 0.5 }}
                  className="flex items-start gap-2"
                >
                  <div className="h-6 w-6 rounded-full bg-gradient-hero shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-tight">
                    <span className="font-medium text-foreground">{a.name}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>
                    <div className="text-muted-foreground/70 mt-0.5">{a.time} ago</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="relative mx-auto max-w-[1040px] rounded-2xl border border-border bg-card shadow-elevated overflow-hidden"
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
            <div className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
            <div className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          </div>
          <div className="ml-3 h-6 flex-1 max-w-md rounded-md bg-background border border-border text-[11px] text-muted-foreground flex items-center justify-center">
            app.eduflow.io / dashboard
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 p-5">
          {/* Sidebar */}
          <div className="col-span-2 hidden md:flex flex-col gap-1.5">
            {[
              { icon: Activity, label: "Overview", active: true },
              { icon: Users, label: "Students" },
              { icon: GraduationCap, label: "Teachers" },
              { icon: BookOpen, label: "Classes" },
              { icon: Calendar, label: "Attendance" },
            ].map((i) => (
              <div
                key={i.label}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs ${
                  i.active ? "bg-secondary text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                <i.icon className="h-3.5 w-3.5" />
                {i.label}
              </div>
            ))}
          </div>

          {/* Main */}
          <div className="col-span-12 md:col-span-10 space-y-4">
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Students", value: 1284, hue: "indigo" },
                { label: "Teachers", value: 86, hue: "violet" },
                { label: "Attendance", value: 96, suffix: "%", hue: "success" },
                { label: "GPA Avg", value: 3.7, decimals: 1, hue: "cyan" },
              ].map((k, i) => (
                <motion.div
                  key={k.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 + i * 0.08, duration: 0.5 }}
                  className="rounded-xl border border-border bg-background p-3"
                >
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.label}</div>
                  <div className="mt-1 text-xl font-display font-semibold tracking-tight">
                    <Counter to={k.value} decimals={k.decimals ?? 0} />
                    {k.suffix ?? ""}
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-success">
                    <ArrowUpRight className="h-2.5 w-2.5" />
                    +{(2 + i * 1.2).toFixed(1)}%
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Chart */}
            <div className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs text-muted-foreground">Academic performance</div>
                  <div className="text-sm font-medium">Last 12 weeks</div>
                </div>
                <div className="flex gap-1">
                  {["W", "M", "Y"].map((t, i) => (
                    <div
                      key={t}
                      className={`px-2 py-1 text-[10px] rounded-md ${
                        i === 1 ? "bg-secondary text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {t}
                    </div>
                  ))}
                </div>
              </div>
              <LineChart />
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-background p-3 lg:col-span-2">
                <div className="text-xs text-muted-foreground mb-2">Subject performance</div>
                <div className="space-y-2">
                  {[
                    { s: "Mathematics", v: 88 },
                    { s: "Science", v: 92 },
                    { s: "English", v: 79 },
                    { s: "History", v: 84 },
                  ].map((b, i) => (
                    <div key={b.s} className="flex items-center gap-3">
                      <div className="text-[11px] text-muted-foreground w-20">{b.s}</div>
                      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${b.v}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: 1.4 + i * 0.1, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full bg-gradient-hero"
                        />
                      </div>
                      <div className="text-[11px] font-medium w-8 text-right">{b.v}%</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-background p-3 grid place-items-center">
                <Donut />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function LineChart() {
  const points = [22, 28, 25, 35, 32, 42, 40, 48, 55, 52, 62, 68];
  const max = 80;
  const w = 600;
  const h = 140;
  const step = w / (points.length - 1);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (p / max) * h}`).join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--indigo)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--indigo)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ls" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--indigo)" />
          <stop offset="100%" stopColor="var(--cyan)" />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill="url(#lg)"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.6 }}
      />
      <motion.path
        d={path}
        fill="none"
        stroke="url(#ls)"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      />
      {points.map((p, i) => (
        <motion.circle
          key={i}
          cx={i * step}
          cy={h - (p / max) * h}
          r="2.5"
          fill="var(--indigo)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.5 + i * 0.04 }}
        />
      ))}
    </svg>
  );
}

function Donut() {
  const r = 32;
  const c = 2 * Math.PI * r;
  return (
    <div className="text-center">
      <div className="relative">
        <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--secondary)" strokeWidth="10" />
          <motion.circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="url(#ls)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            whileInView={{ strokeDashoffset: c * 0.18 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-lg font-display font-semibold">
            <Counter to={82} />%
          </div>
        </div>
      </div>
      <div className="text-[10px] text-muted-foreground mt-1">Pass rate</div>
    </div>
  );
}
