import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Card, BarRow, StatusBadge } from "@/components/app/primitives";
import { CLASSES, SUBJECT_METRICS } from "@/lib/eduflow-data";

export const Route = createFileRoute("/app/dos/marks")({
  component: MarksPage,
});

const TABS = ["Entry", "Review", "Analysis"] as const;

function MarksPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Review");
  const grades = [
    { g: "A", count: 184 },
    { g: "B+", count: 226 },
    { g: "B", count: 312 },
    { g: "C", count: 408 },
    { g: "F", count: 154 },
  ];
  const total = grades.reduce((a, b) => a + b.count, 0);

  return (
    <>
      <PageHeader eyebrow="DOS" title="Marks" description="Review submissions, analyze performance, and oversee marks entry." />

      <div className="mb-4 inline-flex p-1 rounded-lg bg-secondary/60 border border-border">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 h-7 text-xs rounded-md ${tab === t ? "bg-card shadow-sm" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      {tab === "Entry" && (
        <Card className="p-5 text-sm text-muted-foreground">
          Marks entry is performed by teachers. As DOS you can review submissions, audit changes, and unlock marks for re-entry.
        </Card>
      )}

      {tab === "Review" && (
        <Card>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-surface/40">
              {["Subject", "Submitted", "Pending", "Avg", "Status"].map((h) => <th key={h} className="text-left text-[11px] uppercase tracking-wider text-muted-foreground px-4 py-2.5">{h}</th>)}
            </tr></thead>
            <tbody>
              {SUBJECT_METRICS.slice(0, 10).map((s) => (
                <tr key={s.name} className="border-b border-border last:border-0 hover:bg-secondary/40">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 tabular-nums">{s.classes - 1}</td>
                  <td className="px-4 py-3 tabular-nums">{Math.max(0, 1)}</td>
                  <td className="px-4 py-3 tabular-nums">{s.average}%</td>
                  <td className="px-4 py-3"><StatusBadge variant={s.passRate >= 85 ? "success" : "warning"}>{s.passRate}% pass</StatusBadge></td>
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
            <div className="space-y-2.5">
              {SUBJECT_METRICS.slice(0, 8).map((s) => <BarRow key={s.name} label={s.name} value={s.average} />)}
            </div>
          </Card>
          <Card className="p-5">
            <div className="font-medium mb-3">Class comparison</div>
            <div className="space-y-2.5">
              {CLASSES.slice(0, 8).map((c) => <BarRow key={c.id} label={c.label} value={c.avg} />)}
            </div>
          </Card>
          <Card className="p-5 lg:col-span-2">
            <div className="font-medium mb-3">Grade distribution</div>
            <div className="space-y-2.5">
              {grades.map((g) => (
                <div key={g.g} className="flex items-center gap-3">
                  <div className="w-8 text-sm font-semibold">{g.g}</div>
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-gradient-hero" style={{ width: `${(g.count / total) * 100}%` }} />
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
