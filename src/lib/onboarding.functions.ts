import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// Generate a short uppercase code like "WIS-A4B9"
function shortCode(prefix: string) {
  const s = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${s}`;
}

// ---------- Get the current user's school + role + status ----------
export const getMyContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, school_id, full_name, email, phone, avatar_url, status")
      .eq("id", userId)
      .maybeSingle();
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role, school_id")
      .eq("user_id", userId);
    let school = null as null | { id: string; name: string; logo_url: string | null; school_code: string };
    if (profile?.school_id) {
      const { data: s } = await supabase
        .from("schools")
        .select("id, name, logo_url, school_code")
        .eq("id", profile.school_id)
        .maybeSingle();
      school = s ?? null;
    }
    return { profile, roles: roles ?? [], school };
  });

// ---------- Create School (Director) ----------
const CreateSchoolSchema = z.object({
  name: z.string().min(2).max(120),
  country: z.string().min(2).max(80),
  schoolType: z.string().min(2).max(80),
  contactEmail: z.string().email().max(160),
  contactPhone: z.string().min(4).max(40),
  fullName: z.string().min(2).max(120),
});

export const createSchool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CreateSchoolSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;
    const email = (claims as { email?: string } | null)?.email ?? "";
    const codes = {
      school_code: shortCode("SCH"),
      teacher_reg_code: shortCode("TCH"),
      student_reg_code: shortCode("STU"),
    };
    const { data: school, error: e1 } = await supabase
      .from("schools")
      .insert({
        name: data.name,
        country: data.country,
        school_type: data.schoolType,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone,
        created_by: userId,
        ...codes,
      })
      .select()
      .single();
    if (e1) throw new Error(e1.message);

    await supabase
      .from("profiles")
      .upsert({ id: userId, school_id: school.id, full_name: data.fullName, email, status: "active" });

    const { error: e2 } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, school_id: school.id, role: "director" });
    if (e2) throw new Error(e2.message);

    // Default grading bands
    await supabase.from("grading_bands").insert([
      { school_id: school.id, grade: "A", min_score: 80, max_score: 100, label: "Distinction", position: 1 },
      { school_id: school.id, grade: "B+", min_score: 75, max_score: 79, label: "Credit", position: 2 },
      { school_id: school.id, grade: "B", min_score: 65, max_score: 74, label: "Credit", position: 3 },
      { school_id: school.id, grade: "C", min_score: 50, max_score: 64, label: "Pass", position: 4 },
      { school_id: school.id, grade: "F", min_score: 0, max_score: 49, label: "Fail", position: 5 },
    ]);

    await supabase.from("activity_log").insert({
      school_id: school.id,
      actor_id: userId,
      kind: "school_created",
      description: `${data.fullName} created school ${data.name}`,
    });

    return { school };
  });

// ---------- Look up a school by code (used during onboarding signup) ----------
export const lookupSchool = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ schoolCode: z.string().min(2).max(40) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: school } = await supabaseAdmin
      .from("schools")
      .select("id, name, logo_url, school_code, teacher_reg_code, student_reg_code")
      .eq("school_code", data.schoolCode.trim().toUpperCase())
      .maybeSingle();
    if (!school) return { school: null as null };
    // Don't return regCodes to the caller — only use server-side for verify.
    return { school: { id: school.id, name: school.name, logo_url: school.logo_url, school_code: school.school_code } };
  });

// ---------- Verify enrollment code (student) ----------
export const verifyEnrollment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      schoolCode: z.string().min(2).max(40),
      studentRegCode: z.string().min(2).max(40),
      enrollmentCode: z.string().min(2).max(40),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: school } = await supabaseAdmin
      .from("schools")
      .select("id, name, student_reg_code")
      .eq("school_code", data.schoolCode.trim().toUpperCase())
      .maybeSingle();
    if (!school) throw new Error("School not found");
    if (school.student_reg_code !== data.studentRegCode.trim().toUpperCase())
      throw new Error("Invalid student registration code");

    const { data: ec } = await supabaseAdmin
      .from("enrollment_codes")
      .select("id, class_id, status, code, classes:class_id(id, name, level_id, levels:level_id(name, division_id, divisions:division_id(name)))")
      .eq("school_id", school.id)
      .eq("code", data.enrollmentCode.trim().toUpperCase())
      .maybeSingle();
    if (!ec) throw new Error("Enrollment code not found");
    if (ec.status !== "unused") throw new Error("This enrollment code has already been used");

    return { schoolId: school.id, schoolName: school.name, classId: ec.class_id, codeRow: ec };
  });

// ---------- Register as Teacher (after sign-up) ----------
const RegisterTeacherSchema = z.object({
  schoolCode: z.string().min(2),
  teacherRegCode: z.string().min(2),
  fullName: z.string().min(2).max(120),
  phone: z.string().min(4).max(40),
  departmentId: z.string().uuid().nullable().optional(),
  subjectIds: z.array(z.string().uuid()).default([]),
  classAssignments: z.array(z.object({ classId: z.string().uuid(), subjectId: z.string().uuid() })).default([]),
  isClassTeacher: z.boolean().default(false),
  classTeacherClassId: z.string().uuid().nullable().optional(),
});

export const registerTeacher = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RegisterTeacherSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const email = (claims as { email?: string } | null)?.email ?? "";
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: school } = await supabaseAdmin
      .from("schools")
      .select("id, teacher_reg_code")
      .eq("school_code", data.schoolCode.trim().toUpperCase())
      .maybeSingle();
    if (!school) throw new Error("School not found");
    if (school.teacher_reg_code !== data.teacherRegCode.trim().toUpperCase())
      throw new Error("Invalid teacher registration code");

    await supabaseAdmin.from("profiles").upsert({
      id: userId,
      school_id: school.id,
      full_name: data.fullName,
      email,
      phone: data.phone,
      status: "pending",
    });

    await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, school_id: school.id, role: "teacher" });

    if (data.classAssignments.length) {
      await supabaseAdmin.from("teacher_assignments").insert(
        data.classAssignments.map((ca) => ({
          school_id: school.id,
          teacher_id: userId,
          class_id: ca.classId,
          subject_id: ca.subjectId,
          department_id: data.departmentId ?? null,
        })),
      );
    }

    if (data.isClassTeacher && data.classTeacherClassId) {
      // Note: this is recorded as a request — director must approve to actually assign.
      await supabaseAdmin.from("activity_log").insert({
        school_id: school.id,
        actor_id: userId,
        kind: "class_teacher_requested",
        description: `${data.fullName} requested to be class teacher`,
        meta: { class_id: data.classTeacherClassId },
      });
    }

    await supabaseAdmin.from("activity_log").insert({
      school_id: school.id,
      actor_id: userId,
      kind: "teacher_registered",
      description: `Teacher ${data.fullName} signed up — pending approval`,
    });
    return { ok: true, schoolId: school.id };
  });

// ---------- Register as Student ----------
const RegisterStudentSchema = z.object({
  schoolCode: z.string().min(2),
  studentRegCode: z.string().min(2),
  enrollmentCode: z.string().min(2),
  fullName: z.string().min(2).max(120),
  phone: z.string().max(40).optional(),
  guardianName: z.string().max(120).optional(),
  guardianPhone: z.string().max(40).optional(),
});

export const registerStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RegisterStudentSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const email = (claims as { email?: string } | null)?.email ?? "";
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: school } = await supabaseAdmin
      .from("schools")
      .select("id, student_reg_code")
      .eq("school_code", data.schoolCode.trim().toUpperCase())
      .maybeSingle();
    if (!school) throw new Error("School not found");
    if (school.student_reg_code !== data.studentRegCode.trim().toUpperCase())
      throw new Error("Invalid student registration code");

    const code = data.enrollmentCode.trim().toUpperCase();
    const { data: ec } = await supabaseAdmin
      .from("enrollment_codes")
      .select("id, class_id, status")
      .eq("school_id", school.id)
      .eq("code", code)
      .maybeSingle();
    if (!ec) throw new Error("Enrollment code not found");
    if (ec.status !== "unused") throw new Error("Enrollment code already used");

    await supabaseAdmin.from("profiles").upsert({
      id: userId,
      school_id: school.id,
      full_name: data.fullName,
      email,
      phone: data.phone ?? null,
      status: "pending",
    });

    await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, school_id: school.id, role: "student" });

    await supabaseAdmin.from("students").upsert({
      id: userId,
      school_id: school.id,
      class_id: ec.class_id,
      enrollment_code: code,
      guardian_name: data.guardianName ?? null,
      guardian_phone: data.guardianPhone ?? null,
    });

    await supabaseAdmin
      .from("enrollment_codes")
      .update({ status: "used", used_by: userId, used_at: new Date().toISOString() })
      .eq("id", ec.id);

    await supabaseAdmin.from("activity_log").insert({
      school_id: school.id,
      actor_id: userId,
      kind: "student_registered",
      description: `Student ${data.fullName} signed up — pending approval`,
    });
    return { ok: true, schoolId: school.id };
  });
