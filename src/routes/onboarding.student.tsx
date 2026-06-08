import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { registerStudent } from "@/lib/onboarding.functions";

export const Route = createFileRoute("/onboarding/student")({
  head: () => ({ meta: [{ title: "Student signup · EduFlow" }] }),
  component: StudentSignup,
});

function StudentSignup() {
  const register = useServerFn(registerStudent);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    schoolCode: "",
    studentRegCode: "",
    enrollmentCode: "",
    fullName: "",
    phone: "",
    guardianName: "",
    guardianPhone: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr(null);
    try {
      await register({ data: form });
      setDone(true);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-6 py-10">
        <Link to="/" className="flex items-center gap-2 font-semibold mb-10">
          <div className="h-8 w-8 rounded-lg bg-gradient-hero grid place-items-center text-white"><Sparkles className="h-4 w-4" /></div>
          EduFlow
        </Link>
        {done ? (
          <div>
            <div className="h-12 w-12 rounded-2xl bg-gradient-hero grid place-items-center text-white mb-5">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">You're almost in</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your student account is pending approval. Once your school approves you, your dashboard will activate automatically.
            </p>
            <button onClick={() => navigate({ to: "/app" })} className="mt-6 w-full h-10 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90">
              Continue
            </button>
          </div>
        ) : (
          <>
            <Link to="/onboarding" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Back
            </Link>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">Join your class</h1>
            <p className="mt-1 text-sm text-muted-foreground">Your enrollment code automatically places you in the correct class.</p>
            <form onSubmit={submit} className="mt-6 space-y-3">
              <Input label="School code" value={form.schoolCode} onChange={(v) => setForm({ ...form, schoolCode: v.toUpperCase() })} placeholder="SCH-XXXX" required />
              <Input label="Student registration code" value={form.studentRegCode} onChange={(v) => setForm({ ...form, studentRegCode: v.toUpperCase() })} placeholder="STU-XXXX" required />
              <Input label="Enrollment code" value={form.enrollmentCode} onChange={(v) => setForm({ ...form, enrollmentCode: v.toUpperCase() })} placeholder="S2A-001" required />
              <div className="h-px bg-border my-2" />
              <Input label="Full name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} required />
              <Input label="Phone (optional)" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Guardian name" value={form.guardianName} onChange={(v) => setForm({ ...form, guardianName: v })} />
                <Input label="Guardian phone" value={form.guardianPhone} onChange={(v) => setForm({ ...form, guardianPhone: v })} />
              </div>
              {err && <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-md">{err}</div>}
              <button disabled={loading} className="w-full h-10 rounded-lg bg-foreground text-background font-medium text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />} Join class
              </button>
            </form>
          </>
        )}
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
