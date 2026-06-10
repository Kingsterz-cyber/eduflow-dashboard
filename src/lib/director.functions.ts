import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getSchoolId(supabase: any, userId: string): Promise<string> {
  const { data } = await supabase.from("profiles").select("school_id").eq("id", userId).maybeSingle();
  if (!data?.school_id) throw new Error("No school context");
  return data.school_id as string;
}

// ----------- KPIs -----------
export const getDirectorKpis = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const schoolId = await getSchoolId(supabase, userId);

    const [students, teachers, classes, pending, attendance, marks] = await Promise.all([
      supabase.from("students").select("id", { count: "exact", head: true }).eq("school_id", schoolId),
      supabase.from("user_roles").select("user_id", { count: "exact", head: true }).eq("school_id", schoolId).eq("role", "teacher"),
      supabase.from("classes").select("id", { count: "exact", head: true }).eq("school_id", schoolId),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("school_id", schoolId).eq("status", "pending"),
      supabase.from("attendance").select("status").eq("school_id", schoolId).gte("date", new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)),
      supabase.from("marks").select("score, assessment_id, assessments!inner(total_marks)").eq("school_id", schoolId).limit(5000),
    ]);

    const att = attendance.data ?? [];
    const present = att.filter((a) => a.status === "present" || a.status === "late").length;
    const attendanceRate = att.length ? (present / att.length) * 100 : 0;

    const mk = (marks.data ?? []) as Array<{ score: number; assessments: { total_marks: number } | null }>;
    const pcts = mk
      .map((m) => (m.assessments?.total_marks ? (Number(m.score) / Number(m.assessments.total_marks)) * 100 : null))
      .filter((x): x is number => x !== null);
    const avgPerformance = pcts.length ? pcts.reduce((a, b) => a + b, 0) / pcts.length : 0;

    return {
      totalStudents: students.count ?? 0,
      totalTeachers: teachers.count ?? 0,
      totalClasses: classes.count ?? 0,
      pendingApprovals: pending.count ?? 0,
      attendanceRate: Math.round(attendanceRate * 10) / 10,
      avgPerformance: Math.round(avgPerformance * 10) / 10,
    };
  });

// ----------- Pending approvals -----------
export const listPendingApprovals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const schoolId = await getSchoolId(supabase, userId);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, created_at")
      .eq("school_id", schoolId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    const ids = (profiles ?? []).map((p) => p.id);
    if (!ids.length) return { teachers: [], students: [] };

    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .in("user_id", ids)
      .eq("school_id", schoolId);

    const byUser = new Map<string, string>();
    (roles ?? []).forEach((r) => byUser.set(r.user_id, r.role as string));

    const teachers = (profiles ?? []).filter((p) => byUser.get(p.id) === "teacher");
    const students = (profiles ?? []).filter((p) => byUser.get(p.id) === "student");
    return { teachers, students };
  });

export const decideApproval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ userId: z.string().uuid(), approve: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const schoolId = await getSchoolId(supabase, userId);

    // Must be director
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("school_id", schoolId)
      .eq("role", "director")
      .maybeSingle();
    if (!role) throw new Error("Only the Director can approve users");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const status = data.approve ? "active" : "rejected";
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ status })
      .eq("id", data.userId)
      .eq("school_id", schoolId);
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("audit_log").insert({
      school_id: schoolId,
      actor_id: userId,
      action: data.approve ? "approve_user" : "reject_user",
      entity_type: "profile",
      entity_id: data.userId,
    });

    await supabaseAdmin.from("notifications").insert({
      user_id: data.userId,
      school_id: schoolId,
      type: "approval",
      title: data.approve ? "Your account was approved" : "Your registration was rejected",
      body: data.approve ? "Welcome aboard — you now have full access." : "Please contact your school administration.",
      link: "/app",
    });
    return { ok: true };
  });

// ----------- Activity feed -----------
export const listRecentActivity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const schoolId = await getSchoolId(supabase, userId);
    const { data } = await supabase
      .from("activity_log")
      .select("id, kind, description, created_at, actor_id")
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false })
      .limit(20);
    return { items: data ?? [] };
  });

