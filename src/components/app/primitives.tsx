import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

// ---------- PageHeader ----------
export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
      <div>
        {eyebrow && (
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">
            {eyebrow}
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-display font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

// ---------- Card ----------
export function Card({
  children,
  className = "",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card transition-all ${
        hover ? "hover:border-foreground/20 hover:shadow-card" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ---------- Counter ----------
export function Counter({ to, decimals = 0, prefix = "", suffix = "" }: {
  to: number; decimals?: number; prefix?: string; suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) =>
    v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }),
  );

  useEffect(() => {
    if (!inView) return;
    const c = animate(mv, to, { duration: 1.4, ease: [0.22, 1, 0.36, 1] });
    return () => c.stop();
  }, [inView, to, mv]);

  useEffect(() => rounded.on("change", (v) => {
    if (ref.current) ref.current.textContent = prefix + v + suffix;
  }), [rounded, prefix, suffix]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}

// ---------- KPI Card ----------
export function KpiCard({
  label, value, decimals = 0, suffix = "", delta, icon, accent = "indigo", spark,
}: {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  delta?: number;
  icon?: ReactNode;
  accent?: "indigo" | "violet" | "cyan" | "success";
  spark?: number[];
}) {
  const accentMap = {
    indigo: "bg-[oklch(0.52_0.22_275/0.12)] text-indigo",
    violet: "bg-[oklch(0.56_0.24_295/0.12)] text-violet",
    cyan: "bg-[oklch(0.78_0.14_210/0.18)] text-accent-foreground",
    success: "bg-success/15 text-success",
  };

  return (
    <Card className="p-4 sm:p-5" hover>
      <div className="flex items-start justify-between">
        <div className="text-xs text-muted-foreground font-medium">{label}</div>
        {icon && <div className={`h-8 w-8 rounded-lg grid place-items-center ${accentMap[accent]}`}>{icon}</div>}
      </div>
      <div className="mt-2 text-2xl sm:text-[26px] font-display font-semibold tracking-tight">
        <Counter to={value} decimals={decimals} suffix={suffix} />
      </div>
      <div className="mt-2 flex items-center justify-between">
        {typeof delta === "number" && (
          <div className={`flex items-center gap-1 text-[11px] font-medium ${delta >= 0 ? "text-success" : "text-destructive"}`}>
            {delta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta).toFixed(1)}%
            <span className="text-muted-foreground font-normal ml-1">vs last week</span>
          </div>
        )}
        {spark && <Sparkline data={spark} />}
      </div>
    </Card>
  );
}

// ---------- Sparkline ----------
export function Sparkline({ data, w = 80, h = 24, color = "var(--indigo)" }: {
  data: number[]; w?: number; h?: number; color?: string;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - ((d - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

// ---------- StatusBadge ----------
export function StatusBadge({ children, variant = "neutral" }: {
  children: ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
}) {
  const map = {
    success: "bg-success/15 text-success border-success/20",
    warning: "bg-[oklch(0.78_0.17_75/0.15)] text-[oklch(0.55_0.18_75)] border-[oklch(0.78_0.17_75/0.3)] dark:text-[oklch(0.85_0.17_75)]",
    danger: "bg-destructive/12 text-destructive border-destructive/25",
    info: "bg-[oklch(0.78_0.14_210/0.18)] text-[oklch(0.4_0.14_210)] border-[oklch(0.78_0.14_210/0.3)] dark:text-[oklch(0.85_0.14_210)]",
    neutral: "bg-secondary text-muted-foreground border-border",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium ${map[variant]}`}>
      {children}
    </span>
  );
}

// ---------- Heatmap (GitHub-style) ----------
export function Heatmap({ data, label }: { data: number[][]; label?: string }) {
  const colors = [
    "bg-secondary",
    "bg-[oklch(0.78_0.14_210/0.3)]",
    "bg-[oklch(0.6_0.18_240/0.5)]",
    "bg-[oklch(0.55_0.22_270/0.75)]",
    "bg-[oklch(0.5_0.24_280)]",
  ];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {label && <div className="text-xs text-muted-foreground mb-2">{label}</div>}
        <div className="flex gap-[3px]">
          {data.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((cell, ci) => (
                <motion.div
                  key={ci}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: (wi * 7 + ci) * 0.003, duration: 0.25 }}
                  className={`h-2.5 w-2.5 rounded-[3px] ${colors[cell]}`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex gap-3">
            {months.filter((_, i) => i % 2 === 0).map((m) => <span key={m}>{m}</span>)}
          </div>
          <div className="flex items-center gap-1">
            <span>Less</span>
            {colors.map((c, i) => <div key={i} className={`h-2.5 w-2.5 rounded-[3px] ${c}`} />)}
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Animated LineChart ----------
export function LineChart({
  data,
  height = 180,
  color = "var(--indigo)",
  gradientId = "lg-default",
}: {
  data: number[];
  height?: number;
  color?: string;
  gradientId?: string;
}) {
  const w = 600;
  const h = height;
  const max = Math.max(...data) * 1.1;
  const min = Math.min(...data) * 0.9;
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - ((d - min) / range) * h}`).join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill={`url(#${gradientId})`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.3 }}
      />
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

// ---------- BarRow (horizontal bars) ----------
export function BarRow({ label, value, max = 100, suffix = "%" }: {
  label: string; value: number; max?: number; suffix?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-[11px] text-muted-foreground w-28 truncate">{label}</div>
      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${(value / max) * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="h-full bg-gradient-hero"
        />
      </div>
      <div className="text-[11px] font-medium w-10 text-right tabular-nums">{value}{suffix}</div>
    </div>
  );
}

// ---------- Avatar ----------
export function Avatar({ initials, color = "indigo", size = "md" }: {
  initials: string; color?: "indigo" | "violet" | "cyan" | "muted"; size?: "sm" | "md" | "lg";
}) {
  const colors = {
    indigo: "bg-[oklch(0.52_0.22_275/0.18)] text-indigo",
    violet: "bg-[oklch(0.56_0.24_295/0.18)] text-violet",
    cyan: "bg-[oklch(0.78_0.14_210/0.25)] text-foreground",
    muted: "bg-secondary text-foreground",
  };
  const sizes = { sm: "h-7 w-7 text-[10px]", md: "h-9 w-9 text-xs", lg: "h-11 w-11 text-sm" };
  return (
    <div className={`rounded-full grid place-items-center font-semibold ${colors[color]} ${sizes[size]}`}>
      {initials}
    </div>
  );
}
