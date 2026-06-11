import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { PageHeader, Card, BarRow, StatusBadge } from "@/components/app/primitives";
import { getSubjectRankings, getClassRankings, getGradeDistribution } from "@/lib/dos.functions";

export const Route = createFileRoute("/app/dos/marks")({
  component: MarksPage,
});

const TABS = ["Review", "Analysis"] as const;

function MarksPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Review");
  const subjFn = useServerFn(getSubjectRankings);
  const classFn = useServerFn(getClassRankings);
  const gradeFn = useServerFn(getGradeDistribution);

  const subjects = useQuery({ queryKey: ["dos", "subjects"], queryFn: () => subjFn() });
  const classes = useQuery({ queryKey: ["dos", "classes"], queryFn: () => classFn() });
  const grades = useQuery({ queryKey: ["dos", "grades"], queryFn: () => gradeFn() });

  const gradeRows = grades.data?.grades ?? [];
  const total = grades.data?.total ?? 0;

  return (
    <>
      <PageHeader eyebrow="DOS" title="Marks" description="Review submissions, analyze performance, and oversee marks entry." />

      <div className="mb-4 inline-flex p-1 rounded-lg bg-secondary/60 border border-border">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 h-7 text-xs rounded-md ${tab === t ? "bg-card shadow-sm" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      {tab === "Review" && (
        <Card>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-surface/40">
              {["Subject", "Department", "Classes", "Teachers", "Avg", "Pass rate"].map((h) => <th key={h} className="text-left text-[11px] uppercase tracking-wider text-muted-foreground px-4 py-2.5">{h}</th>)}
            </tr></thead>
            <tbody>
              {(subjects.data ?? []).length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No subjects yet.</td></tr>
              )}
              {(subjects.data ?? []).map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{s.department}</td>
                  <td className="px-4 py-3 tabular-nums">{s.classes}</td>
                  <td className="px-4 py-3 tabular-nums">{s.teachers}</td>
                  <td className="px-4 py-3 tabular-nums">{s.average}%</td>
                  <td className="px-4 py-3"><StatusBadge variant={s.passRate >= 85 ? "success" : s.passRate >= 70 ? "info" : "warning"}>{s.passRate}% pass</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "Analysis" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-5">
            <div className="font-medium mb-3">Subject comparison</div>
            {(subjects.data ?? []).length === 0 && <div className="text-xs text-muted-foreground">No data yet.</div>}
            <div className="space-y-2.5">
              {(subjects.data ?? []).slice(0, 10).map((s) => <BarRow key={s.id} label={s.name} value={s.average} />)}
            </div>
          </Card>
          <Card className="p-5">
            <div className="font-medium mb-3">Class comparison</div>
            {(classes.data ?? []).length === 0 && <div className="text-xs text-muted-foreground">No data yet.</div>}
            <div className="space-y-2.5">
              {(classes.data ?? []).slice(0, 10).map((c) => <BarRow key={c.id} label={c.name} value={c.avg} />)}
            </div>
          </Card>
          <Card className="p-5 lg:col-span-2">
            <div className="font-medium mb-3">Grade distribution · {total.toLocaleString()} entries</div>
            {gradeRows.length === 0 && <div className="text-xs text-muted-foreground">No graded entries yet.</div>}
            <div className="space-y-2.5">
              {gradeRows.map((g) => (
                <div key={g.grade} className="flex items-center gap-3">
                  <div className="w-10 text-sm font-semibold">{g.grade}</div>
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-gradient-hero" style={{ width: `${total ? (g.count / total) * 100 : 0}%` }} />
                  </div>
                  <div className="text-[11px] text-muted-foreground tabular-nums w-12 text-right">{g.count}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
