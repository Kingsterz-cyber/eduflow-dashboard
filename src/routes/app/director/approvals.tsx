import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, X, Inbox } from "lucide-react";
import { PageHeader, Card, StatusBadge } from "@/components/app/primitives";
import { listPendingApprovals, decideApproval } from "@/lib/director.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/app/director/approvals")({
  component: ApprovalsPage,
});

function ApprovalsPage() {
  const [tab, setTab] = useState<"teacher" | "student">("teacher");
  const qc = useQueryClient();
  const listFn = useServerFn(listPendingApprovals);
  const decideFn = useServerFn(decideApproval);

  const q = useQuery({ queryKey: ["director", "approvals"], queryFn: () => listFn() });
  const m = useMutation({
    mutationFn: (vars: { userId: string; approve: boolean }) => decideFn({ data: vars }),
    onSuccess: (_d, vars) => {
      toast.success(vars.approve ? "User approved" : "User rejected");
      qc.invalidateQueries({ queryKey: ["director"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const items = (tab === "teacher" ? q.data?.teachers : q.data?.students) ?? [];
  const tCount = q.data?.teachers.length ?? 0;
  const sCount = q.data?.students.length ?? 0;

  return (
    <>
      <PageHeader
        eyebrow="School Director"
        title="Approvals"
        description="Review and approve new staff and student registrations."
      />

      <div className="mb-4 inline-flex p-1 rounded-lg bg-secondary/60 border border-border">
        {[
          { k: "teacher", label: "Pending Teachers", n: tCount },
          { k: "student", label: "Pending Students", n: sCount },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k as never)}
            className={`px-3 h-7 text-xs rounded-md transition ${
              tab === t.k ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label} · {t.n}
          </button>
        ))}
      </div>

      {q.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => <Card key={i} className="p-4 h-32 animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="h-12 w-12 rounded-2xl bg-secondary grid place-items-center mx-auto mb-4">
            <Inbox className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="font-medium">No pending {tab}s</div>
          <div className="text-sm text-muted-foreground mt-1">New registrations will appear here.</div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {items.map((a) => (
            <Card key={a.id} hover className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-hero text-white grid place-items-center text-xs font-semibold">
                  {(a.full_name || a.email).slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{a.full_name || "(no name)"}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{a.email}</div>
                </div>
                <StatusBadge variant="warning">{new Date(a.created_at).toLocaleDateString()}</StatusBadge>
              </div>
              {a.phone && <div className="mt-3 text-xs text-muted-foreground">📞 {a.phone}</div>}
              <div className="mt-4 flex gap-2">
                <button
                  disabled={m.isPending}
                  onClick={() => m.mutate({ userId: a.id, approve: true })}
                  className="flex-1 h-8 inline-flex items-center justify-center gap-1.5 rounded-md bg-foreground text-background text-xs font-medium hover:opacity-90 disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" /> Approve
                </button>
                <button
                  disabled={m.isPending}
                  onClick={() => m.mutate({ userId: a.id, approve: false })}
                  className="flex-1 h-8 inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-card text-xs hover:bg-secondary disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" /> Reject
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
