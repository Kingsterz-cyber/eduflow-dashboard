import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText } from "lucide-react";
import { PageHeader, Card, StatusBadge } from "@/components/app/primitives";
import { SCHOOL, CLASSES, ALL_SUBJECTS } from "@/lib/eduflow-data";

export const Route = createFileRoute("/app/dos/reports")({
  component: ReportsPage,
});

const RECENT = [
  { id: "R1", name: "Term 2 — Academic Performance", type: "Academic", date: "Today", size: "1.8 MB" },
  { id: "R2", name: "S3 — Mock Exam Results", type: "Class", date: "Yesterday", size: "920 KB" },
  { id: "R3", name: "Chemistry — Performance Audit", type: "Subject", date: "3d ago", size: "640 KB" },
  { id: "R4", name: "Attendance Compliance — Oct", type: "Attendance", date: "1w ago", size: "420 KB" },
];

function ReportsPage() {
  return (
    <>
      <PageHeader eyebrow="DOS" title="Academic Reports" description="Generate detailed academic, attendance, and subject reports." />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4">
        <Card className="p-5">
          <div className="font-medium mb-4">Generate Report</div>
          <div className="space-y-3">
            <Field label="Report type"><Select options={["Academic Performance", "Subject Audit", "Class Comparison", "Attendance Compliance"]} /></Field>
            <Field label="Academic year"><Select options={[SCHOOL.academicYear, "2024/2025"]} /></Field>
            <Field label="Term"><Select options={["Term 1", "Term 2", "Term 3"]} /></Field>
            <Field label="Class"><Select options={["All", ...CLASSES.map((c) => c.label)]} /></Field>
            <Field label="Subject"><Select options={["All", ...ALL_SUBJECTS.map((s) => s.name)]} /></Field>
            <button className="mt-2 w-full h-9 rounded-lg bg-gradient-hero text-white text-sm font-medium hover:opacity-90">Generate</button>
          </div>
        </Card>
        <Card>
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <div className="font-medium">Recent</div>
            <span className="text-[11px] text-muted-foreground">{RECENT.length} files</span>
          </div>
          {RECENT.map((r) => (
            <div key={r.id} className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-0 hover:bg-secondary/40">
              <div className="h-9 w-9 rounded-md bg-secondary grid place-items-center"><FileText className="h-4 w-4 text-primary" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{r.name}</div>
                <div className="text-[11px] text-muted-foreground">{r.date} · {r.size}</div>
              </div>
              <StatusBadge>{r.type}</StatusBadge>
              <button className="h-8 w-8 grid place-items-center rounded-md hover:bg-secondary"><Download className="h-4 w-4" /></button>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</span>{children}</label>;
}
function Select({ options }: { options: string[] }) {
  return <select className="w-full h-9 px-3 rounded-lg bg-secondary/50 border border-border text-sm">{options.map((o) => <option key={o}>{o}</option>)}</select>;
}
