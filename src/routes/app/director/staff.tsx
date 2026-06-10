import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Power } from "lucide-react";
import { PageHeader, Avatar, StatusBadge, Card } from "@/components/app/primitives";
import { DataTable } from "@/components/app/data-table";
import { listStaff, setStaffStatus } from "@/lib/director.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/app/director/staff")({
  component: StaffPage,
});

function StaffPage() {
  const fetchStaff = useServerFn(listStaff);
  const toggle = useServerFn(setStaffStatus);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["director", "staff"], queryFn: () => fetchStaff() });
  const mut = useMutation({
    mutationFn: (vars: { userId: string; status: "active" | "inactive" }) => toggle({ data: vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["director", "staff"] });
      toast.success("Updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [tab, setTab] = useState<"all" | "dos" | "teacher">("all");
  const items = data?.items ?? [];
  const filtered = items.filter((s) => tab === "all" || s.role === tab);
  const counts = {
    all: items.length,
    dos: items.filter((s) => s.role === "dos").length,
    teacher: items.filter((s) => s.role === "teacher").length,
  };

  return (
    <>
      <PageHeader
        eyebrow="School Director"
        title="Staff"
        description="Directors of Studies and teachers in your school. Share the teacher join code from School Settings to invite staff."
      />
      <div className="mb-4 inline-flex p-1 rounded-lg bg-secondary/60 border border-border">
        {([
          ["all", "All"],
          ["dos", "DOS"],
          ["teacher", "Teachers"],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-3 h-7 text-xs rounded-md transition ${
              tab === k ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label} <span className="text-muted-foreground">· {counts[k]}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <Card className="p-10 text-sm text-muted-foreground text-center">Loading staff…</Card>
      ) : items.length === 0 ? (
        <Card className="p-10 text-sm text-muted-foreground text-center">
          No staff yet. Share your teacher join code from School Settings.
        </Card>
      ) : (
        <DataTable
          data={filtered}
          searchKeys={["full_name", "email"]}
          columns={[
            {
              key: "name",
              header: "Name",
              render: (s) => (
                <div className="flex items-center gap-2.5">
                  <Avatar
                    initials={(s.full_name || s.email || "??").slice(0, 2).toUpperCase()}
                    color={s.role === "dos" ? "violet" : "indigo"}
                    size="sm"
                  />
                  <div>
                    <div className="font-medium text-sm">{s.full_name || "(unnamed)"}</div>
                    <div className="text-[11px] text-muted-foreground">{s.email}</div>
                  </div>
                </div>
              ),
            },
            {
              key: "role",
              header: "Role",
              render: (s) => (
                <StatusBadge variant={s.role === "dos" ? "info" : "neutral"}>
                  {s.role === "dos" ? "DOS" : "Teacher"}
                </StatusBadge>
              ),
            },
            {
              key: "assignments",
              header: "Assignments",
              render: (s) => (
                <span className="text-sm tabular-nums">
                  {s.assignments}
                  {s.is_class_teacher && (
                    <span className="ml-2 text-[10px] text-primary">· Class teacher</span>
                  )}
                </span>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (s) => (
                <StatusBadge
                  variant={s.status === "active" ? "success" : s.status === "pending" ? "warning" : "neutral"}
                >
                  {s.status}
                </StatusBadge>
              ),
            },
            {
              key: "actions",
              header: "",
              className: "w-32 text-right",
              render: (s) => (
                <button
                  onClick={() =>
                    mut.mutate({
                      userId: s.id,
                      status: s.status === "active" ? "inactive" : "active",
                    })
                  }
                  disabled={mut.isPending || s.status === "pending"}
                  className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-border hover:bg-secondary text-xs"
                >
                  <Power className="h-3 w-3" />
                  {s.status === "active" ? "Deactivate" : "Activate"}
                </button>
              ),
            },
          ]}
        />
      )}
    </>
  );
}
