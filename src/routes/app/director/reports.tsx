import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText } from "lucide-react";
import { PageHeader, Card, StatusBadge } from "@/components/app/primitives";
import { SCHOOL, CLASSES, ALL_SUBJECTS } from "@/lib/eduflow-data";

export const Route = createFileRoute("/app/director/reports")({
  component: ReportsPage,
});

const RECENT = [
  { id: "R1", name: "Term 1 — School-wide Report", type: "School", date: "12 Nov", size: "2.4 MB" },
  { id: "R2", name: "S4 — Class Performance", type: "Class", date: "8 Nov", size: "820 KB" },
  { id: "R3", name: "Mathematics — Subject Report", type: "Subject", date: "2 Nov", size: "1.1 MB" },
  { id: "R4", name: "Amelia Adler — Report Card", type: "Student", date: "1 Nov", size: "210 KB" },
  { id: "R5", name: "S2A — Attendance Summary", type: "Attendance", date: "29 Oct", size: "640 KB" },
];

function ReportsPage() {
  return (
    <>
      <PageHeader
        eyebrow="School Director"
        title="Reports"
        description="Generate and download reports for the entire school, individual classes, subjects, or students."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4">
        <Card className="p-5">
          <div className="font-medium mb-4">Generate Report</div>
          <div className="space-y-3">
            <Field label="Report type">
              <Select options={["School Report", "Class Report", "Subject Report", "Student Report Card"]} />
            </Field>
            <Field label="Academic year">
              <Select options={[SCHOOL.academicYear, "2024/2025", "2023/2024"]} />
            </Field>
            <Field label="Term">
              <Select options={["Term 1", "Term 2", "Term 3"]} />
            </Field>
            <Field label="Class">
              <Select options={["All", ...CLASSES.map((c) => c.label)]} />
            </Field>
            <Field label="Subject">
              <Select options={["All", ...ALL_SUBJECTS.map((s) => s.name)]} />
            </Field>
            <button className="mt-2 w-full h-9 rounded-lg bg-gradient-hero text-white text-sm font-medium hover:opacity-90 transition">
              Generate report
            </button>
          </div>
        </Card>

        <Card>
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <div className="font-medium">Recent reports</div>
            <span className="text-[11px] text-muted-foreground">{RECENT.length} files</span>
          </div>
          <div>
            {RECENT.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-0 hover:bg-secondary/40 transition">
                <div className="h-9 w-9 rounded-md bg-secondary grid place-items-center">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{r.name}</div>
                  <div className="text-[11px] text-muted-foreground">{r.date} · {r.size}</div>
                </div>
                <StatusBadge>{r.type}</StatusBadge>
                <button className="h-8 w-8 grid place-items-center rounded-md hover:bg-secondary">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</span>
      {children}
    </label>
  );
}
function Select({ options }: { options: string[] }) {
  return (
    <select className="w-full h-9 px-3 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring/40">
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}
