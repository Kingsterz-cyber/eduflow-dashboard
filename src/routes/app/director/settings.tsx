import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Save } from "lucide-react";
import { PageHeader, Card } from "@/components/app/primitives";
import { SCHOOL } from "@/lib/eduflow-data";

export const Route = createFileRoute("/app/director/settings")({
  component: SettingsPage,
});

const TABS = ["Branding", "Academic Years", "Grading", "School Codes"] as const;

function SettingsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Branding");
  return (
    <>
      <PageHeader
        eyebrow="School Director"
        title="School Settings"
        description="Configure school identity, academic structure, grading, and access codes."
      />
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-4">
        <Card className="p-2 self-start">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${
                tab === t ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </Card>

        <Card className="p-6">
          {tab === "Branding" && (
            <div className="space-y-4 max-w-lg">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-hero grid place-items-center shadow-glow-primary">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <div>
                  <div className="font-medium">{SCHOOL.name}</div>
                  <div className="text-xs text-muted-foreground">Logo · 512×512 recommended</div>
                  <button className="mt-2 text-xs h-7 px-3 rounded-md border border-border hover:bg-secondary">Upload new logo</button>
                </div>
              </div>
              <Input label="School name" value={SCHOOL.name} />
              <Input label="Short name" value="Westbrook" />
              <Input label="Primary contact email" value="office@wis.edu" />
              <SaveBtn />
            </div>
          )}
          {tab === "Academic Years" && (
            <div className="space-y-3 max-w-lg">
              {["2025/2026", "2024/2025", "2023/2024"].map((y, i) => (
                <div key={y} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <div className="font-medium text-sm">{y}</div>
                    <div className="text-[11px] text-muted-foreground">{i === 0 ? "Active · Term 2" : "Archived"}</div>
                  </div>
                  <span className="text-xs text-muted-foreground">{i === 0 ? "Current" : "—"}</span>
                </div>
              ))}
              <button className="text-sm text-primary hover:underline">+ Add academic year</button>
            </div>
          )}
          {tab === "Grading" && (
            <div className="max-w-lg">
              <div className="text-xs text-muted-foreground mb-3">Configure grade bands. Changes apply to all new mark entries.</div>
              {[
                { g: "A", from: 80, to: 100, label: "Distinction" },
                { g: "B+", from: 75, to: 79, label: "Credit" },
                { g: "B", from: 65, to: 74, label: "Credit" },
                { g: "C", from: 50, to: 64, label: "Pass" },
                { g: "F", from: 0, to: 49, label: "Fail" },
              ].map((b) => (
                <div key={b.g} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="h-8 w-10 rounded-md bg-secondary grid place-items-center font-semibold text-sm">{b.g}</div>
                  <div className="flex-1 text-sm">{b.label}</div>
                  <div className="text-xs text-muted-foreground tabular-nums">{b.from}–{b.to}</div>
                </div>
              ))}
              <SaveBtn />
            </div>
          )}
          {tab === "School Codes" && (
            <div className="space-y-4 max-w-lg">
              <Input label="School code" value={SCHOOL.code} />
              <Input label="Teacher join code" value="JOIN-T9X4-PR21" />
              <Input label="Student join code" value="JOIN-S0W7-EM48" />
              <div className="text-[11px] text-muted-foreground">Codes can be rotated at any time to revoke pending invitations.</div>
              <SaveBtn />
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

function Input({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</span>
      <input defaultValue={value} className="w-full h-9 px-3 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring/40" />
    </label>
  );
}
function SaveBtn() {
  return (
    <button className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90">
      <Save className="h-3.5 w-3.5" /> Save changes
    </button>
  );
}
