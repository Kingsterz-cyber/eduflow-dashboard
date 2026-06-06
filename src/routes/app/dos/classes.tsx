import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Card, KpiCard, LineChart, BarRow, Avatar, StatusBadge } from "@/components/app/primitives";
import { CLASSES, STUDENTS, PERFORMANCE_TREND } from "@/lib/eduflow-data";
import { GraduationCap, Calendar, BookOpen, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/app/dos/classes")({
  component: ClassesPage,
});

const TABS = ["Overview", "Students", "Attendance", "Marks", "Reports", "Analytics"] as const;

function ClassesPage() {
  const [selected, setSelected] = useState(CLASSES[0].id);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const cls = CLASSES.find((c) => c.id === selected)!;
  const students = STUDENTS.filter((s) => s.classId === selected);

  return (
    <>
      <PageHeader eyebrow="DOS" title="Classes" description="Drill into each class for academic, attendance, and performance details." />

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
        <Card className="p-3 self-start lg:sticky lg:top-20">
          {["O-Level", "A-Level"].map((lvl) => (
            <div key={lvl} className="mb-3 last:mb-0">
              <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{lvl}</div>
              {CLASSES.filter((c) => c.level === lvl).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c.id)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition ${
                    selected === c.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3" />{c.label}</span>
                  <span className="text-[10px] tabular-nums">{c.students}</span>
                </button>
              ))}
            </div>
          ))}
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{cls.level}</div>
              <h2 className="text-xl font-display font-semibold">{cls.label}</h2>
            </div>
            <div className="inline-flex p-0.5 rounded-lg bg-secondary/60 border border-border overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 h-7 text-xs rounded-md whitespace-nowrap ${tab === t ? "bg-card shadow-sm" : "text-muted-foreground"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {tab === "Overview" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KpiCard label="Students" value={cls.students} icon={<GraduationCap className="h-4 w-4" />} />
                <KpiCard label="Attendance" value={cls.attendance} suffix="%" icon={<Calendar className="h-4 w-4" />} accent="success" />
                <KpiCard label="Avg score" value={cls.avg} suffix="%" icon={<BookOpen className="h-4 w-4" />} accent="violet" />
                <KpiCard label="Pass rate" value={88} suffix="%" accent="cyan" />
              </div>
              <Card className="p-5">
                <div className="font-medium mb-3">Performance trend</div>
                <LineChart data={PERFORMANCE_TREND} height={180} gradientId="lg-cls" />
              </Card>
            </>
          )}

          {tab === "Students" && (
            <Card className="overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-surface/40">
                  {["Student", "Attendance", "Avg", "Status"].map((h) => <th key={h} className="text-left text-[11px] uppercase tracking-wider text-muted-foreground px-4 py-2.5">{h}</th>)}
                </tr></thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                      <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Avatar initials={s.avatar} color="indigo" size="sm" /><span className="font-medium">{s.name}</span></div></td>
                      <td className="px-4 py-3 tabular-nums">{s.attendance}%</td>
                      <td className="px-4 py-3 tabular-nums">{s.average}%</td>
                      <td className="px-4 py-3"><StatusBadge variant={s.status === "honors" ? "success" : s.status === "at-risk" ? "danger" : "neutral"}>{s.status}</StatusBadge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {tab === "Attendance" && (
            <Card className="p-5">
              <div className="font-medium mb-3">Attendance breakdown</div>
              <div className="space-y-2.5">
                {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d, i) => <BarRow key={d} label={d} value={90 + i} />)}
              </div>
            </Card>
          )}

          {tab === "Marks" && (
            <Card className="p-5">
              <div className="font-medium mb-3">Subject averages</div>
              <div className="space-y-2.5">
                {["Mathematics", "English", "Sciences", "History", "Geography"].map((s, i) => (
                  <BarRow key={s} label={s} value={70 + i * 4} />
                ))}
              </div>
            </Card>
          )}

          {tab === "Reports" && (
            <Card className="p-5 text-sm text-muted-foreground">
              5 reports generated this term for {cls.label}. Use the Reports module to generate new ones.
            </Card>
          )}

          {tab === "Analytics" && (
            <Card className="p-5">
              <div className="font-medium mb-3">Performance distribution</div>
              <LineChart data={PERFORMANCE_TREND} height={180} color="var(--cyan)" gradientId="lg-cls-an" />
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
