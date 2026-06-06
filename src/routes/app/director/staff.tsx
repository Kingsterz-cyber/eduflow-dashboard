import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, MoreHorizontal } from "lucide-react";
import { PageHeader, Avatar, StatusBadge } from "@/components/app/primitives";
import { DataTable } from "@/components/app/data-table";
import { STAFF } from "@/lib/eduflow-data";

export const Route = createFileRoute("/app/director/staff")({
  component: StaffPage,
});

function StaffPage() {
  const [tab, setTab] = useState<"all" | "DOS" | "Teacher">("all");
  const filtered = STAFF.filter((s) => tab === "all" || s.role === tab);

  return (
    <>
      <PageHeader
        eyebrow="School Director"
        title="Staff"
        description="Manage Directors of Studies and teachers. Assign departments and classes."
        actions={
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-gradient-hero text-white text-sm font-medium shadow-card">
            <Plus className="h-4 w-4" /> Invite staff
          </button>
        }
      />

      <div className="mb-4 inline-flex p-1 rounded-lg bg-secondary/60 border border-border">
        {[
          { k: "all", label: "All" },
          { k: "DOS", label: "DOS" },
          { k: "Teacher", label: "Teachers" },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k as never)}
            className={`px-3 h-7 text-xs rounded-md transition ${
              tab === t.k ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label} <span className="text-muted-foreground">· {STAFF.filter((s) => t.k === "all" || s.role === t.k).length}</span>
          </button>
        ))}
      </div>

      <DataTable
        data={filtered}
        searchKeys={["name", "email", "department"]}
        columns={[
          {
            key: "name",
            header: "Name",
            render: (s) => (
              <div className="flex items-center gap-2.5">
                <Avatar initials={s.avatar} color={s.role === "DOS" ? "violet" : "indigo"} size="sm" />
                <div>
                  <div className="font-medium text-sm">{s.name}</div>
                  <div className="text-[11px] text-muted-foreground">{s.email}</div>
                </div>
              </div>
            ),
          },
          { key: "role", header: "Role", render: (s) => <StatusBadge variant={s.role === "DOS" ? "info" : "neutral"}>{s.role}</StatusBadge> },
          { key: "dept", header: "Department", render: (s) => <span className="text-sm">{s.department}</span> },
          { key: "classes", header: "Classes", render: (s) => <span className="text-sm text-muted-foreground">{s.classes.join(", ") || "—"}</span> },
          {
            key: "activity",
            header: "Activity",
            render: (s) => (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-20 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-gradient-hero" style={{ width: `${s.activity}%` }} />
                </div>
                <span className="text-[11px] tabular-nums">{s.activity}</span>
              </div>
            ),
          },
          { key: "status", header: "Status", render: (s) => <StatusBadge variant={s.status === "active" ? "success" : "neutral"}>{s.status}</StatusBadge> },
          {
            key: "actions",
            header: "",
            className: "w-10",
            render: () => (
              <button className="h-7 w-7 grid place-items-center rounded-md hover:bg-secondary">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </button>
            ),
          },
        ]}
      />
    </>
  );
}
