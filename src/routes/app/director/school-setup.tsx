import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, CalendarCheck } from "lucide-react";
import { PageHeader, Card } from "@/components/app/primitives";
import {
  getSchoolSetup,
  upsertDivision,
  deleteDivision,
  upsertLevel,
  deleteLevel,
  upsertClass,
  deleteClass,
  upsertDepartment,
  deleteDepartment,
  upsertSubject,
  deleteSubject,
  upsertTerm,
  deleteTerm,
} from "@/lib/director.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/app/director/school-setup")({
  component: SetupPage,
});

const TABS = ["Divisions & Levels", "Classes", "Departments & Subjects", "Terms"] as const;
type Tab = (typeof TABS)[number];

function useSetup() {
  const fn = useServerFn(getSchoolSetup);
  return useQuery({ queryKey: ["director", "setup"], queryFn: () => fn() });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["director", "setup"] });
}

function SetupPage() {
  const [tab, setTab] = useState<Tab>("Divisions & Levels");
  return (
    <>
      <PageHeader
        eyebrow="School Director"
        title="School Setup"
        description="Build the academic structure of your school: divisions, levels, classes, subjects and terms."
      />
      <div className="mb-4 inline-flex p-1 rounded-lg bg-secondary/60 border border-border overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 h-7 text-xs rounded-md whitespace-nowrap transition ${
              tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Divisions & Levels" && <DivisionsTab />}
      {tab === "Classes" && <ClassesTab />}
      {tab === "Departments & Subjects" && <SubjectsTab />}
      {tab === "Terms" && <TermsTab />}
    </>
  );
}

