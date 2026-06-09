import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Megaphone, Send } from "lucide-react";
import { PageHeader, Card, StatusBadge } from "@/components/app/primitives";
import { listAnnouncements, createAnnouncement } from "@/lib/director.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/app/director/announcements")({
  component: AnnouncementsPage,
});

type Role = "director" | "dos" | "teacher" | "student";

function AnnouncementsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listAnnouncements);
  const createFn = useServerFn(createAnnouncement);

  const q = useQuery({ queryKey: ["director", "announcements"], queryFn: () => listFn() });
  const m = useMutation({
    mutationFn: (vars: { title: string; body: string; audienceRoles: Role[] }) => createFn({ data: vars }),
    onSuccess: () => {
      toast.success("Announcement published");
      setTitle(""); setBody("");
      qc.invalidateQueries({ queryKey: ["director", "announcements"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<"all" | Role>("all");

  const publish = () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and message are required");
      return;
    }
    const roles: Role[] = audience === "all" ? ["director", "dos", "teacher", "student"] : [audience];
    m.mutate({ title: title.trim(), body: body.trim(), audienceRoles: roles });
  };

  return (
    <>
      <PageHeader
        eyebrow="School Director"
        title="Announcements"
        description="Broadcast updates to staff, students, or specific roles."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4">
        <Card className="p-5">
          <div className="font-medium mb-4">New announcement</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full h-9 px-3 rounded-lg bg-secondary/50 border border-border text-sm mb-3"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message…"
            rows={6}
            className="w-full p-3 rounded-lg bg-secondary/50 border border-border text-sm mb-3 resize-none"
          />
          <div className="mb-3">
            <div className="text-xs font-medium text-muted-foreground mb-2">Audience</div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { k: "all", label: "All Users" },
                { k: "teacher", label: "Teachers" },
                { k: "student", label: "Students" },
                { k: "dos", label: "DOS" },
              ].map((a) => (
                <button
                  key={a.k}
                  onClick={() => setAudience(a.k as never)}
                  className={`px-3 h-7 text-xs rounded-md border transition ${
                    audience === a.k ? "bg-foreground text-background border-foreground" : "bg-card text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
          <button
            disabled={m.isPending}
            onClick={publish}
            className="w-full h-9 inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-hero text-white text-sm font-medium hover:opacity-90 disabled:opacity-60"
          >
            <Send className="h-3.5 w-3.5" /> {m.isPending ? "Publishing…" : "Publish"}
          </button>
        </Card>

        <Card>
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <div className="font-medium">Published</div>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            {q.isLoading ? (
              <div className="p-10 text-center text-xs text-muted-foreground">Loading…</div>
            ) : (q.data?.items.length ?? 0) === 0 ? (
              <div className="p-10 text-center text-xs text-muted-foreground">No announcements yet.</div>
            ) : (
              q.data!.items.map((a) => (
                <div key={a.id} className="px-5 py-4 border-b border-border last:border-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{a.title}</div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.body}</div>
                    </div>
                    <StatusBadge variant="info">
                      {(a.audience_roles ?? []).length >= 4 ? "all" : (a.audience_roles ?? []).join(", ") || "all"}
                    </StatusBadge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{new Date(a.published_at).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
