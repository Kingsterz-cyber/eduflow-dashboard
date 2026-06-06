import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Avatar, StatusBadge } from "@/components/app/primitives";
import { DataTable } from "@/components/app/data-table";
import { STUDENTS } from "@/lib/eduflow-data";

export const Route = createFileRoute("/app/teacher/students")({
  component: StudentsPage,
});

const MY_CLASSES = ["S2A", "S3B", "S4A", "S2B"];

function StudentsPage() {
  const students = STUDENTS.filter((s) => MY_CLASSES.includes(s.classId));
  return (
    <>
      <PageHeader eyebrow="Teacher" title="My Students" description="All students across your assigned classes." />
      <DataTable
        data={students}
        searchKeys={["name", "id"]}
        columns={[
          { key: "name", header: "Student", render: (s) => (
            <div className="flex items-center gap-2.5"><Avatar initials={s.avatar} color="indigo" size="sm" /><div><div className="font-medium text-sm">{s.name}</div><div className="text-[11px] text-muted-foreground">{s.id}</div></div></div>
          ) },
          { key: "cls", header: "Class", render: (s) => <StatusBadge>{s.classId}</StatusBadge> },
          { key: "att", header: "Attendance", render: (s) => <span className="tabular-nums">{s.attendance}%</span> },
          { key: "avg", header: "Average", render: (s) => <span className="tabular-nums">{s.average}%</span> },
          { key: "st", header: "Status", render: (s) => <StatusBadge variant={s.status === "honors" ? "success" : s.status === "at-risk" ? "danger" : "neutral"}>{s.status}</StatusBadge> },
        ]}
      />
    </>
  );
}
