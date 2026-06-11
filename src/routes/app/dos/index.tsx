import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { AlertTriangle, ArrowRight, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { PageHeader, KpiCard, Card, Heatmap, LineChart, BarRow, StatusBadge } from "@/components/app/primitives";
import { Calendar, BookOpen, AlertCircle, Activity, Users, Award } from "lucide-react";
import {
  getDosKpis,
  getAttendanceHeatmap,
  getWeeklyTrends,
  getClassRankings,
  getSubjectRankings,
  getStudentsAtRisk,
} from "@/lib/dos.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app/dos/")({
  component: DosDashboard,
});

function DosDashboard() {
  const kpisFn = useServerFn(getDosKpis);
  const heatFn = useServerFn(getAttendanceHeatmap);
  const trendFn = useServerFn(getWeeklyTrends);
  const classesFn = useServerFn(getClassRankings);
  const subjectsFn = useServerFn(getSubjectRankings);
  const atRiskFn = useServerFn(getStudentsAtRisk);

  const kpis = useQuery({ queryKey: ["dos", "kpis"], queryFn: () => kpisFn() });
  const heat = useQuery({ queryKey: ["dos", "heat"], queryFn: () => heatFn() });
  const trends = useQuery({ queryKey: ["dos", "trends"], queryFn: () => trendFn() });
  const classes = useQuery({ queryKey: ["dos", "classes"], queryFn: () => classesFn() });
  const subjects = useQuery({ queryKey: ["dos", "subjects"], queryFn: () => subjectsFn() });
  const atRisk = useQuery({ queryKey: ["dos", "atRisk"], queryFn: () => atRiskFn() });

  useEffect(() => {
    const ch = supabase
      .channel("dos-dash")
      .on("postgres_changes", { event: "*", schema: "public", table: "marks" }, () => {
        kpis.refetch(); trends.refetch(); classes.refetch(); subjects.refetch(); atRisk.refetch();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance" }, () => {
        kpis.refetch(); heat.refetch(); trends.refetch(); classes.refetch(); atRisk.refetch();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []); // eslint-disable-line

  const k = kpis.data;
  const topClasses = (classes.data ?? []).slice(0, 5);
  const topSubjects = (subjects.data ?? []).slice(0, 5);
  const atRiskList = atRisk.data ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Director of Studies"
        title="Academic command center"
        description="Live academic performance, attendance, and intervention signals across the school."
      />

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
        <KpiCard label="Attendance Rate" value={k?.attendanceRate ?? 0} decimals={1} suffix="%" icon={<Calendar className="h-4 w-4" />} accent="success" />
        <KpiCard label="Avg School Score" value={k?.avgScore ?? 0} decimals={1} suffix="%" icon={<BookOpen className="h-4 w-4" />} accent="indigo" />
        <KpiCard label="Students At Risk" value={atRiskList.length} icon={<AlertCircle className="h-4 w-4" />} accent="violet" />
        <KpiCard label="Marks Today" value={k?.marksToday ?? 0} icon={<Activity className="h-4 w-4" />} accent="cyan" />
        <KpiCard label="Teachers" value={k?.totalTeachers ?? 0} icon={<Users className="h-4 w-4" />} accent="indigo" />
        <KpiCard label="Pass Rate" value={k?.passRate ?? 0} decimals={1} suffix="%" icon={<Award className="h-4 w-4" />} accent="success" />
      </div>

      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-medium">School-wide Attendance Heatmap</div>
            <div className="text-xs text-muted-foreground">Last 52 weeks · darker = higher attendance</div>
          </div>
          <StatusBadge variant="success">Live</StatusBadge>
        </div>
        {heat.data ? <Heatmap data={heat.data} /> : <div className="h-24 grid place-items-center text-xs text-muted-foreground">Loading…</div>}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 lg:col-span-2">
          <div className="text-xs text-muted-foreground mb-1">Academic Performance Trend</div>
          <div className="text-base font-medium mb-3">Last 12 weeks</div>
          {trends.data && trends.data.performanceTrend.some((v) => v > 0) ? (
            <LineChart data={trends.data.performanceTrend} height={200} gradientId="lg-dos-perf" />
          ) : (
            <div className="h-[200px] grid place-items-center text-xs text-muted-foreground">No marks recorded yet</div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <div className="font-medium">Insights</div>
          </div>
          <div className="space-y-3">
            {atRiskList.length > 0 && (
              <Insight icon={<AlertTriangle className="h-3.5 w-3.5" />} variant="danger" title={`${atRiskList.length} students need intervention`} desc="Below 78% attendance or under 55% average" />
            )}
            {(k?.passRate ?? 0) >= 80 && (
              <Insight icon={<TrendingUp className="h-3.5 w-3.5" />} variant="success" title={`Pass rate ${k?.passRate}%`} desc="School-wide across all assessments" />
            )}
            {(k?.attendanceRate ?? 0) < 85 && (
              <Insight icon={<TrendingDown className="h-3.5 w-3.5" />} variant="warning" title="Attendance below target" desc="Investigate classes with recurring absences" />
            )}
            {!atRiskList.length && (k?.passRate ?? 0) < 80 && (k?.attendanceRate ?? 0) >= 85 && (
              <div className="text-xs text-muted-foreground">No critical signals — all metrics within thresholds.</div>
            )}
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
            {topClasses.length === 0 && <div className="text-xs text-muted-foreground">No classes yet.</div>}
            {topClasses.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-md bg-secondary grid place-items-center text-[10px] font-semibold">{i + 1}</div>
                <div className="flex-1 min-w-0"><BarRow label={c.name} value={c.avg} /></div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="font-medium mb-4">Subject Rankings</div>
          <div className="space-y-2.5">
            {topSubjects.length === 0 && <div className="text-xs text-muted-foreground">No subjects yet.</div>}
            {topSubjects.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-md bg-secondary grid place-items-center text-[10px] font-semibold">{i + 1}</div>
                <div className="flex-1 min-w-0"><BarRow label={s.name} value={s.average} /></div>
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
