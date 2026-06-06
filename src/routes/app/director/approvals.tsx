import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { PageHeader, Card, Avatar, StatusBadge } from "@/components/app/primitives";
import { APPROVALS } from "@/lib/eduflow-data";

export const Route = createFileRoute("/app/director/approvals")({
  component: ApprovalsPage,
});

function ApprovalsPage() {
  const [tab, setTab] = useState<"teacher" | "student">("teacher");
  const items = APPROVALS.filter((a) => a.type === tab);

  return (
    <>
      <PageHeader
        eyebrow="School Director"
        title="Approvals"
        description="Review and approve new staff and student registrations."
      />

      <div className="mb-4 inline-flex p-1 rounded-lg bg-secondary/60 border border-border">
        {[
          { k: "teacher", label: "Pending Teachers" },
          { k: "student", label: "Pending Students" },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k as never)}
            className={`px-3 h-7 text-xs rounded-md transition ${
              tab === t.k ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label} · {APPROVALS.filter((a) => a.type === t.k).length}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {items.map((a) => (
          <Card key={a.id} hover className="p-4">
            <div className="flex items-start gap-3">
              <Avatar initials={a.avatar} color={tab === "teacher" ? "violet" : "indigo"} />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{a.name}</div>
                <div className="text-[11px] text-muted-foreground truncate">{a.email}</div>
              </div>
              <StatusBadge variant="warning">{a.submittedAt}</StatusBadge>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">{a.meta}</div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 h-8 inline-flex items-center justify-center gap-1.5 rounded-md bg-foreground text-background text-xs font-medium hover:opacity-90">
                <Check className="h-3.5 w-3.5" /> Approve
              </button>
              <button className="flex-1 h-8 inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-card text-xs hover:bg-secondary">
                <X className="h-3.5 w-3.5" /> Reject
              </button>
              <button className="h-8 px-3 rounded-md border border-border bg-card text-xs hover:bg-secondary">Details</button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
