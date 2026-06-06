import { createFileRoute } from "@tanstack/react-router";
import { Plus, UserPlus, FolderPlus, Megaphone, ArrowRight, Activity } from "lucide-react";
import { PageHeader, KpiCard, Card, LineChart, BarRow, Avatar, StatusBadge } from "@/components/app/primitives";
import {
  SCHOOL, APPROVALS, ACTIVITY, ANNOUNCEMENTS, PERFORMANCE_TREND, GROWTH_TREND, CLASSES,
} from "@/lib/eduflow-data";
import { GraduationCap, Users, Layers, Calendar, BookOpen, UserCheck } from "lucide-react";

export const Route = createFileRoute("/app/director/")({
  component: DirectorDashboard,
});

function DirectorDashboard() {
  return (
    <>
      <PageHeader
        eyebrow={`${SCHOOL.academicYear} · ${SCHOOL.term}`}
        title="Good morning, Principal."
        description={`Here's the live pulse of ${SCHOOL.name}. Everything is up to date.`}
        actions={
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-gradient-hero text-white text-sm font-medium shadow-card hover:opacity-90 transition">
            <Plus className="h-4 w-4" /> New
          </button>
        }
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
        <KpiCard label="Total Students" value={SCHOOL.totalStudents} delta={3.2} icon={<GraduationCap className="h-4 w-4" />} accent="indigo" />
        <KpiCard label="Total Teachers" value={SCHOOL.totalTeachers} delta={1.1} icon={<Users className="h-4 w-4" />} accent="violet" />
        <KpiCard label="Total Classes" value={SCHOOL.totalClasses} delta={0} icon={<Layers className="h-4 w-4" />} accent="cyan" />
        <KpiCard label="Attendance" value={96.4} decimals={1} suffix="%" delta={2.1} icon={<Calendar className="h-4 w-4" />} accent="success" />
        <KpiCard label="Avg Performance" value={82} suffix="%" delta={1.4} icon={<BookOpen className="h-4 w-4" />} accent="indigo" />
        <KpiCard label="Pending Approvals" value={APPROVALS.length} delta={-12} icon={<UserCheck className="h-4 w-4" />} accent="violet" />
      </div>

      {/* main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="text-xs text-muted-foreground">School Performance</div>
              <div className="text-base font-medium">Last 12 weeks · trending up</div>
            </div>
            <div className="flex gap-1 text-[11px]">
              {["W", "M", "Q", "Y"].map((t, i) => (
                <button key={t} className={`px-2 py-1 rounded-md ${i === 1 ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
              ))}
            </div>
          </div>
          <LineChart data={PERFORMANCE_TREND} height={200} />
        </Card>

        <Card className="p-5">
          <div className="text-xs text-muted-foreground mb-1">Student Growth</div>
          <div className="text-base font-medium mb-2">{GROWTH_TREND.at(-1)} enrolled</div>
          <LineChart data={GROWTH_TREND} height={120} color="var(--violet)" gradientId="lg-growth" />
          <div className="mt-3 text-[11px] text-muted-foreground">+{GROWTH_TREND.at(-1)! - GROWTH_TREND[0]} students this year</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Pending approvals */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium">Pending Approvals</div>
            <StatusBadge variant="warning">{APPROVALS.length}</StatusBadge>
          </div>
          <div className="space-y-2.5">
            {APPROVALS.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center gap-3">
                <Avatar initials={a.avatar} color={a.type === "teacher" ? "violet" : "indigo"} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{a.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{a.meta}</div>
                </div>
                <button className="text-[11px] px-2 py-1 rounded-md bg-foreground text-background font-medium hover:opacity-90">Approve</button>
              </div>
            ))}
          </div>
        </Card>

        {/* Activity feed */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium">Recent Activity</div>
            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {ACTIVITY.slice(0, 6).map((a, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1 text-sm leading-tight">
                  <span className="font-medium">{a.who}</span>{" "}
                  <span className="text-muted-foreground">{a.what}</span>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{a.when} ago</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Announcements */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium">Announcements</div>
            <Megaphone className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {ANNOUNCEMENTS.slice(0, 3).map((a) => (
              <div key={a.id} className="pb-3 border-b border-border last:border-0 last:pb-0">
                <div className="text-sm font-medium leading-tight">{a.title}</div>
                <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{a.body}</div>
                <div className="text-[11px] text-muted-foreground mt-1.5">{a.audience} · {a.date}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top performing classes */}
      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-medium">Class Performance Overview</div>
            <div className="text-xs text-muted-foreground">Top classes by average score</div>
          </div>
          <button className="text-[11px] text-muted-foreground inline-flex items-center gap-1 hover:text-foreground">
            View all classes <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5">
          {CLASSES.slice().sort((a, b) => b.avg - a.avg).slice(0, 8).map((c) => (
            <BarRow key={c.id} label={c.label} value={c.avg} />
          ))}
        </div>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Approve Users", icon: UserPlus, desc: `${APPROVALS.length} pending` },
          { label: "Create Class", icon: Layers, desc: "New academic class" },
          { label: "New Department", icon: FolderPlus, desc: "Set up subject group" },
          { label: "Announce", icon: Megaphone, desc: "Send to all staff" },
        ].map((q) => (
          <Card key={q.label} hover className="p-4 cursor-pointer group">
            <q.icon className="h-5 w-5 text-primary mb-3" />
            <div className="text-sm font-medium">{q.label}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{q.desc}</div>
            <ArrowRight className="h-3.5 w-3.5 mt-3 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition" />
          </Card>
        ))}
      </div>
    </>
  );
}
