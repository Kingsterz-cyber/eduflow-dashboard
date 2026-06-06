import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, Download, MoreHorizontal } from "lucide-react";
import { PageHeader, Card, Avatar, StatusBadge, KpiCard } from "@/components/app/primitives";
import { CLASSES, STUDENTS } from "@/lib/eduflow-data";
import { GraduationCap, Calendar, BookOpen, Users } from "lucide-react";

export const Route = createFileRoute("/app/director/students")({
  component: StudentsPage,
});

function StudentsPage() {
  const [selected, setSelected] = useState(CLASSES[0].id);
  const cls = CLASSES.find((c) => c.id === selected)!;
  const students = STUDENTS.filter((s) => s.classId === selected);

  const oLevel = CLASSES.filter((c) => c.level === "O-Level");
  const aLevel = CLASSES.filter((c) => c.level === "A-Level");
  const groups = [
    { label: "O-Level", items: oLevel },
    { label: "A-Level", items: aLevel },
  ];

  return (
    <>
      <PageHeader
        eyebrow="School Director"
        title="Students"
        description="Browse students across levels, classes, and streams."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
        {/* Class tree */}
        <Card className="p-3 self-start lg:sticky lg:top-20">
          {groups.map((g) => (
            <div key={g.label} className="mb-3 last:mb-0">
              <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{g.label}</div>
              <div className="space-y-0.5">
                {Object.entries(g.items.reduce((acc: Record<string, typeof g.items>, c) => {
                  (acc[c.grade] ||= []).push(c);
                  return acc;
                }, {})).map(([grade, classes]) => (
                  <div key={grade}>
                    <div className="px-2 py-1 text-xs font-medium text-foreground/80">{grade}</div>
                    {classes.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelected(c.id)}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition ${
                          selected === c.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <ChevronRight className="h-3 w-3" />
                          {c.label}
                        </span>
                        <span className="text-[10px] tabular-nums text-muted-foreground">{c.students}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Card>

        {/* Detail */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard label="Students" value={cls.students} icon={<GraduationCap className="h-4 w-4" />} />
            <KpiCard label="Attendance" value={cls.attendance} suffix="%" delta={1.2} icon={<Calendar className="h-4 w-4" />} accent="success" />
            <KpiCard label="Avg score" value={cls.avg} suffix="%" delta={0.6} icon={<BookOpen className="h-4 w-4" />} accent="violet" />
            <KpiCard label="Class teacher" value={0} icon={<Users className="h-4 w-4" />} />
          </div>

          <Card className="overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <div>
                <div className="font-medium">{cls.label} · {cls.level}</div>
                <div className="text-[11px] text-muted-foreground">Class teacher: {cls.teacher}</div>
              </div>
              <button className="inline-flex items-center gap-1 h-8 px-3 rounded-md border border-border bg-card hover:bg-secondary text-xs">
                <Download className="h-3.5 w-3.5" /> Export
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface/40">
                    {["Student", "ID", "Attendance", "Avg score", "Status", ""].map((h) => (
                      <th key={h} className="text-left text-[11px] uppercase tracking-wider text-muted-foreground font-medium px-4 py-2.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar initials={s.avatar} color="indigo" size="sm" />
                          <span className="font-medium">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{s.id}</td>
                      <td className="px-4 py-3 tabular-nums">{s.attendance}%</td>
                      <td className="px-4 py-3 tabular-nums">{s.average}%</td>
                      <td className="px-4 py-3">
                        <StatusBadge variant={s.status === "honors" ? "success" : s.status === "at-risk" ? "danger" : "neutral"}>
                          {s.status}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3 w-10">
                        <button className="h-7 w-7 grid place-items-center rounded-md hover:bg-secondary">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
