import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SB = any;

async function getSchoolId(supabase: SB, userId: string): Promise<string> {
  const { data } = await supabase.from("profiles").select("school_id").eq("id", userId).maybeSingle();
  if (!data?.school_id) throw new Error("No school context");
  return data.school_id as string;
}

function pct(num: number, den: number) {
  return den > 0 ? Math.round((num / den) * 1000) / 10 : 0;
}

// ---------- KPIs ----------
export const getDosKpis = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const schoolId = await getSchoolId(supabase, userId);
    const since30 = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);

    const [att, marks, teachers, classes, students] = await Promise.all([
      supabase.from("attendance").select("status, date").eq("school_id", schoolId).gte("date", since30),
      supabase.from("marks").select("score, created_at, assessments!inner(total_marks)").eq("school_id", schoolId).limit(5000),
      supabase.from("user_roles").select("user_id", { count: "exact", head: true }).eq("school_id", schoolId).eq("role", "teacher"),
      supabase.from("classes").select("id", { count: "exact", head: true }).eq("school_id", schoolId),
      supabase.from("students").select("id", { count: "exact", head: true }).eq("school_id", schoolId),
    ]);

    const aRows = (att.data ?? []) as { status: string; date: string }[];
    const present = aRows.filter((r) => r.status === "present" || r.status === "late").length;
    const attendanceRate = pct(present, aRows.length);

    const mRows = (marks.data ?? []) as { score: number; created_at: string; assessments: { total_marks: number } | null }[];
    const pcts = mRows
      .map((m) => (m.assessments?.total_marks ? (Number(m.score) / Number(m.assessments.total_marks)) * 100 : null))
      .filter((x): x is number => x !== null);
    const avgScore = pcts.length ? Math.round((pcts.reduce((a, b) => a + b, 0) / pcts.length) * 10) / 10 : 0;
    const passRate = pcts.length ? pct(pcts.filter((p) => p >= 50).length, pcts.length) : 0;

    const marksToday = mRows.filter((m) => (m.created_at ?? "").slice(0, 10) === today).length;

    return {
      attendanceRate,
      avgScore,
      passRate,
      marksToday,
      totalTeachers: teachers.count ?? 0,
      totalClasses: classes.count ?? 0,
      totalStudents: students.count ?? 0,
    };
  });

// ---------- 52-week attendance heatmap ----------
export const getAttendanceHeatmap = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const schoolId = await getSchoolId(supabase, userId);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 52 * 7);
    const startStr = startDate.toISOString().slice(0, 10);

    const { data } = await supabase
      .from("attendance")
      .select("date, status")
      .eq("school_id", schoolId)
      .gte("date", startStr)
      .limit(50000);

    const byDate = new Map<string, { p: number; t: number }>();
    for (const r of (data ?? []) as { date: string; status: string }[]) {
      const k = r.date;
      const cur = byDate.get(k) ?? { p: 0, t: 0 };
      cur.t += 1;
      if (r.status === "present" || r.status === "late") cur.p += 1;
      byDate.set(k, cur);
    }

    const weeks: number[][] = [];
    for (let w = 0; w < 52; w++) {
      const week: number[] = [];
      for (let d = 0; d < 7; d++) {
        const dt = new Date(startDate);
        dt.setDate(startDate.getDate() + w * 7 + d);
        const key = dt.toISOString().slice(0, 10);
        const v = byDate.get(key);
        if (!v) week.push(0);
        else {
          const r = v.p / v.t;
          week.push(r >= 0.95 ? 4 : r >= 0.85 ? 3 : r >= 0.7 ? 2 : r >= 0.4 ? 1 : 0);
        }
      }
      weeks.push(week);
    }
    return weeks;
  });

