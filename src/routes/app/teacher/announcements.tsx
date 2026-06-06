import { createFileRoute } from "@tanstack/react-router";
import { Megaphone, Send } from "lucide-react";
import { PageHeader, Card, StatusBadge } from "@/components/app/primitives";
import { ANNOUNCEMENTS } from "@/lib/eduflow-data";

export const Route = createFileRoute("/app/teacher/announcements")({
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  return (
    <>
      <PageHeader eyebrow="Teacher" title="Announcements" description="Send messages to your classes and read school-wide updates." />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4">
        <Card className="p-5">
          <div className="font-medium mb-3">Message your class</div>
          <input placeholder="Title" className="w-full h-9 px-3 rounded-lg bg-secondary/50 border border-border text-sm mb-3" />
          <textarea placeholder="Message…" rows={5} className="w-full p-3 rounded-lg bg-secondary/50 border border-border text-sm mb-3 resize-none" />
          <div className="text-xs text-muted-foreground mb-2">To</div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {["S2A", "S3B", "S4A", "S2B", "All my classes"].map((c) => (
              <button key={c} className="px-3 h-7 text-xs rounded-md border border-border bg-card hover:bg-secondary">{c}</button>
            ))}
          </div>
          <button className="w-full h-9 inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-hero text-white text-sm font-medium">
            <Send className="h-3.5 w-3.5" /> Publish
          </button>
        </Card>
        <Card>
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <div className="font-medium">School announcements</div>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </div>
          {ANNOUNCEMENTS.map((a) => (
            <div key={a.id} className="px-5 py-4 border-b border-border last:border-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1"><div className="font-medium text-sm">{a.title}</div><div className="text-xs text-muted-foreground mt-1">{a.body}</div></div>
                <StatusBadge variant="info">{a.audience}</StatusBadge>
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">{a.author} · {a.date}</div>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}
