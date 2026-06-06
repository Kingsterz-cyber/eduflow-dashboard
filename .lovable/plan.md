# EduFlow Dashboard System — Build Plan

A premium 2026 SaaS dashboard for EduFlow with 4 role-based experiences. The current project only has a landing page; this adds the full authenticated app surface.

## Architecture

### Routing structure
```
src/routes/
  index.tsx                    (existing landing — untouched)
  app.tsx                      (dashboard shell layout — sidebar + topbar + Outlet)
  app/index.tsx                (role switcher / redirect)
  app/director/                (School Director module)
    index.tsx                  Dashboard
    staff.tsx
    students.tsx
    approvals.tsx
    reports.tsx
    announcements.tsx
    settings.tsx
  app/dos/                     (Director of Studies)
    index.tsx
    analytics.tsx
    classes.tsx
    subjects.tsx
    attendance.tsx
    marks.tsx
    reports.tsx
    teachers.tsx               (Teacher Performance)
  app/teacher/
    index.tsx
    classes.tsx
    attendance.tsx
    marks.tsx
    students.tsx
    announcements.tsx
  app/student/
    index.tsx
    subjects.tsx
    attendance.tsx
    marks.tsx
    reports.tsx
    announcements.tsx
```

### Role switching
Top-right role switcher in topbar (no auth — demo). Stores role in localStorage + context. Sidebar items rendered from role config map.

## Design system additions
Reuse landing OKLCH tokens (indigo/violet/cyan). Add:
- Dashboard surfaces (sidebar bg, hover, active state ring)
- Subtle card hover lift
- Status chips (success / warning / danger / info / neutral)
- Heatmap cell color scale (5 steps)

Light + dark already wired in ThemeProvider.

## Shared components (`src/components/app/`)
- `app-shell.tsx` — sidebar + topbar + main outlet, framer-motion route transitions
- `sidebar.tsx` — collapsible, role-aware, active indicator animation
- `topbar.tsx` — search (cmd-k look), notifications, role switcher, theme toggle, avatar
- `kpi-card.tsx` — number with count-up, delta chip, sparkline
- `data-table.tsx` — search/filter header, sortable, paginated, row actions
- `section.tsx` — page header (title, description, actions)
- `empty-state.tsx`, `loading-skeleton.tsx`
- `heatmap.tsx` — GitHub-style attendance contribution grid (52w × 7d)
- `chart-line.tsx`, `chart-bar.tsx`, `chart-donut.tsx` (animated SVG, reuse landing pattern)
- `status-badge.tsx`
- `class-tree.tsx` — O-Level / A-Level hierarchical navigator
- `quick-action.tsx`
- `activity-feed.tsx`
- `announcement-card.tsx`

## Mock data layer (`src/lib/eduflow-data.ts`)
Deterministic seeded fake data: students, teachers, classes (S1-S6 with streams), subjects grouped by department, attendance series, marks, announcements, activity events, approvals. Pure module — no fetch.

## Page-by-page (high-level — every page is fully populated, no placeholders)

**Director**
- Dashboard: 6 KPI bento, performance line chart, growth area chart, pending approvals list, activity feed, announcements column, quick actions row
- Staff: tabs (DOS / Teachers), filter bar, table w/ avatar, department, classes, status, actions
- Students: split layout — class tree left, class detail right (4 KPI mini cards + student table)
- Approvals: tabs (Teachers / Students), card list with approve/reject + detail drawer
- Reports: generator form (report type, year, term, class, subject) + recent reports table
- Announcements: composer + targeted audience selector + list with engagement stats
- Settings: tabs (Branding / Academic Years / Grading / Codes)

**DOS**
- Dashboard: 6 KPI, heatmap hero, class rankings list, subject rankings, insights panel (at-risk, declining classes, top subjects, attendance warnings)
- Analytics: large heatmap, multi-line trend, grade distribution donut, teacher activity bars
- Classes: tree + tabs (Overview / Students / Attendance / Marks / Reports / Analytics)
- Subjects: grouped by department cards, drill-down with teachers/classes/avg/trend
- Attendance: today/week/month tabs, heatmap, class rankings
- Marks: entry tab + review tab + analysis charts (subject/class compare, grade dist)
- Reports: same as director with academic emphasis
- Teacher Performance: scoreboard table

**Teacher**
- Dashboard: 4 KPI, today's classes timeline, recent student activity, pending assessments, quick actions
- Classes: card grid; click → workspace with 7 tabs
- Attendance: record (today's class roster with present/absent/late toggles) + history
- Marks: assessment list (CAT/Quiz/Assignment/Exam) → score entry grid with auto-calc total/avg/grade
- Students: searchable table across assigned classes
- Announcements: composer + list

**Student**
- Dashboard: 4 KPI, academic progress line, subject performance bars, attendance trend, announcements
- My Subjects: subject cards grouped, with teacher
- My Attendance: percentage hero, calendar/heatmap, history table
- My Marks: per subject — CAT 1, CAT 2, Exam, Total, Grade table
- Reports: downloadable report cards list
- Announcements: feed

## Motion
- Sidebar items: subtle x-translate active indicator (layoutId)
- Route transitions: 200ms fade+slight y
- KPI cards: count-up + entrance stagger
- Charts: pathLength draw on view
- Hover: card lift, table row tint
- Skeletons during simulated load (300ms)

## Tech details
- Use existing shadcn primitives (Card, Table, Tabs, Input, Button, Badge, Select, Avatar, Tooltip, Dialog, Drawer/Sheet)
- TanStack Router file-based routing, layout route `app.tsx` with `<Outlet />`
- No backend — pure mock data
- Landing page (`/`) untouched; new dashboard at `/app`
- Link from landing CTA to `/app` (preserves "Get Started" flow)

## Out of scope
- Real auth (Lovable Cloud not enabled — demo role switcher only)
- Real-time backend
- File uploads
- Email sending

## Acceptance
- All 30+ pages render with real-looking data
- Every sidebar link works for every role
- Light & dark mode both look polished
- Mobile: sidebar collapses to drawer