// ---------- 12-week trends ----------
export const getWeeklyTrends = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const schoolId = await getSchoolId(supabase, userId);
    const start = new Date();
    start.setDate(start.getDate() - 12 * 7);
    const startStr = start.toISOString().slice(0, 10);

    const [att, marks] = await Promise.all([
      supabase.from("attendance").select("date, status").eq("school_id", schoolId).gte("date", startStr).limit(50000),
      supabase
        .from("marks")
        .select("created_at, score, assessments!inner(total_marks)")
        .eq("school_id", schoolId)
        .gte("created_at", start.toISOString())
        .limit(20000),
    ]);

    const attendance = Array.from({ length: 12 }, () => ({ p: 0, t: 0 }));
    for (const r of (att.data ?? []) as { date: string; status: string }[]) {
      const w = Math.floor((new Date(r.date).getTime() - start.getTime()) / (7 * 86400000));
      if (w < 0 || w >= 12) continue;
      attendance[w].t += 1;
      if (r.status === "present" || r.status === "late") attendance[w].p += 1;
    }
    const performance = Array.from({ length: 12 }, () => ({ s: 0, n: 0 }));
    for (const m of (marks.data ?? []) as { created_at: string; score: number; assessments: { total_marks: number } | null }[]) {
      const w = Math.floor((new Date(m.created_at).getTime() - start.getTime()) / (7 * 86400000));
      if (w < 0 || w >= 12) continue;
      const tot = m.assessments?.total_marks;
      if (!tot) continue;
      performance[w].s += (Number(m.score) / Number(tot)) * 100;
      performance[w].n += 1;
    }

    return {
      attendanceTrend: attendance.map((x) => (x.t ? Math.round((x.p / x.t) * 1000) / 10 : 0)),
      performanceTrend: performance.map((x) => (x.n ? Math.round((x.s / x.n) * 10) / 10 : 0)),
    };
  });

// ---------- Class rankings ----------
export const getClassRankings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const schoolId = await getSchoolId(supabase, userId);

    const [classes, att, marks, students] = await Promise.all([
      supabase.from("classes").select("id, name, level_id, levels(name, division_id, divisions(name))").eq("school_id", schoolId),
      supabase.from("attendance").select("class_id, status").eq("school_id", schoolId).limit(50000),
      supabase
        .from("marks")
        .select("score, assessments!inner(class_id, total_marks)")
        .eq("school_id", schoolId)
        .limit(20000),
      supabase.from("students").select("class_id").eq("school_id", schoolId),
    ]);

    const attMap = new Map<string, { p: number; t: number }>();
    for (const r of (att.data ?? []) as { class_id: string; status: string }[]) {
      if (!r.class_id) continue;
      const c = attMap.get(r.class_id) ?? { p: 0, t: 0 };
      c.t += 1;
      if (r.status === "present" || r.status === "late") c.p += 1;
      attMap.set(r.class_id, c);
    }
    const markMap = new Map<string, { s: number; n: number }>();
    for (const m of (marks.data ?? []) as { score: number; assessments: { class_id: string; total_marks: number } | null }[]) {
      const cid = m.assessments?.class_id;
      const tot = m.assessments?.total_marks;
      if (!cid || !tot) continue;
      const c = markMap.get(cid) ?? { s: 0, n: 0 };
      c.s += (Number(m.score) / Number(tot)) * 100;
      c.n += 1;
      markMap.set(cid, c);
    }
    const stuCounts = new Map<string, number>();
    for (const s of (students.data ?? []) as { class_id: string | null }[]) {
      if (!s.class_id) continue;
      stuCounts.set(s.class_id, (stuCounts.get(s.class_id) ?? 0) + 1);
    }

    return (classes.data ?? []).map((c: SB) => {
      const a = attMap.get(c.id);
      const m = markMap.get(c.id);
      return {
        id: c.id,
        name: c.name,
        level: c.levels?.name ?? "",
        division: c.levels?.divisions?.name ?? "",
        students: stuCounts.get(c.id) ?? 0,
        attendance: a && a.t ? Math.round((a.p / a.t) * 1000) / 10 : 0,
        avg: m && m.n ? Math.round((m.s / m.n) * 10) / 10 : 0,
      };
    }).sort((a, b) => b.avg - a.avg);
  });

