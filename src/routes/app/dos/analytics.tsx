import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Heatmap, LineChart, BarRow } from "@/components/app/primitives";
import { ATTENDANCE_HEATMAP, ATTENDANCE_TREND, PERFORMANCE_TREND, CLASSES, SUBJECT_METRICS, STAFF } from "@/lib/eduflow-data";

export const Route = createFileRoute("/app/dos/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const grades = [
    { g: "A", count: 184 },
    { g: "B+", count: 226 },
    { g: "B", count: 312 },
    { g: "C", count: 408 },
    { g: "F", count: 154 },
  ];
  const total = grades.reduce((a, b) => a + b.count, 0);

  return (
    <>
      <PageHeader eyebrow="DOS" title="Academic Analytics" description="Deep-dive analytics across attendance, performance, and teacher activity." />

      <Card className="p-5 mb-4">
        <div className="font-medium mb-3">Attendance Heatmap · 52 weeks</div>
        <Heatmap data={ATTENDANCE_HEATMAP} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card className="p-5">
          <div className="text-xs text-muted-foreground">Attendance trend</div>
          <div className="text-base font-medium mb-3">12 weeks</div>
          <LineChart data={ATTENDANCE_TREND} height={180} color="var(--cyan)" gradientId="lg-a-att" />
        </Card>
        <Card className="p-5">
          <div className="text-xs text-muted-foreground">Performance trend</div>
          <div className="text-base font-medium mb-3">12 weeks</div>
          <LineChart data={PERFORMANCE_TREND} height={180} color="var(--violet)" gradientId="lg-a-perf" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="p-5 lg:col-span-2">
          <div className="font-medium mb-3">Subject performance</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5">
            {SUBJECT_METRICS.slice(0, 12).map((s) => (
              <BarRow key={s.name} label={s.name} value={s.average} />
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="font-medium mb-3">Grade distribution</div>
          <div className="space-y-2.5">
            {grades.map((g) => (
              <div key={g.g} className="flex items-center gap-3">
                <div className="w-8 text-sm font-semibold">{g.g}</div>
                <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-gradient-hero" style={{ width: `${(g.count / total) * 100}%` }} />
                </div>
                <div className="text-[11px] text-muted-foreground tabular-nums w-10 text-right">{g.count}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border text-[11px] text-muted-foreground">
            {total.toLocaleString()} graded entries this term
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="font-medium mb-3">Teacher activity rankings</div>
        <div className="space-y-2">
          {STAFF.filter((s) => s.role === "Teacher").slice().sort((a, b) => b.activity - a.activity).slice(0, 8).map((t, i) => (
            <div key={t.id} className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-md bg-secondary grid place-items-center text-[10px] font-semibold">{i + 1}</div>
              <div className="flex-1 min-w-0 flex items-center gap-2.5">
                <div className="text-sm font-medium w-40 truncate">{t.name}</div>
                <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-gradient-hero" style={{ width: `${t.activity}%` }} />
                </div>
                <div className="text-[11px] text-muted-foreground w-10 text-right tabular-nums">{t.activity}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
