import { createFileRoute } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";
import { PageHeader, Card, StatusBadge } from "@/components/app/primitives";
import { ANNOUNCEMENTS } from "@/lib/eduflow-data";

export const Route = createFileRoute("/app/student/announcements")({
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  return (
    <>
      <PageHeader eyebrow="Student" title="Announcements" description="School-wide and class-specific updates." />
      <Card>
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="font-medium">Inbox</div>
          <Megaphone className="h-4 w-4 text-muted-foreground" />
        </div>
        {ANNOUNCEMENTS.map((a) => (
          <div key={a.id} className="px-5 py-4 border-b border-border last:border-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1"><div className="font-medium">{a.title}</div><div className="text-sm text-muted-foreground mt-1">{a.body}</div></div>
              <StatusBadge variant="info">{a.audience}</StatusBadge>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">{a.author} · {a.date}</div>
          </div>
        ))}
      </Card>
    </>
  );
}