// ---------- Subject rankings ----------
export const getSubjectRankings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const schoolId = await getSchoolId(supabase, userId);

    const [subjects, marks, assignments] = await Promise.all([
      supabase.from("subjects").select("id, name, department_id, departments(name)").eq("school_id", schoolId),
      supabase
        .from("marks")
        .select("score, assessments!inner(subject_id, total_marks)")
        .eq("school_id", schoolId)
        .limit(20000),
      supabase.from("teacher_assignments").select("subject_id, class_id, teacher_id").eq("school_id", schoolId),
    ]);

    const stats = new Map<string, { s: number; n: number; pass: number }>();
    for (const m of (marks.data ?? []) as { score: number; assessments: { subject_id: string; total_marks: number } | null }[]) {
      const sid = m.assessments?.subject_id;
      const tot = m.assessments?.total_marks;
      if (!sid || !tot) continue;
      const p = (Number(m.score) / Number(tot)) * 100;
      const c = stats.get(sid) ?? { s: 0, n: 0, pass: 0 };
      c.s += p;
      c.n += 1;
      if (p >= 50) c.pass += 1;
      stats.set(sid, c);
    }
    const teacherCounts = new Map<string, Set<string>>();
    const classCounts = new Map<string, Set<string>>();
    for (const a of (assignments.data ?? []) as { subject_id: string; class_id: string; teacher_id: string }[]) {
      if (!teacherCounts.has(a.subject_id)) teacherCounts.set(a.subject_id, new Set());
      if (!classCounts.has(a.subject_id)) classCounts.set(a.subject_id, new Set());
      teacherCounts.get(a.subject_id)!.add(a.teacher_id);
      classCounts.get(a.subject_id)!.add(a.class_id);
    }

    return (subjects.data ?? []).map((s: SB) => {
      const c = stats.get(s.id);
      return {
        id: s.id,
        name: s.name,
        department: s.departments?.name ?? "",
        teachers: teacherCounts.get(s.id)?.size ?? 0,
        classes: classCounts.get(s.id)?.size ?? 0,
        average: c && c.n ? Math.round((c.s / c.n) * 10) / 10 : 0,
        passRate: c && c.n ? Math.round((c.pass / c.n) * 1000) / 10 : 0,
      };
    }).sort((a, b) => b.average - a.average);
  });

// ---------- Students at risk ----------
export const getStudentsAtRisk = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const schoolId = await getSchoolId(supabase, userId);

    const [students, att, marks] = await Promise.all([
      supabase
        .from("students")
        .select("id, first_name, last_name, class_id, classes(name)")
        .eq("school_id", schoolId),
      supabase.from("attendance").select("student_id, status").eq("school_id", schoolId).limit(50000),
      supabase
        .from("marks")
        .select("student_id, score, assessments!inner(total_marks)")
        .eq("school_id", schoolId)
        .limit(20000),
    ]);

    const attMap = new Map<string, { p: number; t: number }>();
    for (const r of (att.data ?? []) as { student_id: string; status: string }[]) {
      const c = attMap.get(r.student_id) ?? { p: 0, t: 0 };
      c.t += 1;
      if (r.status === "present" || r.status === "late") c.p += 1;
      attMap.set(r.student_id, c);
    }
    const markMap = new Map<string, { s: number; n: number }>();
    for (const m of (marks.data ?? []) as { student_id: string; score: number; assessments: { total_marks: number } | null }[]) {
      const tot = m.assessments?.total_marks;
      if (!tot) continue;
      const c = markMap.get(m.student_id) ?? { s: 0, n: 0 };
      c.s += (Number(m.score) / Number(tot)) * 100;
      c.n += 1;
      markMap.set(m.student_id, c);
    }

    const out = [];
    for (const s of (students.data ?? []) as SB[]) {
      const a = attMap.get(s.id);
      const m = markMap.get(s.id);
      const attendance = a && a.t ? (a.p / a.t) * 100 : 100;
      const avg = m && m.n ? m.s / m.n : 100;
      if (attendance < 78 || avg < 55) {
        out.push({
          id: s.id,
          name: [s.first_name, s.last_name].filter(Boolean).join(" ") || "Unnamed",
          className: s.classes?.name ?? "—",
          attendance: Math.round(attendance * 10) / 10,
          average: Math.round(avg * 10) / 10,
          reason: attendance < 78 && avg < 55 ? "Low attendance & low average" : attendance < 78 ? "Low attendance" : "Low average",
        });
      }
    }
    return out.sort((a, b) => a.average - b.average).slice(0, 50);
  });

