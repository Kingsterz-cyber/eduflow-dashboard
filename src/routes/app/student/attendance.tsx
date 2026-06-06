import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, KpiCard, Card, Heatmap, LineChart } from "@/components/app/primitives";
import { ATTENDANCE_HEATMAP, ATTENDANCE_TREND, ME_STUDENT } from "@/lib/eduflow-data";
import { Calendar, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/app/student/attendance")({
  component: MyAttendancePage,
});

function MyAttendancePage() {
  const history = [
    { date: "Today", state: "present" },
    { date: "Yesterday", state: "present" },
    { date: "Mon", state: "present" },
    { date: "Fri", state: "late" },
    { date: "Thu", state: "present" },
    { date: "Wed", state: "absent" },
    { date: "Tue", state: "present" },
  ];
  return (
    <>
      <PageHeader eyebrow="Student" title="My Attendance" description={`${ME_STUDENT.attendance}% this term · ${ME_STUDENT.classId}`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KpiCard label="Rate" value={ME_STUDENT.attendance} decimals={1} suffix="%" icon={<Calendar className="h-4 w-4" />} accent="success" />
        <KpiCard label="Present" value={88} icon={<CheckCircle2 className="h-4 w-4" />} accent="indigo" />
        <KpiCard label="Late" value={4} accent="cyan" />
        <KpiCard label="Absent" value={3} icon={<XCircle className="h-4 w-4" />} accent="violet" />
      </div>

      <Card className="p-5 mb-4">
        <div className="font-medium mb-3">My attendance heatmap · 52 weeks</div>
        <Heatmap data={ATTENDANCE_HEATMAP} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="font-medium mb-3">Trend</div>
          <LineChart data={ATTENDANCE_TREND} height={180} color="var(--cyan)" gradientId="lg-stu-att" />
        </Card>
        <Card className="p-5">
          <div className="font-medium mb-3">Recent days</div>
          <div className="space-y-2">
            {history.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                <span>{d.date}</span>
                <span className={`text-xs font-medium ${d.state === "present" ? "text-success" : d.state === "late" ? "text-foreground" : "text-destructive"}`}>
                  {d.state}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
