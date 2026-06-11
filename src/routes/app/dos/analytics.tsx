import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader, Card, Heatmap, LineChart, BarRow } from "@/components/app/primitives";
import { getAttendanceHeatmap, getWeeklyTrends, getSubjectRankings, getGradeDistribution, getTeacherActivity } from "@/lib/dos.functions";

export const Route = createFileRoute("/app/dos/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const heatFn = useServerFn(getAttendanceHeatmap);
  const trendFn = useServerFn(getWeeklyTrends);
  const subjFn = useServerFn(getSubjectRankings);
  const gradeFn = useServerFn(getGradeDistribution);
  const teachFn = useServerFn(getTeacherActivity);

  const heat = useQuery({ queryKey: ["dos", "heat"], queryFn: () => heatFn() });
  const trends = useQuery({ queryKey: ["dos", "trends"], queryFn: () => trendFn() });
  const subjects = useQuery({ queryKey: ["dos", "subjects"], queryFn: () => subjFn() });
  const grades = useQuery({ queryKey: ["dos", "grades"], queryFn: () => gradeFn() });
  const teachers = useQuery({ queryKey: ["dos", "teachers"], queryFn: () => teachFn() });

  const gradeRows = grades.data?.grades ?? [];
  const gradeTotal = grades.data?.total ?? 0;

  return (
    <>
      <PageHeader eyebrow="DOS" title="Academic Analytics" description="Deep-dive analytics across attendance, performance, and teacher activity." />

      <Card className="p-5 mb-4">
        <div className="font-medium mb-3">Attendance Heatmap · 52 weeks</div>
        {heat.data ? <Heatmap data={heat.data} /> : <div className="h-24 grid place-items-center text-xs text-muted-foreground">Loading…</div>}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card className="p-5">
          <div className="text-xs text-muted-foreground">Attendance trend</div>
          <div className="text-base font-medium mb-3">12 weeks</div>
          {trends.data ? <LineChart data={trends.data.attendanceTrend} height={180} color="var(--cyan)" gradientId="lg-a-att" /> : null}
        </Card>
        <Card className="p-5">
          <div className="text-xs text-muted-foreground">Performance trend</div>
          <div className="text-base font-medium mb-3">12 weeks</div>
          {trends.data ? <LineChart data={trends.data.performanceTrend} height={180} color="var(--violet)" gradientId="lg-a-perf" /> : null}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="p-5 lg:col-span-2">
          <div className="font-medium mb-3">Subject performance</div>
          {(subjects.data ?? []).length === 0 && <div className="text-xs text-muted-foreground">No subjects yet.</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5">
            {(subjects.data ?? []).slice(0, 12).map((s) => (
              <BarRow key={s.id} label={s.name} value={s.average} />
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="font-medium mb-3">Grade distribution</div>
          {gradeRows.length === 0 && <div className="text-xs text-muted-foreground">No marks yet.</div>}
          <div className="space-y-2.5">
            {gradeRows.map((g) => (
              <div key={g.grade} className="flex items-center gap-3">
                <div className="w-10 text-sm font-semibold">{g.grade}</div>
                <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-gradient-hero" style={{ width: `${gradeTotal ? (g.count / gradeTotal) * 100 : 0}%` }} />
                </div>
                <div className="text-[11px] text-muted-foreground tabular-nums w-10 text-right">{g.count}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border text-[11px] text-muted-foreground">
            {gradeTotal.toLocaleString()} graded entries
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="font-medium mb-3">Teacher activity rankings</div>
        {(teachers.data ?? []).length === 0 && <div className="text-xs text-muted-foreground">No teachers yet.</div>}
        <div className="space-y-2">
          {(teachers.data ?? []).slice(0, 12).map((t, i) => (
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