// ----------- Announcements -----------
export const listAnnouncements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const schoolId = await getSchoolId(supabase, userId);
    const { data } = await supabase
      .from("announcements")
      .select("id, title, body, audience_roles, audience_class_ids, published_at, author_id")
      .eq("school_id", schoolId)
      .order("published_at", { ascending: false })
      .limit(50);
    return { items: data ?? [] };
  });

export const createAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      title: z.string().min(2).max(160),
      body: z.string().min(2).max(4000),
      audienceRoles: z.array(z.enum(["director", "dos", "teacher", "student"])).default([]),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const schoolId = await getSchoolId(supabase, userId);
    const { error, data: row } = await supabase
      .from("announcements")
      .insert({
        school_id: schoolId,
        author_id: userId,
        title: data.title,
        body: data.body,
        audience_roles: data.audienceRoles,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { announcement: row };
  });

// ----------- Growth (last 12 months) -----------
export const getStudentGrowth = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const schoolId = await getSchoolId(supabase, userId);
    const { data } = await supabase
      .from("students")
      .select("created_at")
      .eq("school_id", schoolId)
      .order("created_at", { ascending: true });
    const buckets = new Array(12).fill(0);
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    (data ?? []).forEach((s) => {
      const d = new Date(s.created_at);
      const idx = (d.getFullYear() - startMonth.getFullYear()) * 12 + (d.getMonth() - startMonth.getMonth());
      if (idx >= 0 && idx < 12) buckets[idx] += 1;
    });
    // cumulative
    let total = 0;
    const baseline = (data ?? []).filter((s) => new Date(s.created_at) < startMonth).length;
    total = baseline;
    const series = buckets.map((b) => (total += b));
    return { series };
  });

// =========================================================================
// Director: Staff
// =========================================================================
export const listStaff = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const schoolId = await getSchoolId(supabase, userId);
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .eq("school_id", schoolId)
      .in("role", ["dos", "teacher"]);
    const ids = Array.from(new Set((roles ?? []).map((r) => r.user_id)));
    if (!ids.length) return { items: [] };
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, status, created_at")
      .in("id", ids);
    const { data: ta } = await supabase
      .from("teacher_assignments")
      .select("teacher_id, class_id, subject_id, is_class_teacher")
      .eq("school_id", schoolId)
      .in("teacher_id", ids);
    const byUser = new Map<string, { role: string; assignments: number; classTeacher: boolean }>();
    (roles ?? []).forEach((r) => {
      const cur = byUser.get(r.user_id);
      if (!cur || (cur.role === "teacher" && r.role === "dos")) {
        byUser.set(r.user_id, { role: r.role, assignments: 0, classTeacher: false });
      }
    });
    (ta ?? []).forEach((a) => {
      const cur = byUser.get(a.teacher_id);
      if (cur) {
        cur.assignments += 1;
        if (a.is_class_teacher) cur.classTeacher = true;
      }
    });
    const items = (profiles ?? []).map((p) => ({
      ...p,
      role: byUser.get(p.id)?.role ?? "teacher",
      assignments: byUser.get(p.id)?.assignments ?? 0,
      is_class_teacher: byUser.get(p.id)?.classTeacher ?? false,
    }));
    return { items };
  });

