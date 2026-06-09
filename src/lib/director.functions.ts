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
