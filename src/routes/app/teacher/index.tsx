import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, KpiCard, Card, Avatar, StatusBadge } from "@/components/app/primitives";
import { ASSESSMENTS, ACTIVITY, CLASSES } from "@/lib/eduflow-data";
import { Layers, BookOpen, Calendar, ClipboardCheck, ArrowRight, Clock } from "lucide-react";

export const Route = createFileRoute("/app/teacher/")({
  component: TeacherDashboard,
});

const TODAYS_CLASSES = [
  { time: "08:00", class: "S2A", subject: "Mathematics", room: "Room 12" },
  { time: "10:30", class: "S3B", subject: "Mathematics", room: "Room 12" },
  { time: "13:00", class: "S2A", subject: "Mathematics", room: "Room 12" },
  { time: "15:00", class: "S4A", subject: "Mathematics — A-Level", room: "Lab 3" },
];

function TeacherDashboard() {
  return (
    <>
      <PageHeader
        eyebrow="Teacher"
        title="Good morning, Mr. John."
        description="Here's your day. You have 4 classes and 2 assessments waiting for grading."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Assigned classes" value={4} icon={<Layers className="h-4 w-4" />} accent="indigo" />
        <KpiCard label="Subjects" value={2} icon={<BookOpen className="h-4 w-4" />} accent="violet" />
        <KpiCard label="Attendance submitted" value={87} suffix="%" delta={4.2} icon={<Calendar className="h-4 w-4" />} accent="success" />
        <KpiCard label="Marks submitted" value={92} suffix="%" delta={1.1} icon={<ClipboardCheck className="h-4 w-4" />} accent="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium">Today's classes</div>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            {TODAYS_CLASSES.map((c, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-border hover:border-foreground/20 hover:bg-secondary/40 transition">
                <div className="text-sm font-display font-semibold tabular-nums w-14">{c.time}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{c.subject} · {c.class}</div>
                  <div className="text-[11px] text-muted-foreground">{c.room}</div>
                </div>
                <StatusBadge variant={i === 0 ? "info" : "neutral"}>{i === 0 ? "Next" : "Upcoming"}</StatusBadge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="font-medium mb-3">Pending assessments</div>
          <div className="space-y-3">
            {ASSESSMENTS.filter((a) => a.status === "open").map((a) => (
              <div key={a.id} className="pb-3 border-b border-border last:border-0 last:pb-0">
                <div className="text-sm font-medium">{a.title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{a.classLabel} · due {a.due}</div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-gradient-hero" style={{ width: `${(a.submissions / a.total) * 100}%` }} />
                  </div>
                  <span className="text-[11px] text-muted-foreground tabular-nums">{a.submissions}/{a.total}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="font-medium mb-3">My classes</div>
          <div className="grid grid-cols-2 gap-2.5">
            {["S2A", "S3B", "S4A", "S2B"].map((id) => {
              const c = CLASSES.find((x) => x.id === id) || CLASSES[0];
              return (
                <Link key={id} to="/app/teacher/classes" className="p-3 rounded-lg border border-border hover:border-foreground/20 hover:bg-secondary/40 transition">
                  <div className="font-medium text-sm">{c.label}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{c.students} students · {c.avg}% avg</div>
                  <ArrowRight className="h-3 w-3 mt-2 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <div className="font-medium mb-3">Recent student activity</div>
          <div className="space-y-3">
            {ACTIVITY.slice(0, 5).map((a, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <Avatar initials={a.who.split(" ").map((w) => w[0]).slice(0, 2).join("")} color="indigo" size="sm" />
                <div className="flex-1 text-sm leading-tight">
                  <span className="font-medium">{a.who}</span>{" "}
                  <span className="text-muted-foreground">{a.what}</span>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{a.when} ago</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