// ---------- Teacher activity ----------
export const getTeacherActivity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const schoolId = await getSchoolId(supabase, userId);
    const since = new Date(Date.now() - 30 * 86400000).toISOString();

    const [teachers, marks, att, assignments] = await Promise.all([
      supabase
        .from("user_roles")
        .select("user_id, profiles!inner(id, full_name, email, status)")
        .eq("school_id", schoolId)
        .eq("role", "teacher"),
      supabase.from("marks").select("recorded_by, created_at").eq("school_id", schoolId).gte("created_at", since).limit(20000),
      supabase.from("attendance").select("recorded_by, created_at").eq("school_id", schoolId).gte("created_at", since).limit(50000),
      supabase.from("teacher_assignments").select("teacher_id, class_id, subject_id, is_class_teacher").eq("school_id", schoolId),
    ]);

    const mCnt = new Map<string, number>();
    for (const r of (marks.data ?? []) as { recorded_by: string }[]) if (r.recorded_by) mCnt.set(r.recorded_by, (mCnt.get(r.recorded_by) ?? 0) + 1);
    const aCnt = new Map<string, number>();
    for (const r of (att.data ?? []) as { recorded_by: string }[]) if (r.recorded_by) aCnt.set(r.recorded_by, (aCnt.get(r.recorded_by) ?? 0) + 1);
    const assign = new Map<string, { classes: Set<string>; subjects: Set<string>; classTeacher: boolean }>();
    for (const a of (assignments.data ?? []) as SB[]) {
      const cur = assign.get(a.teacher_id) ?? { classes: new Set(), subjects: new Set(), classTeacher: false };
      cur.classes.add(a.class_id);
      cur.subjects.add(a.subject_id);
      if (a.is_class_teacher) cur.classTeacher = true;
      assign.set(a.teacher_id, cur);
    }

    const rows = (teachers.data ?? []).map((t: SB) => {
      const m = mCnt.get(t.user_id) ?? 0;
      const a = aCnt.get(t.user_id) ?? 0;
      const asn = assign.get(t.user_id);
      const activity = Math.min(100, Math.round(((m + a) / 20) * 100));
      return {
        id: t.user_id,
        name: t.profiles?.full_name ?? t.profiles?.email ?? "Unnamed",
        email: t.profiles?.email ?? "",
        status: t.profiles?.status ?? "active",
        classes: asn?.classes.size ?? 0,
        subjects: asn?.subjects.size ?? 0,
        isClassTeacher: asn?.classTeacher ?? false,
        marks30d: m,
        attendance30d: a,
        activity,
      };
    });
    return rows.sort((a, b) => b.activity - a.activity);
  });

