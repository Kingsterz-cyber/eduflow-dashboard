import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, CheckCircle2, Copy, Sparkles } from "lucide-react";
import { createSchool } from "@/lib/onboarding.functions";

export const Route = createFileRoute("/onboarding/school")({
  head: () => ({ meta: [{ title: "Create school · EduFlow" }] }),
  component: CreateSchoolPage,
});

function CreateSchoolPage() {
  const navigate = useNavigate();
  const create = useServerFn(createSchool);
  const [form, setForm] = useState({
    name: "",
    country: "Uganda",
    schoolType: "Secondary",
    contactEmail: "",
    contactPhone: "",
    fullName: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [created, setCreated] = useState<null | { name: string; school_code: string; teacher_reg_code: string; student_reg_code: string }>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const { school } = await create({ data: form });
      setCreated({
        name: school.name,
        school_code: school.school_code,
        teacher_reg_code: school.teacher_reg_code,
        student_reg_code: school.student_reg_code,
      });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not create school");
    } finally {
      setLoading(false);
    }
  };

  if (created) {
    return (
      <Shell>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="h-12 w-12 rounded-2xl bg-gradient-hero grid place-items-center text-white mb-5">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{created.name} is live</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Save these codes — your team will need them to join. You can rotate them later in School Settings.
          </p>
          <div className="mt-6 grid gap-3">
            <CodeRow label="School code" code={created.school_code} hint="Used by teachers and students to find your school." />
            <CodeRow label="Teacher registration code" code={created.teacher_reg_code} hint="Share with new teachers." />
            <CodeRow label="Student registration code" code={created.student_reg_code} hint="Share with new students." />
          </div>
          <button
            onClick={() => navigate({ to: "/app" })}
            className="mt-8 w-full h-10 rounded-lg bg-foreground text-background font-medium text-sm hover:opacity-90"
          >
            Open my dashboard
          </button>
        </motion.div>
      </Shell>
    );
  }

  return (
    <Shell>
      <Link to="/onboarding" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> Back
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">Create your school</h1>
      <p className="mt-1 text-sm text-muted-foreground">Set up your workspace. You'll be the Director by default.</p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <Input label="Your full name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} required placeholder="e.g. Sarah Okello" />
        <Input label="School name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required placeholder="e.g. Westbrook International School" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} required />
          <Select label="School type" value={form.schoolType} onChange={(v) => setForm({ ...form, schoolType: v })}>
            <option>Primary</option>
            <option>Secondary</option>
            <option>Primary + Secondary</option>
            <option>Vocational</option>
            <option>International</option>
          </Select>
        </div>
        <Input label="Contact email" type="email" value={form.contactEmail} onChange={(v) => setForm({ ...form, contactEmail: v })} required placeholder="office@school.edu" />
        <Input label="Contact phone" value={form.contactPhone} onChange={(v) => setForm({ ...form, contactPhone: v })} required placeholder="+256…" />
        {err && <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-md">{err}</div>}
        <button disabled={loading} className="w-full h-10 rounded-lg bg-foreground text-background font-medium text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Create school
        </button>
      </form>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-6 py-10">
        <Link to="/" className="flex items-center gap-2 font-semibold mb-10">
          <div className="h-8 w-8 rounded-lg bg-gradient-hero grid place-items-center text-white"><Sparkles className="h-4 w-4" /></div>
          EduFlow
        </Link>
        {children}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required, placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="mt-1.5 w-full h-10 px-3 rounded-lg border border-border bg-secondary/40 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40" />
    </label>
  );
}
function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full h-10 px-3 rounded-lg border border-border bg-secondary/40 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40">
        {children}
      </select>
    </label>
  );
}
function CodeRow({ label, code, hint }: { label: string; code: string; hint: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="p-3 rounded-xl border border-border bg-secondary/30">
      <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="mt-1 flex items-center gap-2">
        <code className="flex-1 font-mono text-sm font-semibold tracking-wide">{code}</code>
        <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          className="h-7 px-2 rounded-md border border-border bg-background text-[11px] flex items-center gap-1 hover:bg-secondary">
          <Copy className="h-3 w-3" /> {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
    </div>
  );
}
