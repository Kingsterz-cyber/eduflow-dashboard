import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader, Card, Avatar, StatusBadge } from "@/components/app/primitives";
import { getTeacherActivity } from "@/lib/dos.functions";

export const Route = createFileRoute("/app/dos/teachers")({
  component: TeacherPerformancePage,
});

function TeacherPerformancePage() {
  const fn = useServerFn(getTeacherActivity);
  const teachers = useQuery({ queryKey: ["dos", "teachers"], queryFn: () => fn() });
  const rows = teachers.data ?? [];

  return (
    <>
      <PageHeader eyebrow="DOS" title="Teacher Performance" description="Track activity, marks submission, attendance entry, and class load (last 30 days)." />
      <Card>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-surface/40">
            {["Teacher", "Classes / Subjects", "Marks 30d", "Attendance 30d", "Activity", "Status"].map((h) => <th key={h} className="text-left text-[11px] uppercase tracking-wider text-muted-foreground font-medium px-4 py-2.5">{h}</th>)}
          </tr></thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No teachers yet.</td></tr>
            )}
            {rows.map((t, i) => {
              const initials = t.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
              return (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="text-[10px] text-muted-foreground w-5 text-right tabular-nums">#{i + 1}</div>
                      <Avatar initials={initials} color="violet" size="sm" />
                      <div>
                        <div className="font-medium flex items-center gap-1.5">{t.name}{t.isClassTeacher && <StatusBadge variant="info">Class teacher</StatusBadge>}</div>
                        <div className="text-[11px] text-muted-foreground">{t.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{t.classes} classes · {t.subjects} subjects</td>
                  <td className="px-4 py-3 tabular-nums">{t.marks30d}</td>
                  <td className="px-4 py-3 tabular-nums">{t.attendance30d}</td>
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
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}
