import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FileText, AlertTriangle } from "lucide-react";
import { PageHeader, Card, StatusBadge } from "@/components/app/primitives";
import { getStudentsAtRisk, getClassRankings, getSubjectRankings } from "@/lib/dos.functions";

export const Route = createFileRoute("/app/dos/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const atRiskFn = useServerFn(getStudentsAtRisk);
  const classFn = useServerFn(getClassRankings);
  const subjFn = useServerFn(getSubjectRankings);

  const atRisk = useQuery({ queryKey: ["dos", "atRisk"], queryFn: () => atRiskFn() });
  const classes = useQuery({ queryKey: ["dos", "classes"], queryFn: () => classFn() });
  const subjects = useQuery({ queryKey: ["dos", "subjects"], queryFn: () => subjFn() });

  return (
    <>
      <PageHeader eyebrow="DOS" title="Academic Reports" description="Live academic reports synthesised from real data." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-primary" />
            <div className="font-medium">Class performance summary</div>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              {["Class", "Students", "Attendance", "Avg"].map((h) => <th key={h} className="text-left text-[11px] uppercase text-muted-foreground py-2">{h}</th>)}
            </tr></thead>
            <tbody>
              {(classes.data ?? []).length === 0 && <tr><td colSpan={4} className="py-6 text-center text-xs text-muted-foreground">No classes yet.</td></tr>}
              {(classes.data ?? []).map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="py-2 font-medium">{c.name}</td>
                  <td className="py-2 tabular-nums">{c.students}</td>
                  <td className="py-2 tabular-nums">{c.attendance}%</td>
                  <td className="py-2 tabular-nums">{c.avg}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-primary" />
            <div className="font-medium">Subject audit</div>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              {["Subject", "Classes", "Avg", "Pass"].map((h) => <th key={h} className="text-left text-[11px] uppercase text-muted-foreground py-2">{h}</th>)}
            </tr></thead>
            <tbody>
              {(subjects.data ?? []).length === 0 && <tr><td colSpan={4} className="py-6 text-center text-xs text-muted-foreground">No subjects yet.</td></tr>}
              {(subjects.data ?? []).map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="py-2 font-medium">{s.name}</td>
                  <td className="py-2 tabular-nums">{s.classes}</td>
                  <td className="py-2 tabular-nums">{s.average}%</td>
                  <td className="py-2"><StatusBadge variant={s.passRate >= 80 ? "success" : "warning"}>{s.passRate}%</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <div className="font-medium">Students at risk</div>
          <span className="ml-auto text-[11px] text-muted-foreground">{atRisk.data?.length ?? 0} flagged</span>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            {["Student", "Class", "Attendance", "Average", "Reason"].map((h) => <th key={h} className="text-left text-[11px] uppercase text-muted-foreground py-2">{h}</th>)}
          </tr></thead>
          <tbody>
            {(atRisk.data ?? []).length === 0 && <tr><td colSpan={5} className="py-6 text-center text-xs text-muted-foreground">No students at risk — all metrics within thresholds.</td></tr>}
            {(atRisk.data ?? []).map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="py-2 font-medium">{s.name}</td>
                <td className="py-2 text-muted-foreground">{s.className}</td>
                <td className="py-2 tabular-nums">{s.attendance}%</td>
                <td className="py-2 tabular-nums">{s.average}%</td>
                <td className="py-2"><StatusBadge variant="danger">{s.reason}</StatusBadge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
