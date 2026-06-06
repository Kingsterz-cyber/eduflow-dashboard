import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Megaphone, Send } from "lucide-react";
import { PageHeader, Card, StatusBadge } from "@/components/app/primitives";
import { ANNOUNCEMENTS } from "@/lib/eduflow-data";

export const Route = createFileRoute("/app/director/announcements")({
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  const [audience, setAudience] = useState("All Users");
  return (
    <>
      <PageHeader
        eyebrow="School Director"
        title="Announcements"
        description="Broadcast updates to staff, students, or specific classes."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4">
        <Card className="p-5">
          <div className="font-medium mb-4">New announcement</div>
          <input placeholder="Title" className="w-full h-9 px-3 rounded-lg bg-secondary/50 border border-border text-sm mb-3" />
          <textarea
            placeholder="Write your message…"
            rows={6}
            className="w-full p-3 rounded-lg bg-secondary/50 border border-border text-sm mb-3 resize-none"
          />
          <div className="mb-3">
            <div className="text-xs font-medium text-muted-foreground mb-2">Audience</div>
            <div className="flex flex-wrap gap-1.5">
              {["All Users", "Teachers", "Students", "Specific Class"].map((a) => (
                <button
                  key={a}
                  onClick={() => setAudience(a)}
                  className={`px-3 h-7 text-xs rounded-md border transition ${
                    audience === a ? "bg-foreground text-background border-foreground" : "bg-card text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <button className="w-full h-9 inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-hero text-white text-sm font-medium hover:opacity-90">
            <Send className="h-3.5 w-3.5" /> Publish
          </button>
        </Card>

        <Card>
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <div className="font-medium">Published</div>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            {ANNOUNCEMENTS.map((a) => (
              <div key={a.id} className="px-5 py-4 border-b border-border last:border-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{a.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.body}</div>
                  </div>
                  <StatusBadge variant="info">{a.audience}</StatusBadge>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{a.author} · {a.date}</span>
                  <span>{a.reads} reads</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
