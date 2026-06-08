import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { registerTeacher } from "@/lib/onboarding.functions";

export const Route = createFileRoute("/onboarding/teacher")({
  head: () => ({ meta: [{ title: "Teacher signup · EduFlow" }] }),
  component: TeacherSignup,
});

function TeacherSignup() {
  const register = useServerFn(registerTeacher);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    schoolCode: "",
    teacherRegCode: "",
    fullName: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr(null);
    try {
      await register({
        data: {
          schoolCode: form.schoolCode,
          teacherRegCode: form.teacherRegCode,
          fullName: form.fullName,
          phone: form.phone,
          subjectIds: [],
          classAssignments: [],
          isClassTeacher: false,
        },
      });
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
              Your teacher account is pending approval from the School Director. You'll get access as soon as it's approved.
              In the meantime you can ask your director to assign you to subjects and classes.
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
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">Join your school as a teacher</h1>
            <p className="mt-1 text-sm text-muted-foreground">Ask your School Director for the school code and the teacher registration code.</p>
            <form onSubmit={submit} className="mt-6 space-y-3">
              <Input label="School code" value={form.schoolCode} onChange={(v) => setForm({ ...form, schoolCode: v.toUpperCase() })} placeholder="SCH-XXXX" required />
              <Input label="Teacher registration code" value={form.teacherRegCode} onChange={(v) => setForm({ ...form, teacherRegCode: v.toUpperCase() })} placeholder="TCH-XXXX" required />
              <Input label="Full name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} required />
              <Input label="Phone number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required placeholder="+256…" />
              <p className="text-[11px] text-muted-foreground">After approval you'll choose your department, subjects and classes from your Teacher dashboard.</p>
              {err && <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-md">{err}</div>}
              <button disabled={loading} className="w-full h-10 rounded-lg bg-foreground text-background font-medium text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />} Request access
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
