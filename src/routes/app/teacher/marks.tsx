import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader, Card, StatusBadge, Avatar } from "@/components/app/primitives";
import { ASSESSMENTS, STUDENTS } from "@/lib/eduflow-data";

export const Route = createFileRoute("/app/teacher/marks")({
  component: MarksPage,
});

function grade(v: number) {
  if (v >= 80) return "A";
  if (v >= 75) return "B+";
  if (v >= 65) return "B";
  if (v >= 50) return "C";
  return "F";
}

function MarksPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = ASSESSMENTS.find((a) => a.id === openId);
  const roster = STUDENTS.filter((s) => s.classId === "S2A").slice(0, 8);

  if (open) {
    return (
      <>
        <PageHeader
          eyebrow={<button onClick={() => setOpenId(null)} className="text-primary hover:underline">← All assessments</button> as never as string}
          title={open.title}
          description={`${open.type} · ${open.classLabel} · ${open.subject}`}
          actions={
            <button className="h-9 px-4 rounded-lg bg-gradient-hero text-white text-sm font-medium">Save & submit</button>
          }
        />
        <Card>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-surface/40">
              {["Student", "CAT 1 /20", "CAT 2 /20", "Exam /60", "Total /100", "Grade"].map((h) => <th key={h} className="text-left text-[11px] uppercase tracking-wider text-muted-foreground px-4 py-2.5">{h}</th>)}
            </tr></thead>
            <tbody>
              {roster.map((s) => {
                const c1 = Math.round(s.average * 0.2);
                const c2 = Math.round((s.average + 5) * 0.2);
                const ex = Math.round(s.average * 0.6);
                const total = c1 + c2 + ex;
                return (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5"><div className="flex items-center gap-2.5"><Avatar initials={s.avatar} color="indigo" size="sm" />{s.name}</div></td>
                    {[c1, c2, ex].map((v, i) => (
                      <td key={i} className="px-4 py-2.5">
                        <input defaultValue={v} className="w-16 h-8 px-2 rounded-md bg-secondary/50 border border-border text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring/40" />
                      </td>
                    ))}
                    <td className="px-4 py-2.5 font-semibold tabular-nums">{total}</td>
                    <td className="px-4 py-2.5"><StatusBadge variant={total >= 75 ? "success" : total >= 50 ? "info" : "danger"}>{grade(total)}</StatusBadge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Teacher"
        title="Marks"
        description="Create assessments and enter scores. Totals, averages, and grades auto-calculate."
        actions={
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-gradient-hero text-white text-sm font-medium">
            <Plus className="h-4 w-4" /> New assessment
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ASSESSMENTS.map((a) => (
          <Card key={a.id} hover className="p-4 cursor-pointer" >
            <button onClick={() => setOpenId(a.id)} className="text-left w-full">
              <div className="flex items-center justify-between">
                <StatusBadge variant="info">{a.type}</StatusBadge>
                <StatusBadge variant={a.status === "graded" ? "success" : a.status === "open" ? "info" : "neutral"}>{a.status}</StatusBadge>
              </div>
              <div className="mt-3 font-medium">{a.title}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{a.classLabel} · {a.subject}</div>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Due {a.due}</span>
                <span className="tabular-nums font-medium">{a.submissions}/{a.total}</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-gradient-hero" style={{ width: `${(a.submissions / a.total) * 100}%` }} />
              </div>
            </button>
          </Card>
        ))}
      </div>
    </>
  );
}
