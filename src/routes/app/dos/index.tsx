import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { PageHeader, KpiCard, Card, Heatmap, LineChart, BarRow, StatusBadge } from "@/components/app/primitives";
import { ATTENDANCE_HEATMAP, ATTENDANCE_TREND, CLASSES, SUBJECT_METRICS, STUDENTS } from "@/lib/eduflow-data";
import { Calendar, BookOpen, AlertCircle, Activity, Users, Award } from "lucide-react";

export const Route = createFileRoute("/app/dos/")({
  component: DosDashboard,
});

function DosDashboard() {
  const atRisk = STUDENTS.filter((s) => s.status === "at-risk");
  const topClasses = CLASSES.slice().sort((a, b) => b.avg - a.avg).slice(0, 5);
  const topSubjects = SUBJECT_METRICS.slice().sort((a, b) => b.average - a.average).slice(0, 5);

  return (
    <>
      <PageHeader
        eyebrow="Director of Studies"
        title="Academic command center"
        description="Live academic performance, attendance, and intervention signals across the school."
      />

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
        <KpiCard label="Attendance Rate" value={94.6} decimals={1} suffix="%" delta={1.8} icon={<Calendar className="h-4 w-4" />} accent="success" />
        <KpiCard label="Avg School Score" value={78.2} decimals={1} suffix="%" delta={2.4} icon={<BookOpen className="h-4 w-4" />} accent="indigo" />
        <KpiCard label="Students At Risk" value={atRisk.length} delta={-8.3} icon={<AlertCircle className="h-4 w-4" />} accent="violet" />
        <KpiCard label="Marks Today" value={142} delta={12.5} icon={<Activity className="h-4 w-4" />} accent="cyan" />
        <KpiCard label="Teacher Activity" value={86} suffix="%" delta={0.9} icon={<Users className="h-4 w-4" />} accent="indigo" />
        <KpiCard label="Pass Rate" value={91.2} decimals={1} suffix="%" delta={1.1} icon={<Award className="h-4 w-4" />} accent="success" />
      </div>

      {/* Heatmap hero */}
      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-medium">School-wide Attendance Heatmap</div>
            <div className="text-xs text-muted-foreground">Last 52 weeks · darker = higher attendance</div>
          </div>
          <StatusBadge variant="success">All systems healthy</StatusBadge>
        </div>
        <Heatmap data={ATTENDANCE_HEATMAP} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 lg:col-span-2">
          <div className="text-xs text-muted-foreground mb-1">Academic Performance Trend</div>
          <div className="text-base font-medium mb-3">Last 12 weeks</div>
          <LineChart data={ATTENDANCE_TREND} height={200} gradientId="lg-dos-perf" />
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <div className="font-medium">Insights</div>
          </div>
          <div className="space-y-3">
            <Insight icon={<AlertTriangle className="h-3.5 w-3.5" />} variant="danger" title={`${atRisk.length} students need intervention`} desc="Below 78% attendance or under 55% average" />
            <Insight icon={<TrendingDown className="h-3.5 w-3.5" />} variant="warning" title="S3A declining 2 weeks" desc="Average dropped from 76% to 71%" />
            <Insight icon={<TrendingUp className="h-3.5 w-3.5" />} variant="success" title="Chemistry trending up" desc="Pass rate +5.4% this term" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-medium">Class Rankings</div>
            <button className="text-[11px] text-muted-foreground inline-flex items-center gap-1 hover:text-foreground">View all <ArrowRight className="h-3 w-3" /></button>
          </div>
          <div className="space-y-2.5">
            {topClasses.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-md bg-secondary grid place-items-center text-[10px] font-semibold">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <BarRow label={c.label} value={c.avg} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-medium">Subject Rankings</div>
          </div>
          <div className="space-y-2.5">
            {topSubjects.map((s, i) => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-md bg-secondary grid place-items-center text-[10px] font-semibold">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <BarRow label={s.name} value={s.average} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

function Insight({ icon, variant, title, desc }: { icon: React.ReactNode; variant: "danger" | "warning" | "success"; title: string; desc: string }) {
  const tones = {
    danger: "bg-destructive/10 text-destructive",
    warning: "bg-[oklch(0.78_0.17_75/0.15)] text-[oklch(0.55_0.18_75)] dark:text-[oklch(0.85_0.17_75)]",
    success: "bg-success/15 text-success",
  };
  return (
    <div className="flex items-start gap-3">
      <div className={`h-7 w-7 rounded-lg grid place-items-center shrink-0 ${tones[variant]}`}>{icon}</div>
      <div>
        <div className="text-sm font-medium leading-tight">{title}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{desc}</div>
      </div>
    </div>
  );
}
