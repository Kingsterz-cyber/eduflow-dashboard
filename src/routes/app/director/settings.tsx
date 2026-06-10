import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Save, Plus, Trash2, Copy } from "lucide-react";
import { PageHeader, Card } from "@/components/app/primitives";
import {
  getSchoolSetup,
  updateSchool,
  replaceGradingBands,
  generateEnrollmentCodes,
  listEnrollmentCodes,
} from "@/lib/director.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/app/director/settings")({
  component: SettingsPage,
});

const TABS = ["Branding", "Grading", "Enrollment Codes"] as const;
type Tab = (typeof TABS)[number];

function SettingsPage() {
  const [tab, setTab] = useState<Tab>("Branding");
  return (
    <>
      <PageHeader
        eyebrow="School Director"
        title="School Settings"
        description="Configure school identity, grading, and student enrollment codes."
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
        <div>
          {tab === "Branding" && <BrandingTab />}
          {tab === "Grading" && <GradingTab />}
          {tab === "Enrollment Codes" && <CodesTab />}
        </div>
      </div>
    </>
  );
}

function BrandingTab() {
  const fetchSetup = useServerFn(getSchoolSetup);
  const save = useServerFn(updateSchool);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["director", "setup"], queryFn: () => fetchSetup() });
  const school = data?.school;

  const [form, setForm] = useState({
    name: "",
    contact_email: "",
    contact_phone: "",
    country: "",
    school_type: "",
    logo_url: "",
  });

  useEffect(() => {
    if (school) {
      setForm({
        name: school.name ?? "",
        contact_email: school.contact_email ?? "",
        contact_phone: school.contact_phone ?? "",
        country: school.country ?? "",
        school_type: school.school_type ?? "",
        logo_url: school.logo_url ?? "",
      });
    }
  }, [school]);

  const mut = useMutation({
    mutationFn: () => save({ data: form }),
    onSuccess: () => {
      toast.success("School updated");
      qc.invalidateQueries({ queryKey: ["director", "setup"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card className="p-6">
      <div className="space-y-4 max-w-lg">
        <Input label="School name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
          <Input label="School type" value={form.school_type} onChange={(v) => setForm({ ...form, school_type: v })} />
        </div>
        <Input label="Contact email" value={form.contact_email} onChange={(v) => setForm({ ...form, contact_email: v })} />
        <Input label="Contact phone" value={form.contact_phone} onChange={(v) => setForm({ ...form, contact_phone: v })} />
        <Input label="Logo URL" value={form.logo_url} onChange={(v) => setForm({ ...form, logo_url: v })} />
        <div className="text-[11px] text-muted-foreground">
          School code <span className="font-mono">{school?.school_code}</span> · Teacher code{" "}
          <span className="font-mono">{school?.teacher_reg_code}</span> · Student code{" "}
          <span className="font-mono">{school?.student_reg_code}</span>
        </div>
        <button
          onClick={() => mut.mutate()}
          disabled={mut.isPending}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-60"
        >
          <Save className="h-3.5 w-3.5" /> {mut.isPending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </Card>
  );
}

const DEFAULT_BANDS = [
  { grade: "A", label: "Distinction", min_score: 80, max_score: 100 },
  { grade: "B+", label: "Credit", min_score: 75, max_score: 79 },
  { grade: "B", label: "Credit", min_score: 65, max_score: 74 },
  { grade: "C", label: "Pass", min_score: 50, max_score: 64 },
  { grade: "F", label: "Fail", min_score: 0, max_score: 49 },
];

function GradingTab() {
  const fetchSetup = useServerFn(getSchoolSetup);
  const save = useServerFn(replaceGradingBands);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["director", "setup"], queryFn: () => fetchSetup() });
  const [bands, setBands] = useState(DEFAULT_BANDS);

  useEffect(() => {
    if (data?.gradingBands?.length) {
      setBands(
        data.gradingBands.map((b) => ({
          grade: b.grade,
          label: b.label ?? "",
          min_score: Number(b.min_score),
          max_score: Number(b.max_score),
        })),
      );
    }
  }, [data?.gradingBands]);

  const mut = useMutation({
    mutationFn: () => save({ data: { bands } }),
    onSuccess: () => {
      toast.success("Grading scale saved");
      qc.invalidateQueries({ queryKey: ["director", "setup"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = (i: number, patch: Partial<(typeof bands)[number]>) =>
    setBands(bands.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));

  return (
    <Card className="p-6">
      <div className="text-xs text-muted-foreground mb-4">
        Configure grade bands. Used for report cards and analytics.
      </div>
      <div className="space-y-2 max-w-2xl">
        {bands.map((b, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={b.grade}
              onChange={(e) => update(i, { grade: e.target.value })}
              className="w-16 h-9 px-2 rounded-md bg-secondary/50 border border-border text-sm font-semibold text-center"
            />
            <input
              value={b.label ?? ""}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder="Label"
              className="flex-1 h-9 px-3 rounded-md bg-secondary/50 border border-border text-sm"
            />
            <input
              type="number"
              value={b.min_score}
              onChange={(e) => update(i, { min_score: Number(e.target.value) })}
              className="w-20 h-9 px-2 rounded-md bg-secondary/50 border border-border text-sm tabular-nums"
            />
            <span className="text-xs text-muted-foreground">–</span>
            <input
              type="number"
              value={b.max_score}
              onChange={(e) => update(i, { max_score: Number(e.target.value) })}
              className="w-20 h-9 px-2 rounded-md bg-secondary/50 border border-border text-sm tabular-nums"
            />
            <button
              onClick={() => setBands(bands.filter((_, idx) => idx !== i))}
              className="h-9 w-9 grid place-items-center rounded-md hover:bg-secondary"
              aria-label="Remove band"
            >
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        ))}
        <button
          onClick={() => setBands([...bands, { grade: "", label: "", min_score: 0, max_score: 0 }])}
          className="text-xs text-primary hover:underline inline-flex items-center gap-1"
        >
          <Plus className="h-3 w-3" /> Add band
        </button>
      </div>
      <button
        onClick={() => mut.mutate()}
        disabled={mut.isPending}
        className="mt-6 inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-60"
      >
        <Save className="h-3.5 w-3.5" /> {mut.isPending ? "Saving…" : "Save grading"}
      </button>
    </Card>
  );
}

function CodesTab() {
  const fetchSetup = useServerFn(getSchoolSetup);
  const fetchCodes = useServerFn(listEnrollmentCodes);
  const generate = useServerFn(generateEnrollmentCodes);
  const qc = useQueryClient();
  const setup = useQuery({ queryKey: ["director", "setup"], queryFn: () => fetchSetup() });
  const codesQ = useQuery({ queryKey: ["director", "codes"], queryFn: () => fetchCodes({ data: {} }) });

  const classes = setup.data?.classes ?? [];
  const [classId, setClassId] = useState<string>("");
  const [count, setCount] = useState(10);

  useEffect(() => {
    if (!classId && classes[0]) setClassId(classes[0].id);
  }, [classes, classId]);

  const mut = useMutation({
    mutationFn: () => generate({ data: { classId, count } }),
    onSuccess: (r) => {
      toast.success(`Generated ${r.codes.length} codes`);
      qc.invalidateQueries({ queryKey: ["director", "codes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const items = codesQ.data?.items ?? [];

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="font-medium mb-3">Generate student enrollment codes</div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="block text-xs font-medium text-muted-foreground mb-1.5">Class</span>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="h-9 px-3 rounded-lg bg-secondary/50 border border-border text-sm min-w-[180px]"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-muted-foreground mb-1.5">Count</span>
            <input
              type="number"
              min={1}
              max={200}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-24 h-9 px-3 rounded-lg bg-secondary/50 border border-border text-sm tabular-nums"
            />
          </label>
          <button
            onClick={() => mut.mutate()}
            disabled={mut.isPending || !classId}
            className="h-9 px-4 rounded-lg bg-gradient-hero text-white text-sm font-medium disabled:opacity-60"
          >
            {mut.isPending ? "Generating…" : "Generate"}
          </button>
        </div>
        {!classes.length && (
          <div className="mt-3 text-xs text-muted-foreground">
            Create at least one class in School Setup first.
          </div>
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="font-medium">Recent codes</div>
          <span className="text-[11px] text-muted-foreground">{items.length} shown</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/40">
                {["Code", "Class", "Status", "Used at", ""].map((h) => (
                  <th key={h} className="text-left text-[11px] uppercase tracking-wider text-muted-foreground font-medium px-4 py-2.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    {codesQ.isLoading ? "Loading…" : "No enrollment codes yet."}
                  </td>
                </tr>
              ) : (
                items.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                    <td className="px-4 py-3 font-mono text-xs">{c.code}</td>
                    <td className="px-4 py-3 text-xs">
                      {classes.find((cls) => cls.id === c.class_id)?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                          c.status === "unused"
                            ? "border-success/30 bg-success/10 text-success"
                            : c.status === "used"
                            ? "border-border bg-secondary text-muted-foreground"
                            : "border-destructive/30 bg-destructive/10 text-destructive"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                      {c.used_at ? new Date(c.used_at).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3 w-10">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(c.code);
                          toast.success("Code copied");
                        }}
                        className="h-7 w-7 grid place-items-center rounded-md hover:bg-secondary"
                      >
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 px-3 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
      />
    </label>
  );
}
