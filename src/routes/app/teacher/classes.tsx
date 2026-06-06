import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Card, BarRow, Avatar, StatusBadge, KpiCard } from "@/components/app/primitives";
import { CLASSES, STUDENTS } from "@/lib/eduflow-data";
import { Users, Calendar, BookOpen, FileText } from "lucide-react";

export const Route = createFileRoute("/app/teacher/classes")({
  component: TeacherClassesPage,
});

const MY = ["S2A", "S3B", "S4A", "S2B"];
const TABS = ["Overview", "Students", "Attendance", "Assessments", "Marks", "Reports", "Analytics"] as const;

function TeacherClassesPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");

  if (!selected) {
    return (
      <>
        <PageHeader eyebrow="Teacher" title="My Classes" description="Tap a class to open the full workspace." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MY.map((id) => {
            const c = CLASSES.find((x) => x.id === id) || CLASSES[0];
            return (
              <Card key={id} hover className="p-5 cursor-pointer" >
                <button onClick={() => setSelected(id)} className="text-left w-full">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-display font-semibold">{c.label}</div>
                    <StatusBadge variant="info">{c.level}</StatusBadge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{c.students} students</div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-muted-foreground">Attendance</div>
                      <div className="font-semibold tabular-nums">{c.attendance}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Average</div>
                      <div className="font-semibold tabular-nums">{c.avg}%</div>
                    </div>
                  </div>
                </button>
              </Card>
            );
          })}
        </div>
      </>
    );
  }

  const c = CLASSES.find((x) => x.id === selected)!;
  const students = STUDENTS.filter((s) => s.classId === selected);

  return (
    <>
      <PageHeader
        eyebrow={<button onClick={() => setSelected(null)} className="text-primary hover:underline">← All classes</button> as never as string}
        title={c.label}
        description={`${c.level} · ${c.students} students · Teacher: ${c.teacher}`}
      />

      <div className="mb-4 inline-flex p-0.5 rounded-lg bg-secondary/60 border border-border overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 h-7 text-xs rounded-md whitespace-nowrap ${tab === t ? "bg-card shadow-sm" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Students" value={c.students} icon={<Users className="h-4 w-4" />} />
          <KpiCard label="Attendance" value={c.attendance} suffix="%" icon={<Calendar className="h-4 w-4" />} accent="success" />
          <KpiCard label="Avg score" value={c.avg} suffix="%" icon={<BookOpen className="h-4 w-4" />} accent="violet" />
          <KpiCard label="Reports" value={5} icon={<FileText className="h-4 w-4" />} accent="cyan" />
        </div>
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
                  <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Avatar initials={s.avatar} color="indigo" size="sm" />{s.name}</div></td>
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
          <div className="font-medium mb-3">Weekly average</div>
          <div className="space-y-2.5">{["Mon", "Tue", "Wed", "Thu", "Fri"].map((d, i) => <BarRow key={d} label={d} value={88 + i} />)}</div>
        </Card>
      )}

      {tab === "Assessments" && (
        <Card className="p-5 text-sm text-muted-foreground">Open the Marks module to create CATs, Quizzes, Assignments, and Exams for {c.label}.</Card>
      )}

      {tab === "Marks" && (
        <Card className="p-5">
          <div className="font-medium mb-3">Subject averages</div>
          <BarRow label="Mathematics" value={c.avg} />
        </Card>
      )}

      {tab === "Reports" && (
        <Card className="p-5 text-sm text-muted-foreground">5 reports available for {c.label}. Use Reports module to generate new ones.</Card>
      )}

      {tab === "Analytics" && (
        <Card className="p-5">
          <div className="font-medium mb-3">Performance overview</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5">
            <BarRow label="Top 25%" value={92} />
            <BarRow label="Middle 50%" value={74} />
            <BarRow label="Bottom 25%" value={56} />
            <BarRow label="At risk" value={28} />
          </div>
        </Card>
      )}
    </>
  );
}