export const setStaffStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ userId: z.string().uuid(), status: z.enum(["active", "inactive"]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const schoolId = await getSchoolId(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ status: data.status })
      .eq("id", data.userId)
      .eq("school_id", schoolId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// =========================================================================
// Director: Students (school-wide, with class info)
// =========================================================================
export const listSchoolStudents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const schoolId = await getSchoolId(supabase, userId);
    const { data: students } = await supabase
      .from("students")
      .select("id, first_name, last_name, class_id, gender, enrollment_code, created_at, phone, photo_url")
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false });
    const ids = (students ?? []).map((s) => s.id);
    const { data: profs } = ids.length
      ? await supabase.from("profiles").select("id, full_name, email, status").in("id", ids)
      : { data: [] as Array<{ id: string; full_name: string; email: string; status: string }> };
    const byId = new Map((profs ?? []).map((p) => [p.id, p]));
    const items = (students ?? []).map((s) => {
      const p = byId.get(s.id);
      const name =
        [s.first_name, s.last_name].filter(Boolean).join(" ").trim() ||
        p?.full_name ||
        p?.email ||
        "Unnamed";
      return {
        id: s.id,
        name,
        email: p?.email ?? "",
        status: p?.status ?? "active",
        class_id: s.class_id,
        gender: s.gender,
        enrollment_code: s.enrollment_code,
        photo_url: s.photo_url,
        created_at: s.created_at,
      };
    });
    return { items };
  });

// =========================================================================
// Director: School setup (full academic structure)
// =========================================================================
export const getSchoolSetup = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const schoolId = await getSchoolId(supabase, userId);
    const [school, divisions, levels, classes, departments, subjects, terms, bands] = await Promise.all([
      supabase.from("schools").select("*").eq("id", schoolId).maybeSingle(),
      supabase.from("divisions").select("*").eq("school_id", schoolId).order("position"),
      supabase.from("levels").select("*").eq("school_id", schoolId).order("position"),
      supabase.from("classes").select("*").eq("school_id", schoolId).order("name"),
      supabase.from("departments").select("*").eq("school_id", schoolId).order("name"),
      supabase.from("subjects").select("*").eq("school_id", schoolId).order("name"),
      supabase.from("terms").select("*").eq("school_id", schoolId).order("start_date", { ascending: false }),
      supabase.from("grading_bands").select("*").eq("school_id", schoolId).order("position"),
    ]);
    return {
      school: school.data,
      divisions: divisions.data ?? [],
      levels: levels.data ?? [],
      classes: classes.data ?? [],
      departments: departments.data ?? [],
      subjects: subjects.data ?? [],
      terms: terms.data ?? [],
      gradingBands: bands.data ?? [],
    };
  });

export const updateSchool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      name: z.string().min(2).max(160).optional(),
      contact_email: z.string().email().optional().or(z.literal("")),
      contact_phone: z.string().max(40).optional().or(z.literal("")),
      country: z.string().max(80).optional().or(z.literal("")),
      school_type: z.string().max(40).optional().or(z.literal("")),
      logo_url: z.string().url().optional().or(z.literal("")),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const schoolId = await getSchoolId(context.supabase, context.userId);
    const { error } = await context.supabase.from("schools").update(data).eq("id", schoolId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ----- Divisions/Levels/Classes/Departments/Subjects -----
const idSchema = z.object({ id: z.string().uuid() });

export const upsertDivision = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid().optional(), name: z.string().min(1).max(80), position: z.number().int().default(0) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const schoolId = await getSchoolId(context.supabase, context.userId);
    const row = { ...data, school_id: schoolId };
    const { error } = await context.supabase.from("divisions").upsert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteDivision = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idSchema.parse(d))
  .handler(async ({ data, context }) => {
    const schoolId = await getSchoolId(context.supabase, context.userId);
    await context.supabase.from("divisions").delete().eq("id", data.id).eq("school_id", schoolId);
    return { ok: true };
  });

