import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader, Card, Sparkline, StatusBadge } from "@/components/app/primitives";
import { getSubjectRankings } from "@/lib/dos.functions";

export const Route = createFileRoute("/app/dos/subjects")({
  component: SubjectsPage,
});

function SubjectsPage() {
  const fn = useServerFn(getSubjectRankings);
  const subjects = useQuery({ queryKey: ["dos", "subjects"], queryFn: () => fn() });

  const groups = new Map<string, typeof subjects.data>();
  (subjects.data ?? []).forEach((s) => {
    const k = s.department || "Other";
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(s);
  });

  return (
    <>
      <PageHeader eyebrow="DOS" title="Subjects" description="Subjects grouped by department, with live performance metrics." />

      {(subjects.data ?? []).length === 0 && (
        <Card className="p-8 text-center text-sm text-muted-foreground">No subjects yet. Set them up under School Setup.</Card>
      )}

      <div className="space-y-5">
        {Array.from(groups.entries()).map(([dept, subs]) => {
          const arr = subs ?? [];
          const avg = arr.length ? Math.round(arr.reduce((a, b) => a + b.average, 0) / arr.length) : 0;
          return (
            <section key={dept}>
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <h2 className="text-lg font-display font-semibold">{dept}</h2>
                  <div className="text-xs text-muted-foreground">{arr.length} subjects</div>
                </div>
                <StatusBadge variant="info">Avg {avg}%</StatusBadge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {arr.map((s) => (
                  <Card key={s.id} hover className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{s.name}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{s.teachers} teachers · {s.classes} classes</div>
                      </div>
                      <Sparkline data={[s.average - 4, s.average - 2, s.average + 1, s.average, s.average + 3]} />
                    </div>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <div className="text-2xl font-display font-semibold tabular-nums">{s.average}<span className="text-sm font-normal text-muted-foreground">%</span></div>
                        <div className="text-[11px] text-muted-foreground">Average score</div>
                      </div>
                      <StatusBadge variant={s.passRate >= 85 ? "success" : s.passRate >= 70 ? "info" : "warning"}>
                        {s.passRate}% pass
                      </StatusBadge>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
