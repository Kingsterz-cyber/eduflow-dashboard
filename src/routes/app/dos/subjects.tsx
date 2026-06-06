import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Sparkline, StatusBadge } from "@/components/app/primitives";
import { DEPARTMENTS, SUBJECT_METRICS } from "@/lib/eduflow-data";

export const Route = createFileRoute("/app/dos/subjects")({
  component: SubjectsPage,
});

function SubjectsPage() {
  return (
    <>
      <PageHeader eyebrow="DOS" title="Subjects" description="Subjects grouped by department, with live performance metrics." />

      <div className="space-y-5">
        {DEPARTMENTS.map((d) => {
          const subjects = SUBJECT_METRICS.filter((s) => s.departmentId === d.id);
          return (
            <section key={d.id}>
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <h2 className="text-lg font-display font-semibold">{d.name}</h2>
                  <div className="text-xs text-muted-foreground">{subjects.length} subjects</div>
                </div>
                <StatusBadge variant="info">Avg {Math.round(subjects.reduce((a, b) => a + b.average, 0) / subjects.length)}%</StatusBadge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {subjects.map((s) => (
                  <Card key={s.name} hover className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{s.name}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{s.teachers} teachers · {s.classes} classes</div>
                      </div>
                      <Sparkline data={s.trend} />
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
