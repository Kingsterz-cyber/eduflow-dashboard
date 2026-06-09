# EduFlow → Production SaaS (Multi-Phase Plan)

This is a very large scope — building it correctly requires multiple iterations. I'll keep the existing premium UI, theme, animations, and navigation untouched and replace mock data + wire real workflows behind every screen.

Phase 1 is already done (auth, schools, onboarding skeleton, RLS, base schema). This plan covers everything still needed.

## Phase 2 — Schema completion + Director workflows

**Schema additions / fixes (single migration):**
- `students`: add personal/contact/guardian/address columns (first/middle/last name, gender, dob, nationality, photo_url, phone, email, country, province, district, sector, cell, village, address, father_name, mother_name, guardian_name, guardian_phone, guardian_email, guardian_occupation, enrollment_code_used).
- `enrollment_codes`: status (unused/used/pending), used_by, class_id, generated_by (class teacher), batch_id.
- `teacher_assignments`: ensure `(teacher_id, subject_id, class_id)` + `is_class_teacher` + `class_teacher_of` (class_id when class teacher).
- `assessments`: type (cat/quiz/practical/exam/assignment/custom), term_id, weight, total_marks, name.
- `marks`: (student_id, assessment_id, teacher_id, score) — keep teacher link.
- `attendance`: (student_id, class_id, date, status present/absent/late, recorded_by).
- `announcements`: audience (school/class/role), class_id nullable.
- `notifications`: per-user inbox.
- `audit_log`: actor, action, entity, entity_id, school_id, diff.
- `report_cards`: cached snapshots (student_id, term_id, totals/avg/grade/position, pdf_url nullable).
- All new tables: GRANTs + RLS scoped by `current_school_id()` + `has_role()`.

**Director server functions (`src/lib/director.functions.ts`):**
- CRUD: divisions/levels/classes, departments, subjects, teacher approvals, student approvals, announcements, school settings (logo, category, country, contact, regenerate codes).
- KPIs: total students/teachers/classes, pending approvals, growth, attendance summary, performance summary — all SQL aggregates.

**Director pages rewired:** dashboard, staff, students, approvals, announcements, settings, reports — all using real data + TanStack Query + real-time channels.

## Phase 3 — DOS academic command center

**DOS server functions (`src/lib/dos.functions.ts`):**
- Attendance rate, pass rate, class rankings, subject rankings, students at risk (attendance <78% OR avg <55%), teacher activity (last 30d marks/attendance submissions), grade distribution, weekly performance trend, attendance heatmap (52 weeks of school-wide attendance %).
- Read-only views into classes/subjects/teachers/marks/attendance across the school.

**DOS pages:** dashboard, analytics, classes, subjects, attendance, marks, reports, teachers — all real data.

## Phase 4 — Teacher + Class Teacher workspaces

**Teacher server functions (`src/lib/teacher.functions.ts`):**
- List "my teaching cards" = distinct `(subject, class)` from `teacher_assignments`.
- Class workspace per `(subject, class)`: roster (alphabetical), attendance grid upsert, assessment CRUD, marks entry grid (auto totals/averages/grades from `grading_bands`), reports, analytics.
- Class teacher–only: enrollment code generation (batch), code status table, class roster overview, report card generation, class analytics.

**Sidebar:** conditionally render "My Class" section when `is_class_teacher`.

## Phase 5 — Student dashboard + Onboarding completion

- Wire onboarding student form with full personal/guardian/address fields; enrollment code resolves to class automatically (no manual class pick).
- Student pages: dashboard (own KPIs), subjects, attendance, marks, reports, announcements — strictly own data, RLS-enforced.

## Phase 6 — Reports, real-time, polish

- PDF report cards: server route `/api/public/reports/student/$id.pdf` (signed token) using `@react-pdf/renderer` on the server — pulls marks/attendance/comments/rank.
- Realtime: subscribe key dashboards to `marks`, `attendance`, `announcements`, `approvals`, `notifications` → query invalidation.
- Notifications center (bell in topbar): approvals, new marks, announcements, report generated.
- Audit log writes on all mutations.
- Remove `src/lib/eduflow-data.ts` entirely.
- Empty / loading / error states everywhere.
- Fix routing so Director / DOS / Teacher / Student marks/attendance pages are fully isolated (no shared mock components).

## Out of scope (for now)

- SMS/email delivery, parent portal, billing, file uploads beyond logo & student photo, student transfer/promotion engine (will follow as Phase 7 if you want).

---

**Execution model:** I'll ship one phase per turn, each ending with the dashboards/pages in that phase fully functional and demoable. Phase 2 is the next turn.

Reply **"go phase 2"** to start, or tell me which phase to prioritize (e.g. "start with teacher workspace") and I'll reorder.
