import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useMemo } from "react";
import { PageHeader, Card, KpiCard, BarRow, Avatar, StatusBadge } from "@/components/app/primitives";
import { getClassRankings, getClassDetail } from "@/lib/dos.functions";
import { GraduationCap, Calendar, BookOpen, ChevronRight, Search } from "lucide-react";

export const Route = createFileRoute("/app/dos/classes")({
  component: ClassesPage,
});

const TABS = ["Overview", "Students", "Marks"] as const;

function ClassesPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [q, setQ] = useState("");

  const listFn = useServerFn(getClassRankings);
  const detailFn = useServerFn(getClassDetail);

  const list = useQuery({ queryKey: ["dos", "classes"], queryFn: () => listFn() });
  const detail = useQuery({
    queryKey: ["dos", "class", selected],
    queryFn: () => detailFn({ data: { classId: selected! } }),
    enabled: !!selected,
  });

  const classes = list.data ?? [];
  const activeId = selected ?? classes[0]?.id ?? null;
  if (!selected && activeId) setSelected(activeId);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof classes>();
    classes.forEach((c) => {
      const k = c.division || c.level || "Other";
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(c);
    });
    return map;
  }, [classes]);

  const cls = detail.data;
  const filteredStudents = (cls?.students ?? []).filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader eyebrow="DOS" title="Classes" description="Drill into each class for academic, attendance, and performance details." />

      {classes.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">No classes yet. Configure them under School Setup.</Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
          <Card className="p-3 self-start lg:sticky lg:top-20">
            {Array.from(grouped.entries()).map(([group, items]) => (
              <div key={group} className="mb-3 last:mb-0">
                <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{group}</div>
                {items.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c.id)}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition ${
                      activeId === c.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3" />{c.name}</span>
                    <span className="text-[10px] tabular-nums">{c.students}</span>
                  </button>
                ))}
              </div>
            ))}
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">{cls?.level}</div>
                <h2 className="text-xl font-display font-semibold">{cls?.name ?? "—"}</h2>
              </div>
              <div className="inline-flex p-0.5 rounded-lg bg-secondary/60 border border-border overflow-x-auto">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3 h-7 text-xs rounded-md whitespace-nowrap ${tab === t ? "bg-card shadow-sm" : "text-muted-foreground"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {tab === "Overview" && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KpiCard label="Students" value={cls?.students.length ?? 0} icon={<GraduationCap className="h-4 w-4" />} />
                <KpiCard label="Attendance" value={cls?.attendanceRate ?? 0} decimals={1} suffix="%" icon={<Calendar className="h-4 w-4" />} accent="success" />
                <KpiCard label="Avg score" value={cls?.avgScore ?? 0} decimals={1} suffix="%" icon={<BookOpen className="h-4 w-4" />} accent="violet" />
                <KpiCard label="Subjects" value={cls?.subjectAverages.length ?? 0} accent="cyan" />
              </div>
            )}

            {tab === "Students" && (
              <Card>
                <div className="p-3 border-b border-border flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search students…" className="flex-1 bg-transparent text-sm outline-none" />
                </div>
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-surface/40">
                    {["Student", "Attendance", "Avg", "Status"].map((h) => <th key={h} className="text-left text-[11px] uppercase tracking-wider text-muted-foreground px-4 py-2.5">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {filteredStudents.length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">No students.</td></tr>
                    )}
                    {filteredStudents.map((s) => {
                      const initials = s.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
                      return (
                        <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                          <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Avatar initials={initials} color="indigo" size="sm" /><span className="font-medium">{s.name}</span></div></td>
                          <td className="px-4 py-3 tabular-nums">{s.attendance}%</td>
                          <td className="px-4 py-3 tabular-nums">{s.average}%</td>
                          <td className="px-4 py-3"><StatusBadge variant={s.status === "honors" ? "success" : s.status === "at-risk" ? "danger" : "neutral"}>{s.status}</StatusBadge></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            )}

            {tab === "Marks" && (
              <Card className="p-5">
                <div className="font-medium mb-3">Subject averages</div>
                {(cls?.subjectAverages ?? []).length === 0 && <div className="text-xs text-muted-foreground">No marks recorded for this class.</div>}
                <div className="space-y-2.5">
                  {(cls?.subjectAverages ?? []).map((s) => <BarRow key={s.name} label={s.name} value={s.value} />)}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </>
  );
}
