import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { Reveal } from "./reveal";
import { Counter } from "./counter";

export function AnalyticsSection() {
  return (
    <section id="analytics" className="relative py-28 bg-surface/40 border-y border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 grid lg:grid-cols-2 gap-14 items-center">
        <Reveal variant="left">
          <div className="text-xs uppercase tracking-[0.18em] text-accent font-medium">Analytics</div>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.05]">
            Turn school data into <span className="text-gradient">actionable insights.</span>
          </h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            Attendance trends, subject performance, class comparisons — surfaced automatically with
            recommendations you can act on the same day.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-6">
            {[
              { v: 34, suffix: "%", l: "Time saved on reporting" },
              { v: 12, suffix: "%", l: "Avg grade improvement" },
              { v: 96, suffix: "%", l: "Avg attendance rate" },
              { v: 3.5, decimals: 1, suffix: "x", l: "Faster decisions" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-2xl font-display font-semibold">
                  <Counter to={s.v} decimals={s.decimals ?? 0} />
                  {s.suffix}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal variant="right">
          <ChartShowcase />
        </Reveal>
      </div>
    </section>
  );
}

function ChartShowcase() {
  return (
    <div className="relative rounded-2xl border border-border bg-card p-6 shadow-elevated">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-medium">Attendance & performance</div>
          <div className="text-xs text-muted-foreground">Term overview</div>
        </div>
        <div className="text-xs text-success flex items-center gap-1">
          <TrendingUp className="h-3 w-3" /> Trending up
        </div>
      </div>

      <DualLineChart />

      <div className="mt-5 grid grid-cols-4 gap-2">
        {["8A", "9B", "10C", "11A"].map((c, i) => {
          const v = 70 + i * 7;
          return (
            <div key={c} className="rounded-lg border border-border p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Class {c}</div>
              <div className="text-sm font-medium mt-0.5">
                <Counter to={v} />%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DualLineChart() {
  const a = [30, 38, 35, 50, 48, 60, 58, 70, 72, 80];
  const b = [22, 28, 30, 35, 42, 48, 52, 58, 65, 70];
  const w = 520;
  const h = 180;
  const max = 90;
  const step = w / (a.length - 1);
  const toPath = (arr: number[]) =>
    arr.map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (p / max) * h}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-44">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--indigo)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--indigo)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1="0" y1={(h / 4) * i + 10} x2={w} y2={(h / 4) * i + 10} stroke="var(--border)" strokeDasharray="3 6" />
      ))}
      <motion.path
        d={`${toPath(a)} L ${w} ${h} L 0 ${h} Z`}
        fill="url(#g1)"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.4 }}
      />
      <motion.path
        d={toPath(a)}
        fill="none"
        stroke="var(--indigo)"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d={`${toPath(b)} L ${w} ${h} L 0 ${h} Z`}
        fill="url(#g2)"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.6 }}
      />
      <motion.path
        d={toPath(b)}
        fill="none"
        stroke="var(--cyan)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="4 4"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}
