import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Avatar, StatusBadge } from "@/components/app/primitives";
import { STAFF } from "@/lib/eduflow-data";

export const Route = createFileRoute("/app/dos/teachers")({
  component: TeacherPerformancePage,
});

function TeacherPerformancePage() {
  const teachers = STAFF.filter((s) => s.role === "Teacher").slice().sort((a, b) => b.activity - a.activity);
  return (
    <>
      <PageHeader eyebrow="DOS" title="Teacher Performance" description="Track activity, marks submission, attendance entry, and class load." />
      <Card>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-surface/40">
            {["Teacher", "Department", "Classes", "Activity score", "Status"].map((h) => <th key={h} className="text-left text-[11px] uppercase tracking-wider text-muted-foreground font-medium px-4 py-2.5">{h}</th>)}
          </tr></thead>
          <tbody>
            {teachers.map((t, i) => (
              <tr key={t.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="text-[10px] text-muted-foreground w-5 text-right tabular-nums">#{i + 1}</div>
                    <Avatar initials={t.avatar} color="violet" size="sm" />
                    <div>
                      <div className="font-medium">{t.name}</div>
                      <div className="text-[11px] text-muted-foreground">{t.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{t.department}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{t.classes.join(", ") || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-gradient-hero" style={{ width: `${t.activity}%` }} />
                    </div>
                    <span className="text-[11px] tabular-nums">{t.activity}</span>
                  </div>
                </td>
                <td className="px-4 py-3"><StatusBadge variant={t.status === "active" ? "success" : "neutral"}>{t.status}</StatusBadge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
