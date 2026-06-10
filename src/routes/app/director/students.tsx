import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronRight } from "lucide-react";
import { PageHeader, Card, Avatar, StatusBadge, KpiCard } from "@/components/app/primitives";
import { GraduationCap, Users, BookOpen } from "lucide-react";
import { listSchoolStudents, getSchoolSetup } from "@/lib/director.functions";

export const Route = createFileRoute("/app/director/students")({
  component: StudentsPage,
});

function StudentsPage() {
  const fetchStudents = useServerFn(listSchoolStudents);
  const fetchSetup = useServerFn(getSchoolSetup);
  const studentsQ = useQuery({ queryKey: ["director", "students"], queryFn: () => fetchStudents() });
  const setupQ = useQuery({ queryKey: ["director", "setup"], queryFn: () => fetchSetup() });

  const students = studentsQ.data?.items ?? [];
  const classes = setupQ.data?.classes ?? [];
  const levels = setupQ.data?.levels ?? [];

  const [selectedClass, setSelectedClass] = useState<string | "all">("all");

  const grouped = useMemo(() => {
    const byLevel = new Map<string, typeof classes>();
    levels.forEach((l) => byLevel.set(l.id, []));
    classes.forEach((c) => {
      const arr = byLevel.get(c.level_id);
      if (arr) arr.push(c);
    });
    return levels.map((l) => ({ level: l, items: byLevel.get(l.id) ?? [] }));
  }, [classes, levels]);

  const filtered = selectedClass === "all" ? students : students.filter((s) => s.class_id === selectedClass);

  return (
    <>
      <PageHeader
        eyebrow="School Director"
        title="Students"
        description="Browse every student in your school, filtered by class."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
        <Card className="p-3 self-start lg:sticky lg:top-20">
          <button
            onClick={() => setSelectedClass("all")}
            className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition ${
              selectedClass === "all" ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60"
            }`}
          >
            <span>All classes</span>
            <span className="text-[10px] tabular-nums">{students.length}</span>
          </button>
          {grouped.map(({ level, items }) => (
            <div key={level.id} className="mt-3">
              <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                {level.name}
              </div>
              {items.map((c) => {
                const count = students.filter((s) => s.class_id === c.id).length;
                const active = selectedClass === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClass(c.id)}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition ${
                      active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <ChevronRight className="h-3 w-3" />
                      {c.name}
                    </span>
                    <span className="text-[10px] tabular-nums">{count}</span>
                  </button>
                );
              })}
            </div>
          ))}
          {!classes.length && (
            <div className="text-[11px] text-muted-foreground px-2 py-2">
              No classes yet — create them in School Setup.
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <KpiCard label="Total students" value={students.length} icon={<GraduationCap className="h-4 w-4" />} />
            <KpiCard label="Classes" value={classes.length} icon={<Users className="h-4 w-4" />} accent="violet" />
            <KpiCard label="Selected" value={filtered.length} icon={<BookOpen className="h-4 w-4" />} accent="cyan" />
          </div>

          <Card className="overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <div className="font-medium">
                {selectedClass === "all"
                  ? "All students"
                  : classes.find((c) => c.id === selectedClass)?.name}
              </div>
              <span className="text-[11px] text-muted-foreground">{filtered.length} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface/40">
                    {["Student", "Email", "Class", "Status", "Joined"].map((h) => (
                      <th key={h} className="text-left text-[11px] uppercase tracking-wider text-muted-foreground font-medium px-4 py-2.5">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground text-sm">
                        {studentsQ.isLoading ? "Loading…" : "No students yet."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((s) => (
                      <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar initials={s.name.slice(0, 2).toUpperCase()} color="indigo" size="sm" />
                            <span className="font-medium">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{s.email}</td>
                        <td className="px-4 py-3 text-xs">
                          {classes.find((c) => c.id === s.class_id)?.name ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            variant={s.status === "active" ? "success" : s.status === "pending" ? "warning" : "neutral"}
                          >
                            {s.status}
                          </StatusBadge>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                          {new Date(s.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