function DivisionsTab() {
  const { data } = useSetup();
  const invalidate = useInvalidate();
  const upDiv = useServerFn(upsertDivision);
  const delDiv = useServerFn(deleteDivision);
  const upLvl = useServerFn(upsertLevel);
  const delLvl = useServerFn(deleteLevel);

  const [divName, setDivName] = useState("");
  const [lvlName, setLvlName] = useState<Record<string, string>>({});

  const divisions = data?.divisions ?? [];
  const levels = data?.levels ?? [];

  const run = (p: Promise<unknown>) =>
    p.then(invalidate).catch((e: Error) => toast.error(e.message));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-5">
        <div className="font-medium mb-3">Divisions</div>
        <div className="flex gap-2 mb-4">
          <input
            value={divName}
            onChange={(e) => setDivName(e.target.value)}
            placeholder="e.g. Lower School"
            className="flex-1 h-9 px-3 rounded-lg bg-secondary/50 border border-border text-sm"
          />
          <button
            onClick={() => {
              if (!divName.trim()) return;
              run(upDiv({ data: { name: divName.trim(), position: divisions.length } }).then(() => setDivName("")));
            }}
            className="h-9 px-3 rounded-lg bg-foreground text-background text-sm font-medium"
          >
            <Plus className="inline h-3.5 w-3.5 mr-1" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {divisions.map((d) => (
            <div key={d.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border">
              <span className="text-sm font-medium">{d.name}</span>
              <button onClick={() => run(delDiv({ data: { id: d.id } }))} className="h-7 w-7 grid place-items-center rounded-md hover:bg-secondary">
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          ))}
          {!divisions.length && <div className="text-xs text-muted-foreground">No divisions yet.</div>}
        </div>
      </Card>

      <Card className="p-5">
        <div className="font-medium mb-3">Levels</div>
        {divisions.length === 0 ? (
          <div className="text-xs text-muted-foreground">Create a division first.</div>
        ) : (
          divisions.map((d) => {
            const inDiv = levels.filter((l) => l.division_id === d.id);
            const key = d.id;
            return (
              <div key={d.id} className="mb-4">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">{d.name}</div>
                <div className="flex gap-2 mb-2">
                  <input
                    value={lvlName[key] ?? ""}
                    onChange={(e) => setLvlName({ ...lvlName, [key]: e.target.value })}
                    placeholder="Level name (e.g. S1)"
                    className="flex-1 h-9 px-3 rounded-lg bg-secondary/50 border border-border text-sm"
                  />
                  <button
                    onClick={() => {
                      const name = (lvlName[key] ?? "").trim();
                      if (!name) return;
                      run(
                        upLvl({ data: { division_id: d.id, name, position: inDiv.length } }).then(() =>
                          setLvlName({ ...lvlName, [key]: "" }),
                        ),
                      );
                    }}
                    className="h-9 px-3 rounded-lg bg-secondary text-foreground text-sm border border-border"
                  >
                    Add level
                  </button>
                </div>
                <div className="space-y-1.5">
                  {inDiv.map((l) => (
                    <div key={l.id} className="flex items-center justify-between p-2 rounded-md border border-border text-sm">
                      <span>{l.name}</span>
                      <button onClick={() => run(delLvl({ data: { id: l.id } }))} className="h-6 w-6 grid place-items-center rounded hover:bg-secondary">
                        <Trash2 className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
}

function ClassesTab() {
  const { data } = useSetup();
  const invalidate = useInvalidate();
  const upCls = useServerFn(upsertClass);
  const delCls = useServerFn(deleteClass);
  const levels = data?.levels ?? [];
  const classes = data?.classes ?? [];

  const [levelId, setLevelId] = useState("");
  const [name, setName] = useState("");

  const run = (p: Promise<unknown>) =>
    p.then(invalidate).catch((e: Error) => toast.error(e.message));

  return (
    <Card className="p-5">
      <div className="font-medium mb-4">Classes</div>
      {levels.length === 0 ? (
        <div className="text-xs text-muted-foreground">Create at least one level first.</div>
      ) : (
        <div className="flex flex-wrap items-end gap-2 mb-4">
          <select
            value={levelId}
            onChange={(e) => setLevelId(e.target.value)}
            className="h-9 px-3 rounded-lg bg-secondary/50 border border-border text-sm min-w-[160px]"
          >
            <option value="">Select level…</option>
            {levels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Class name (e.g. S1A)"
            className="h-9 px-3 rounded-lg bg-secondary/50 border border-border text-sm"
          />
          <button
            onClick={() => {
              if (!levelId || !name.trim()) return;
              run(upCls({ data: { level_id: levelId, name: name.trim() } }).then(() => setName("")));
            }}
            className="h-9 px-3 rounded-lg bg-foreground text-background text-sm font-medium"
          >
            <Plus className="inline h-3.5 w-3.5 mr-1" /> Add class
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {classes.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border">
            <div>
              <div className="text-sm font-medium">{c.name}</div>
              <div className="text-[11px] text-muted-foreground">
                {levels.find((l) => l.id === c.level_id)?.name ?? "—"}
              </div>
            </div>
            <button onClick={() => run(delCls({ data: { id: c.id } }))} className="h-7 w-7 grid place-items-center rounded-md hover:bg-secondary">
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        ))}
        {!classes.length && <div className="text-xs text-muted-foreground">No classes yet.</div>}
      </div>
    </Card>
  );
}

function SubjectsTab() {
  const { data } = useSetup();
  const invalidate = useInvalidate();
  const upDept = useServerFn(upsertDepartment);
  const delDept = useServerFn(deleteDepartment);
  const upSub = useServerFn(upsertSubject);
  const delSub = useServerFn(deleteSubject);

  const departments = data?.departments ?? [];
  const subjects = data?.subjects ?? [];

  const [deptName, setDeptName] = useState("");
  const [subForm, setSubForm] = useState<{ name: string; department_id: string }>({ name: "", department_id: "" });

  const run = (p: Promise<unknown>) =>
    p.then(invalidate).catch((e: Error) => toast.error(e.message));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-5">
        <div className="font-medium mb-3">Departments</div>
        <div className="flex gap-2 mb-4">
          <input
            value={deptName}
            onChange={(e) => setDeptName(e.target.value)}
            placeholder="e.g. Sciences"
            className="flex-1 h-9 px-3 rounded-lg bg-secondary/50 border border-border text-sm"
          />
          <button
            onClick={() => {
              if (!deptName.trim()) return;
              run(upDept({ data: { name: deptName.trim() } }).then(() => setDeptName("")));
            }}
            className="h-9 px-3 rounded-lg bg-foreground text-background text-sm font-medium"
          >
            <Plus className="inline h-3.5 w-3.5 mr-1" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {departments.map((d) => (
            <div key={d.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border">
              <span className="text-sm">{d.name}</span>
              <button onClick={() => run(delDept({ data: { id: d.id } }))} className="h-7 w-7 grid place-items-center rounded-md hover:bg-secondary">
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          ))}
          {!departments.length && <div className="text-xs text-muted-foreground">No departments yet.</div>}
        </div>
      </Card>

      <Card className="p-5">
        <div className="font-medium mb-3">Subjects</div>
        <div className="flex flex-wrap items-end gap-2 mb-4">
          <select
            value={subForm.department_id}
            onChange={(e) => setSubForm({ ...subForm, department_id: e.target.value })}
            className="h-9 px-3 rounded-lg bg-secondary/50 border border-border text-sm min-w-[140px]"
          >
            <option value="">(no dept)</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <input
            value={subForm.name}
            onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
            placeholder="Subject name"
            className="flex-1 h-9 px-3 rounded-lg bg-secondary/50 border border-border text-sm min-w-[160px]"
          />
          <button
            onClick={() => {
              if (!subForm.name.trim()) return;
              run(
                upSub({
                  data: {
                    name: subForm.name.trim(),
                    department_id: subForm.department_id || null,
                  },
                }).then(() => setSubForm({ name: "", department_id: subForm.department_id })),
              );
            }}
            className="h-9 px-3 rounded-lg bg-foreground text-background text-sm font-medium"
          >
            <Plus className="inline h-3.5 w-3.5 mr-1" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {subjects.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border">
              <div>
                <div className="text-sm font-medium">{s.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {departments.find((d) => d.id === s.department_id)?.name ?? "Unassigned"}
                </div>
              </div>
              <button onClick={() => run(delSub({ data: { id: s.id } }))} className="h-7 w-7 grid place-items-center rounded-md hover:bg-secondary">
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          ))}
          {!subjects.length && <div className="text-xs text-muted-foreground">No subjects yet.</div>}
        </div>
      </Card>
    </div>
  );
}

function TermsTab() {
  const { data } = useSetup();
  const invalidate = useInvalidate();
  const upTerm = useServerFn(upsertTerm);
  const delTerm = useServerFn(deleteTerm);
  const terms = data?.terms ?? [];

  const [form, setForm] = useState({ name: "", start_date: "", end_date: "", is_current: false });

  const run = (p: Promise<unknown>) =>
    p.then(invalidate).catch((e: Error) => toast.error(e.message));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4">
      <Card className="p-5">
        <div className="font-medium mb-3">New term</div>
        <div className="space-y-3">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Term name (e.g. Term 1 — 2026)"
            className="w-full h-9 px-3 rounded-lg bg-secondary/50 border border-border text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className="h-9 px-3 rounded-lg bg-secondary/50 border border-border text-sm"
            />
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              className="h-9 px-3 rounded-lg bg-secondary/50 border border-border text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={form.is_current}
              onChange={(e) => setForm({ ...form, is_current: e.target.checked })}
            />
            Set as current term
          </label>
          <button
            onClick={() => {
              if (!form.name || !form.start_date || !form.end_date) {
                toast.error("Fill all fields");
                return;
              }
              run(
                upTerm({ data: form }).then(() =>
                  setForm({ name: "", start_date: "", end_date: "", is_current: false }),
                ),
              );
            }}
            className="h-9 px-4 rounded-lg bg-foreground text-background text-sm font-medium"
          >
            <Plus className="inline h-3.5 w-3.5 mr-1" /> Create term
          </button>
        </div>
      </Card>

      <Card className="p-5">
        <div className="font-medium mb-3">Terms</div>
        <div className="space-y-2">
          {terms.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <div className="text-sm font-medium flex items-center gap-2">
                  {t.name}
                  {t.is_current && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-success/15 text-success">
                      <CalendarCheck className="h-3 w-3" /> Current
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground tabular-nums">
                  {new Date(t.start_date).toLocaleDateString()} → {new Date(t.end_date).toLocaleDateString()}
                </div>
              </div>
              <button onClick={() => run(delTerm({ data: { id: t.id } }))} className="h-7 w-7 grid place-items-center rounded-md hover:bg-secondary">
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          ))}
          {!terms.length && <div className="text-xs text-muted-foreground">No terms yet.</div>}
        </div>
      </Card>
    </div>
  );
}