// ---------- Grade distribution ----------
export const getGradeDistribution = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const schoolId = await getSchoolId(supabase, userId);

    const [marks, bands] = await Promise.all([
      supabase
        .from("marks")
        .select("score, assessments!inner(total_marks)")
        .eq("school_id", schoolId)
        .limit(20000),
      supabase.from("grading_bands").select("grade, min_score, max_score").eq("school_id", schoolId).order("min_score", { ascending: false }),
    ]);

    const bandsArr = ((bands.data ?? []) as { grade: string; min_score: number; max_score: number }[]) || [];
    const counts = new Map<string, number>();
    for (const b of bandsArr) counts.set(b.grade, 0);
    let total = 0;
    for (const m of (marks.data ?? []) as { score: number; assessments: { total_marks: number } | null }[]) {
      const tot = m.assessments?.total_marks;
      if (!tot) continue;
      const p = (Number(m.score) / Number(tot)) * 100;
      const band = bandsArr.find((b) => p >= Number(b.min_score) && p <= Number(b.max_score));
      if (band) {
        counts.set(band.grade, (counts.get(band.grade) ?? 0) + 1);
        total += 1;
      }
    }
    return { total, grades: Array.from(counts.entries()).map(([g, count]) => ({ grade: g, count })) };
  });

// ---------- Class details (for /dos/classes drill) ----------
export const getClassDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { classId: string }) => z.object({ classId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const schoolId = await getSchoolId(supabase, userId);
    const classId = data.classId;

    const [cls, students, att, marks] = await Promise.all([
      supabase.from("classes").select("id, name, levels(name)").eq("school_id", schoolId).eq("id", classId).maybeSingle(),
      supabase
        .from("students")
        .select("id, first_name, last_name, photo_url")
        .eq("school_id", schoolId)
        .eq("class_id", classId)
        .order("last_name"),
      supabase.from("attendance").select("student_id, status, date").eq("school_id", schoolId).eq("class_id", classId).limit(20000),
      supabase
        .from("marks")
        .select("student_id, score, assessments!inner(class_id, subject_id, total_marks, subjects(name))")
        .eq("school_id", schoolId)
        .limit(20000),
    ]);

    const mClass = ((marks.data ?? []) as SB[]).filter((m) => m.assessments?.class_id === classId);

    const studentRows = (students.data ?? []).map((s: SB) => {
      const a = ((att.data ?? []) as SB[]).filter((r) => r.student_id === s.id);
      const m = mClass.filter((r) => r.student_id === s.id);
      const attRate = a.length ? (a.filter((x) => x.status === "present" || x.status === "late").length / a.length) * 100 : 0;
      const avg = m.length
        ? m.reduce((acc, x) => acc + (Number(x.score) / Number(x.assessments.total_marks)) * 100, 0) / m.length
        : 0;
      return {
        id: s.id,
        name: [s.first_name, s.last_name].filter(Boolean).join(" ") || "Unnamed",
        attendance: Math.round(attRate * 10) / 10,
        average: Math.round(avg * 10) / 10,
        status: avg >= 80 ? "honors" : avg < 55 || attRate < 78 ? "at-risk" : "active",
      };
    });

    const bySubject = new Map<string, { name: string; s: number; n: number }>();
    for (const m of mClass) {
      const sid = m.assessments?.subject_id;
      const tot = m.assessments?.total_marks;
      if (!sid || !tot) continue;
      const cur = bySubject.get(sid) ?? { name: m.assessments.subjects?.name ?? "Subject", s: 0, n: 0 };
      cur.s += (Number(m.score) / Number(tot)) * 100;
      cur.n += 1;
      bySubject.set(sid, cur);
    }
    const subjectAverages = Array.from(bySubject.values()).map((v) => ({ name: v.name, value: Math.round((v.s / v.n) * 10) / 10 }));

    return {
      id: classId,
      name: cls.data?.name ?? "Class",
      level: cls.data?.levels?.name ?? "",
      students: studentRows,
      subjectAverages,
      attendanceRate: studentRows.length
        ? Math.round((studentRows.reduce((a, b) => a + b.attendance, 0) / studentRows.length) * 10) / 10
        : 0,
      avgScore: studentRows.length
        ? Math.round((studentRows.reduce((a, b) => a + b.average, 0) / studentRows.length) * 10) / 10
        : 0,
    };
  });
