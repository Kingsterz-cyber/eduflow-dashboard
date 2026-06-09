import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Plus, UserPlus, FolderPlus, Megaphone, ArrowRight, Activity } from "lucide-react";
import { PageHeader, KpiCard, Card, LineChart, StatusBadge } from "@/components/app/primitives";
import { GraduationCap, Users, Layers, Calendar, BookOpen, UserCheck } from "lucide-react";
import { getDirectorKpis, listPendingApprovals, listRecentActivity, listAnnouncements, getStudentGrowth } from "@/lib/director.functions";
import { useMe } from "@/hooks/use-me";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app/director/")({
  component: DirectorDashboard,
});

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function DirectorDashboard() {
  const me = useMe();
  const kpisFn = useServerFn(getDirectorKpis);
  const apprFn = useServerFn(listPendingApprovals);
  const actFn = useServerFn(listRecentActivity);
  const annFn = useServerFn(listAnnouncements);
  const growthFn = useServerFn(getStudentGrowth);

  const kpis = useQuery({ queryKey: ["director", "kpis"], queryFn: () => kpisFn() });
  const appr = useQuery({ queryKey: ["director", "approvals"], queryFn: () => apprFn() });
  const act = useQuery({ queryKey: ["director", "activity"], queryFn: () => actFn() });
  const ann = useQuery({ queryKey: ["director", "announcements"], queryFn: () => annFn() });
  const growth = useQuery({ queryKey: ["director", "growth"], queryFn: () => growthFn() });

  // Realtime invalidation
  useEffect(() => {
    if (!me.school?.id) return;
    const ch = supabase
      .channel(`director-${me.school.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        appr.refetch(); kpis.refetch();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, () => ann.refetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance" }, () => kpis.refetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "marks" }, () => kpis.refetch())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me.school?.id]);

  const k = kpis.data;
  const pendingTotal = (appr.data?.teachers.length ?? 0) + (appr.data?.students.length ?? 0);
  const growthSeries = growth.data?.series ?? [];

  return (
    <>
      <PageHeader
        eyebrow={me.school?.name ?? "School"}
        title={`Good day${me.profile?.full_name ? `, ${me.profile.full_name.split(" ")[0]}` : ""}.`}
        description="Live pulse of your school. Everything is up to date."
        actions={
          <Link to="/app/director/announcements" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-gradient-hero text-white text-sm font-medium shadow-card hover:opacity-90 transition">
            <Plus className="h-4 w-4" /> Announce
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
        <KpiCard label="Total Students" value={k?.totalStudents ?? 0} icon={<GraduationCap className="h-4 w-4" />} accent="indigo" />
        <KpiCard label="Total Teachers" value={k?.totalTeachers ?? 0} icon={<Users className="h-4 w-4" />} accent="violet" />
        <KpiCard label="Total Classes" value={k?.totalClasses ?? 0} icon={<Layers className="h-4 w-4" />} accent="cyan" />
        <KpiCard label="Attendance" value={k?.attendanceRate ?? 0} decimals={1} suffix="%" icon={<Calendar className="h-4 w-4" />} accent="success" />
        <KpiCard label="Avg Performance" value={k?.avgPerformance ?? 0} decimals={1} suffix="%" icon={<BookOpen className="h-4 w-4" />} accent="indigo" />
        <KpiCard label="Pending Approvals" value={pendingTotal} icon={<UserCheck className="h-4 w-4" />} accent="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 p-5">
          <div className="text-xs text-muted-foreground">Student Growth</div>
          <div className="text-base font-medium mb-2">{growthSeries.at(-1) ?? 0} total enrolled</div>
          {growthSeries.length > 1 ? (
            <LineChart data={growthSeries} height={200} gradientId="lg-growth" />
          ) : (
            <EmptyChart label="Not enough data yet" />
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium">Pending Approvals</div>
            <StatusBadge variant="warning">{pendingTotal}</StatusBadge>
          </div>
          {appr.isLoading ? (
            <SkeletonRows />
          ) : pendingTotal === 0 ? (
            <EmptyBlock label="All caught up" />
          ) : (
            <div className="space-y-2.5">
              {[...(appr.data?.teachers ?? []), ...(appr.data?.students ?? [])].slice(0, 6).map((a) => (
                <Link key={a.id} to="/app/director/approvals" className="flex items-center gap-3 group">
                  <div className="h-8 w-8 rounded-full bg-gradient-hero text-white grid place-items-center text-[11px] font-semibold">
                    {(a.full_name || a.email).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{a.full_name || a.email}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{a.email}</div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium">Recent Activity</div>
            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          {act.isLoading ? <SkeletonRows /> : (act.data?.items.length ?? 0) === 0 ? <EmptyBlock label="No activity yet" /> : (
            <div className="space-y-3">
              {act.data!.items.slice(0, 8).map((a) => (
                <div key={a.id} className="flex items-start gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="flex-1 text-sm leading-tight">
                    <span className="text-muted-foreground">{a.description}</span>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{timeAgo(a.created_at)} ago</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium">Announcements</div>
            <Megaphone className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          {ann.isLoading ? <SkeletonRows /> : (ann.data?.items.length ?? 0) === 0 ? <EmptyBlock label="No announcements yet" /> : (
            <div className="space-y-3">
              {ann.data!.items.slice(0, 4).map((a) => (
                <div key={a.id} className="pb-3 border-b border-border last:border-0 last:pb-0">
                  <div className="text-sm font-medium leading-tight">{a.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{a.body}</div>
                  <div className="text-[11px] text-muted-foreground mt-1.5">{new Date(a.published_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Approvals", icon: UserPlus, desc: `${pendingTotal} pending`, to: "/app/director/approvals" },
          { label: "Students", icon: GraduationCap, desc: `${k?.totalStudents ?? 0} enrolled`, to: "/app/director/students" },
          { label: "Staff", icon: Users, desc: `${k?.totalTeachers ?? 0} teachers`, to: "/app/director/staff" },
          { label: "Announce", icon: Megaphone, desc: "Send to staff", to: "/app/director/announcements" },
        ].map((q) => (
          <Link key={q.label} to={q.to as never}>
            <Card hover className="p-4 cursor-pointer group">
              <q.icon className="h-5 w-5 text-primary mb-3" />
              <div className="text-sm font-medium">{q.label}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{q.desc}</div>
              <ArrowRight className="h-3.5 w-3.5 mt-3 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition" />
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-2.5">
      {[0, 1, 2].map((i) => <div key={i} className="h-8 rounded-md bg-secondary/60 animate-pulse" />)}
    </div>
  );
}

function EmptyBlock({ label }: { label: string }) {
  return <div className="text-xs text-muted-foreground py-6 text-center">{label}</div>;
}

function EmptyChart({ label }: { label: string }) {
  return <div className="h-[200px] grid place-items-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">{label}</div>;
}

// FolderPlus is imported but not used in final markup; keep tree-shake friendly.
void FolderPlus;
