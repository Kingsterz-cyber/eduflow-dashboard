import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, KpiCard, Card, LineChart, BarRow, StatusBadge } from "@/components/app/primitives";
import { ME_STUDENT, ANNOUNCEMENTS, PERFORMANCE_TREND } from "@/lib/eduflow-data";
import { Calendar, TrendingUp, Award, Megaphone } from "lucide-react";

export const Route = createFileRoute("/app/student/")({
  component: StudentDashboard,
});

function StudentDashboard() {
  return (
    <>
      <PageHeader
        eyebrow={`${ME_STUDENT.classId} · ${ME_STUDENT.studentId}`}
        title={`Welcome back, ${ME_STUDENT.name.split(" ")[0]}.`}
        description="Your academic journey at a glance."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Attendance" value={ME_STUDENT.attendance} decimals={1} suffix="%" delta={1.2} icon={<Calendar className="h-4 w-4" />} accent="success" />
        <KpiCard label="Average grade" value={ME_STUDENT.averageGrade} decimals={1} suffix="%" delta={2.1} icon={<TrendingUp className="h-4 w-4" />} accent="indigo" />
        <KpiCard label="Class rank" value={ME_STUDENT.rank} icon={<Award className="h-4 w-4" />} accent="violet" />
        <KpiCard label="Class size" value={ME_STUDENT.classSize} accent="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 p-5">
          <div className="text-xs text-muted-foreground">Academic progress</div>
          <div className="text-base font-medium mb-3">Last 12 weeks</div>
          <LineChart data={PERFORMANCE_TREND} height={200} gradientId="lg-stu" />
        </Card>
        <Card className="p-5">
          <div className="font-medium mb-3">Subject performance</div>
          <div className="space-y-2.5">
            {ME_STUDENT.subjects.map((s) => {
              const total = Math.round((s.cat1 + s.cat2 + s.exam) / 3);
              return <BarRow key={s.name} label={s.name} value={total} />;
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="font-medium mb-3">Recent results</div>
          <div className="space-y-2">
            {ME_STUDENT.subjects.slice(0, 4).map((s) => (
              <div key={s.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-[11px] text-muted-foreground">Exam · {s.teacher}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold tabular-nums">{s.exam}%</span>
                  <StatusBadge variant={s.grade === "A" ? "success" : "info"}>{s.grade}</StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium">Announcements</div>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {ANNOUNCEMENTS.slice(0, 3).map((a) => (
              <div key={a.id} className="pb-3 border-b border-border last:border-0 last:pb-0">
                <div className="text-sm font-medium">{a.title}</div>
                <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{a.body}</div>
                <div className="text-[11px] text-muted-foreground mt-1.5">{a.date}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
