import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Clock4, X } from "lucide-react";
import { PageHeader, Card, Avatar, StatusBadge } from "@/components/app/primitives";
import { CLASSES, STUDENTS } from "@/lib/eduflow-data";

export const Route = createFileRoute("/app/teacher/attendance")({
  component: AttendancePage,
});

type State = "present" | "absent" | "late";

function AttendancePage() {
  const cls = CLASSES.find((c) => c.id === "S2A")!;
  const roster = STUDENTS.filter((s) => s.classId === cls.id);
  const [state, setState] = useState<Record<string, State>>(() =>
    Object.fromEntries(roster.map((s) => [s.id, "present"])),
  );
  const counts = { present: 0, absent: 0, late: 0 };
  Object.values(state).forEach((v) => counts[v]++);

  return (
    <>
      <PageHeader
        eyebrow="Teacher"
        title="Record attendance"
        description={`${cls.label} · Mathematics · Today, ${new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" })}`}
        actions={
          <button className="h-9 px-4 rounded-lg bg-gradient-hero text-white text-sm font-medium hover:opacity-90">Submit</button>
        }
      />

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card className="p-4"><div className="text-xs text-muted-foreground">Present</div><div className="text-2xl font-display font-semibold text-success">{counts.present}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">Late</div><div className="text-2xl font-display font-semibold">{counts.late}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">Absent</div><div className="text-2xl font-display font-semibold text-destructive">{counts.absent}</div></Card>
      </div>

      <Card>
        {roster.map((s) => (
          <div key={s.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-border last:border-0">
            <Avatar initials={s.avatar} color="indigo" size="sm" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{s.name}</div>
              <div className="text-[11px] text-muted-foreground">{s.id}</div>
            </div>
            <div className="inline-flex items-center gap-1 p-0.5 rounded-lg border border-border bg-secondary/40">
              {(["present", "late", "absent"] as State[]).map((opt) => {
                const active = state[s.id] === opt;
                const Icon = opt === "present" ? Check : opt === "late" ? Clock4 : X;
                const tone = active
                  ? opt === "present" ? "bg-success text-success-foreground" : opt === "late" ? "bg-foreground text-background" : "bg-destructive text-destructive-foreground"
                  : "text-muted-foreground hover:text-foreground";
                return (
                  <button key={opt} onClick={() => setState((p) => ({ ...p, [s.id]: opt }))} className={`h-7 w-7 grid place-items-center rounded-md transition ${tone}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </Card>

      <Card className="mt-6 p-5">
        <div className="font-medium mb-3">Recent submissions</div>
        <div className="space-y-2">
          {[
            { date: "Yesterday", cls: "S2A", rate: 96 },
            { date: "2 days ago", cls: "S3B", rate: 92 },
            { date: "3 days ago", cls: "S2A", rate: 94 },
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
              <span>{r.date} · {r.cls}</span>
              <StatusBadge variant="success">{r.rate}% present</StatusBadge>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
