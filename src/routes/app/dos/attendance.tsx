import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { PageHeader, KpiCard, Card, Heatmap, BarRow } from "@/components/app/primitives";
import { getDosKpis, getAttendanceHeatmap, getClassRankings } from "@/lib/dos.functions";
import { Calendar, Users, CheckCircle2, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/app/dos/attendance")({
  component: AttendancePage,
});

const TABS = ["Today", "This week", "This month"] as const;

function AttendancePage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Today");
  const kpisFn = useServerFn(getDosKpis);
  const heatFn = useServerFn(getAttendanceHeatmap);
  const classesFn = useServerFn(getClassRankings);

  const kpis = useQuery({ queryKey: ["dos", "kpis"], queryFn: () => kpisFn() });
  const heat = useQuery({ queryKey: ["dos", "heat"], queryFn: () => heatFn() });
  const classes = useQuery({ queryKey: ["dos", "classes"], queryFn: () => classesFn() });

  const rate = kpis.data?.attendanceRate ?? 0;

  return (
    <>
      <PageHeader eyebrow="DOS" title="Attendance" description="School-wide attendance with heatmap and class rankings." />

      <div className="mb-4 inline-flex p-1 rounded-lg bg-secondary/60 border border-border">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 h-7 text-xs rounded-md ${tab === t ? "bg-card shadow-sm" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KpiCard label="Rate (30d)" value={rate} decimals={1} suffix="%" icon={<TrendingUp className="h-4 w-4" />} accent="indigo" />
        <KpiCard label="Students" value={kpis.data?.totalStudents ?? 0} icon={<Users className="h-4 w-4" />} accent="violet" />
        <KpiCard label="Classes" value={kpis.data?.totalClasses ?? 0} icon={<Calendar className="h-4 w-4" />} accent="cyan" />
        <KpiCard label="Teachers" value={kpis.data?.totalTeachers ?? 0} icon={<CheckCircle2 className="h-4 w-4" />} accent="success" />
      </div>

      <Card className="p-5 mb-4">
        <div className="font-medium mb-3">Attendance heatmap · 52 weeks</div>
        {heat.data ? <Heatmap data={heat.data} /> : <div className="h-24 grid place-items-center text-xs text-muted-foreground">Loading…</div>}
      </Card>

      <Card className="p-5">
        <div className="font-medium mb-3">Class attendance rankings</div>
        {(classes.data ?? []).length === 0 && <div className="text-xs text-muted-foreground">No classes yet.</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5">
          {(classes.data ?? []).slice().sort((a, b) => b.attendance - a.attendance).slice(0, 12).map((c) => (
            <BarRow key={c.id} label={c.name} value={c.attendance} />
          ))}
        </div>
      </Card>
    </>
  );
}
