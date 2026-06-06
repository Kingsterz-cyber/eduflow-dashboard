import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, StatusBadge, Sparkline } from "@/components/app/primitives";
import { ME_STUDENT, makeSeries } from "@/lib/eduflow-data";

export const Route = createFileRoute("/app/student/subjects")({
  component: SubjectsPage,
});

function SubjectsPage() {
  return (
    <>
      <PageHeader eyebrow="Student" title="My Subjects" description={`${ME_STUDENT.subjects.length} subjects · ${ME_STUDENT.classId}`} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ME_STUDENT.subjects.map((s) => {
          const avg = Math.round((s.cat1 + s.cat2 + s.exam) / 3);
          return (
            <Card key={s.name} hover className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Teacher: {s.teacher}</div>
                </div>
                <Sparkline data={makeSeries(8, avg, 6)} />
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="text-2xl font-display font-semibold tabular-nums">{avg}<span className="text-sm font-normal text-muted-foreground">%</span></div>
                  <div className="text-[11px] text-muted-foreground">Average</div>
                </div>
                <StatusBadge variant={s.grade === "A" ? "success" : s.grade.startsWith("B") ? "info" : "warning"}>{s.grade}</StatusBadge>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
