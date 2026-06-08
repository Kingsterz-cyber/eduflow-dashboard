
# EduFlow — Real Multi-School SaaS Build Plan

The current app is a UI prototype using deterministic mock data. This plan replaces it with a real, multi-tenant backend on **Lovable Cloud** (Postgres + Auth + RLS), real auth flows, and end-to-end workflows behind every screen.

This is a large build. I'll execute it in 4 sequenced phases so you can review meaningful milestones. Each phase ends with a working, testable surface.

---

## Phase 1 — Foundation: Cloud, Auth, Multi-Tenancy

### Enable Lovable Cloud
Provisions Postgres + Auth. All data isolated per `school_id`.

### Database (migrations)

**Tenancy & identity**
- `schools` — name, logo_url, country, type, school_code (unique), teacher_reg_code, student_reg_code, contact info, created_by
- `profiles` — id (=auth.uid), school_id, full_name, email, phone, avatar_url, status (`pending`|`active`|`rejected`)
- `app_role` enum: `director`, `dos`, `teacher`, `student`
- `user_roles` — user_id, school_id, role (separate table — security best practice)

**Academic structure (fully dynamic, no hardcoded O/A-Level)**
- `divisions` — school_id, name, order ("Primary", "Secondary", "Advanced", custom…)
- `levels` — division_id, name, order ("P1"…"S6"…custom)
- `classes` — level_id, name ("S2A"), class_teacher_id (nullable)
- `departments` — school_id, name
- `subjects` — school_id, department_id, name

**Teaching assignments**
- `teacher_subjects` — teacher_id, subject_id
- `teacher_classes` — teacher_id, class_id, subject_id (which subject they teach to which class)
- `students` — profile_id, class_id, enrollment_code (unique per school), guardian info
- `enrollment_codes` — class_id, code (`S2A-001`), status (`unused`|`used`), used_by

**Academic data**
- `terms` — school_id, name, start_date, end_date, is_current
- `assessments` — class_id, subject_id, teacher_id, term_id, name, type (`CAT`|`Quiz`|`Exam`|`Assignment`), total_marks, date
- `marks` — assessment_id, student_id, score
- `attendance` — class_id, student_id, date, status (`present`|`absent`|`late`|`excused`), recorded_by
- `grading_bands` — school_id, grade, min, max, label
- `announcements` — school_id, author_id, title, body, audience (role/class), published_at
- `approvals_log`, `activity_log` for audit

### RLS (every table)
- `has_role(uid, school_id, role)` SECURITY DEFINER function (avoids recursion)
- `current_school_id()` helper from JWT/profile
- Policies scoped by `school_id`. Examples:
  - Students: SELECT own marks/attendance only
  - Teachers: SELECT/INSERT marks for `(class, subject)` they teach
  - Class teachers: extra read access across all subjects for their class
  - DOS: read everything academic in their school
  - Director: full school-scoped read + approvals + settings

### Auth flows (real, replacing demo role switcher)
- `/auth` — Email + password sign in / sign up (default + Google sign-in via Lovable broker)
- `/onboarding/school` — Director: creates school (returns codes)
- `/onboarding/teacher` — School code → teacher reg code → form → department/subjects/classes → class-teacher toggle → pending
- `/onboarding/student` — School code → student reg code → enrollment code (auto-resolves class) → pending
- `_authenticated` layout (integration-managed) gates `/app/*`
- Role detected from `user_roles`, not localStorage. Role switcher removed (kept only as dev-only override behind a flag).

---

## Phase 2 — Director + School Setup

- **School Settings**: branding, codes (rotate), academic year/terms, grading bands
- **Academic Structure builder**: tree UI to create Divisions → Levels → Classes (drag/reorder, rename, delete with confirmation)
- **Departments & Subjects** manager
- **Approvals**: real pending teachers + students list, approve/reject → flips `profiles.status` and writes audit row
- **Staff**: real teachers list from DB, filters, assign/unassign class-teacher role, deactivate
- **Students**: class tree from real classes; per-class roster
- **Announcements**: composer with audience targeting (roles, specific classes), reads counter
- **Reports**: queue + generated PDF list (server-fn generates report data; PDF rendering stub returns JSON spec for now)
- **Dashboard KPIs**: real counts via server functions

---

## Phase 3 — Teacher + Class Teacher

- **My Teaching Classes**: real list from `teacher_classes`
- **Class Workspace** (per class): Overview, Students, Attendance, Assessments, Marks, Analytics, Reports
- **Attendance**: roster pulled from `students`, present/absent/late toggles, upsert into `attendance`, history view, % per student
- **Assessments**: create CAT/Quiz/Exam with total marks; list with status
- **Marks entry**: spreadsheet-style grid keyed by `(assessment, student)`, autosave, auto totals/averages/grades from `grading_bands`
- **Class Teacher–only tabs** (gated by `classes.class_teacher_id = auth.uid()`):
  - **Enrollment Codes**: generate batch (`S2A-001…NNN`), copy, status (unused/used/registered), revoke
  - **Reports**: generate per-student report card that aggregates marks across all subject teachers for the class + attendance + rank + comments box
- **Announcements** scoped to teacher's classes

---

## Phase 4 — DOS + Student + Real-time

- **DOS**: academic analytics powered by SQL aggregations (avg by class/subject, pass rate, at-risk students = avg < threshold OR attendance < threshold), attendance heatmap from real `attendance`, teacher activity from recent marks/attendance inserts
- **Student**: own attendance %, own marks per subject, own rank within class (window function), own report cards, announcements feed
- **Real-time**: Supabase Realtime channels on `marks`, `attendance`, `announcements`, `approvals` → dashboards refresh live
- **Notifications**: in-app bell driven by `notifications` table + realtime
- Empty / loading / error states everywhere
- Remove all mock data from `src/lib/eduflow-data.ts` (kept as types only or deleted)

---

## Technical notes

- **Server functions** (`createServerFn` + `requireSupabaseAuth`) for all mutations and aggregated reads. Reports use admin client server-side for cross-user aggregation within a school.
- **TanStack Query + Suspense** for all reads; loaders prime cache.
- **Realtime** via browser supabase client subscriptions inside components.
- **Validation** with Zod on every server fn input.
- **No Edge Functions** — all logic in TanStack server fns / routes.
- Existing landing page untouched.

## Out of scope (will confirm if you want them in)

- Real PDF rendering (will return structured JSON; PDF can be added later)
- SMS/email notifications
- Parent portal
- Billing / subscriptions
- File uploads beyond school logo

## Deliverable cadence

I'll ship Phase 1 first (Cloud + schema + RLS + auth + onboarding), then Phase 2, 3, 4. After each phase you can test end-to-end and request changes before the next.

**Reply "go" to start Phase 1.** Or tell me to combine/reorder phases, drop scope, or add anything (PDFs, parents, billing, etc.).
