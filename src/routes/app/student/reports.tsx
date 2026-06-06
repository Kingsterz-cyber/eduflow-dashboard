import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText } from "lucide-react";
import { PageHeader, Card, StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/app/student/reports")({
  component: MyReportsPage,
});

const REPORTS = [
  { id: "R1", name: "Term 2 — Mid-term Report Card", date: "Today", size: "180 KB", new: true },
  { id: "R2", name: "Term 1 — Final Report Card", date: "8 Nov", size: "210 KB" },
  { id: "R3", name: "Academic Progress — Sciences", date: "1 Nov", size: "320 KB" },
  { id: "R4", name: "Term 1 — Attendance Summary", date: "25 Oct", size: "120 KB" },
];

function MyReportsPage() {
  return (
    <>
      <PageHeader eyebrow="Student" title="Reports" description="Download report cards and academic progress reports." />
      <Card>
        {REPORTS.map((r) => (
          <div key={r.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-border last:border-0 hover:bg-secondary/40">
            <div className="h-10 w-10 rounded-lg bg-secondary grid place-items-center"><FileText className="h-4 w-4 text-primary" /></div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium flex items-center gap-2">{r.name} {r.new && <StatusBadge variant="info">New</StatusBadge>}</div>
              <div className="text-[11px] text-muted-foreground">{r.date} · {r.size}</div>
            </div>
            <button className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-card hover:bg-secondary text-xs">
              <Download className="h-3.5 w-3.5" /> Download
            </button>
          </div>
        ))}
      </Card>
    </>
  );
}
