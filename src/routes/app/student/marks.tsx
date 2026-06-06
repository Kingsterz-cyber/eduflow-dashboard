import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, StatusBadge, LineChart } from "@/components/app/primitives";
import { ME_STUDENT, makeSeries } from "@/lib/eduflow-data";

export const Route = createFileRoute("/app/student/marks")({
  component: MyMarksPage,
});

function MyMarksPage() {
  return (
    <>
      <PageHeader eyebrow="Student" title="My Marks" description="Marks per subject. Total and grade auto-calculate." />

      <Card className="p-5 mb-4">
        <div className="font-medium mb-3">Performance trend</div>
        <LineChart data={makeSeries(12, 78, 5)} height={180} gradientId="lg-marks" />
      </Card>

      <div className="space-y-3">
        {ME_STUDENT.subjects.map((s) => {
          const total = s.cat1 + s.cat2 + s.exam;
          return (
            <Card key={s.name} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-[11px] text-muted-foreground">Teacher: {s.teacher}</div>
                </div>
                <StatusBadge variant={s.grade === "A" ? "success" : "info"}>Grade {s.grade}</StatusBadge>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border">
                  {["Assessment", "Score", "Out of"].map((h) => <th key={h} className="text-left text-[11px] uppercase tracking-wider text-muted-foreground py-2">{h}</th>)}
                </tr></thead>
                <tbody>
                  {[
                    { name: "CAT 1", score: s.cat1, max: 100 },
                    { name: "CAT 2", score: s.cat2, max: 100 },
                    { name: "Exam", score: s.exam, max: 100 },
                  ].map((r) => (
                    <tr key={r.name} className="border-b border-border last:border-0">
                      <td className="py-2">{r.name}</td>
                      <td className="py-2 tabular-nums font-medium">{r.score}</td>
                      <td className="py-2 tabular-nums text-muted-foreground">{r.max}</td>
                    </tr>
                  ))}
                  <tr className="bg-secondary/40">
                    <td className="py-2 font-semibold">Total / Average</td>
                    <td className="py-2 font-semibold tabular-nums">{Math.round(total / 3)}</td>
                    <td className="py-2 text-muted-foreground">100</td>
                  </tr>
                </tbody>
              </table>
            </Card>
          );
        })}
      </div>
    </>
  );
}