export const upsertLevel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid().optional(),
      division_id: z.string().uuid(),
      name: z.string().min(1).max(80),
      position: z.number().int().default(0),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const schoolId = await getSchoolId(context.supabase, context.userId);
    const { error } = await context.supabase.from("levels").upsert({ ...data, school_id: schoolId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteLevel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idSchema.parse(d))
  .handler(async ({ data, context }) => {
    const schoolId = await getSchoolId(context.supabase, context.userId);
    await context.supabase.from("levels").delete().eq("id", data.id).eq("school_id", schoolId);
    return { ok: true };
  });

export const upsertClass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid().optional(),
      level_id: z.string().uuid(),
      name: z.string().min(1).max(80),
      class_teacher_id: z.string().uuid().optional().nullable(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const schoolId = await getSchoolId(context.supabase, context.userId);
    const { error } = await context.supabase.from("classes").upsert({ ...data, school_id: schoolId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteClass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idSchema.parse(d))
  .handler(async ({ data, context }) => {
    const schoolId = await getSchoolId(context.supabase, context.userId);
    await context.supabase.from("classes").delete().eq("id", data.id).eq("school_id", schoolId);
    return { ok: true };
  });

export const upsertDepartment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid().optional(), name: z.string().min(1).max(80) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const schoolId = await getSchoolId(context.supabase, context.userId);
    const { error } = await context.supabase.from("departments").upsert({ ...data, school_id: schoolId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteDepartment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idSchema.parse(d))
  .handler(async ({ data, context }) => {
    const schoolId = await getSchoolId(context.supabase, context.userId);
    await context.supabase.from("departments").delete().eq("id", data.id).eq("school_id", schoolId);
    return { ok: true };
  });

export const upsertSubject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid().optional(),
      name: z.string().min(1).max(80),
      department_id: z.string().uuid().nullable().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const schoolId = await getSchoolId(context.supabase, context.userId);
    const { error } = await context.supabase.from("subjects").upsert({ ...data, school_id: schoolId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteSubject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idSchema.parse(d))
  .handler(async ({ data, context }) => {
    const schoolId = await getSchoolId(context.supabase, context.userId);
    await context.supabase.from("subjects").delete().eq("id", data.id).eq("school_id", schoolId);
    return { ok: true };
  });

export const upsertTerm = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid().optional(),
      name: z.string().min(1).max(80),
      start_date: z.string(),
      end_date: z.string(),
      is_current: z.boolean().default(false),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const schoolId = await getSchoolId(context.supabase, context.userId);
    if (data.is_current) {
      await context.supabase.from("terms").update({ is_current: false }).eq("school_id", schoolId);
    }
    const { error } = await context.supabase.from("terms").upsert({ ...data, school_id: schoolId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteTerm = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idSchema.parse(d))
  .handler(async ({ data, context }) => {
    const schoolId = await getSchoolId(context.supabase, context.userId);
    await context.supabase.from("terms").delete().eq("id", data.id).eq("school_id", schoolId);
    return { ok: true };
  });

// ----- Grading bands -----
export const replaceGradingBands = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      bands: z.array(z.object({
        grade: z.string().min(1).max(4),
        label: z.string().max(40).optional().nullable(),
        min_score: z.number().min(0).max(100),
        max_score: z.number().min(0).max(100),
      })).min(1).max(20),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const schoolId = await getSchoolId(context.supabase, context.userId);
    await context.supabase.from("grading_bands").delete().eq("school_id", schoolId);
    const rows = data.bands.map((b, i) => ({ ...b, school_id: schoolId, position: i }));
    const { error } = await context.supabase.from("grading_bands").insert(rows);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ----- Enrollment codes -----
function makeCode(prefix: string) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${s}`;
}

export const generateEnrollmentCodes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ classId: z.string().uuid(), count: z.number().int().min(1).max(200) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const schoolId = await getSchoolId(context.supabase, context.userId);
    const rows = Array.from({ length: data.count }, () => ({
      school_id: schoolId,
      class_id: data.classId,
      code: makeCode("STU"),
      created_by: context.userId,
    }));
    const { data: inserted, error } = await context.supabase
      .from("enrollment_codes")
      .insert(rows)
      .select("code");
    if (error) throw new Error(error.message);
    return { codes: (inserted ?? []).map((r) => r.code) };
  });

export const listEnrollmentCodes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ classId: z.string().uuid().optional() }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const schoolId = await getSchoolId(context.supabase, context.userId);
    let q = context.supabase
      .from("enrollment_codes")
      .select("id, code, status, class_id, used_by, used_at, created_at")
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.classId) q = q.eq("class_id", data.classId);
    const { data: rows } = await q;
    return { items: rows ?? [] };
  });
