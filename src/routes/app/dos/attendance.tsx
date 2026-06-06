import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, KpiCard, Card, Heatmap, BarRow } from "@/components/app/primitives";
import { ATTENDANCE_HEATMAP, CLASSES } from "@/lib/eduflow-data";
import { Calendar, Users, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/app/dos/attendance")({
  component: AttendancePage,
});

const TABS = ["Today", "This week", "This month"] as const;

function AttendancePage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Today");
  return (
    <>
      <PageHeader eyebrow="DOS" title="Attendance" description="School-wide attendance with heatmap and class rankings." />

      <div className="mb-4 inline-flex p-1 rounded-lg bg-secondary/60 border border-border">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 h-7 text-xs rounded-md ${tab === t ? "bg-card shadow-sm" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KpiCard label="Present" value={1212} icon={<CheckCircle2 className="h-4 w-4" />} accent="success" />
        <KpiCard label="Absent" value={48} icon={<Users className="h-4 w-4" />} accent="violet" />
        <KpiCard label="Late" value={24} icon={<Calendar className="h-4 w-4" />} accent="cyan" />
        <KpiCard label="Rate" value={94.6} decimals={1} suffix="%" delta={1.8} accent="indigo" />
      </div>

      <Card className="p-5 mb-4">
        <div className="font-medium mb-3">Attendance heatmap · 52 weeks</div>
        <Heatmap data={ATTENDANCE_HEATMAP} />
      </Card>

      <Card className="p-5">
        <div className="font-medium mb-3">Class attendance rankings</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5">
          {CLASSES.slice().sort((a, b) => b.attendance - a.attendance).slice(0, 12).map((c) => (
            <BarRow key={c.id} label={c.label} value={c.attendance} />
          ))}
        </div>
      </Card>
    </>
  );
}
