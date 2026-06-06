// Deterministic mock data for EduFlow dashboard demo.
// Pure module — no network calls. Safe to import anywhere.

export type Role = "director" | "dos" | "teacher" | "student";

export const ROLE_LABELS: Record<Role, string> = {
  director: "School Director",
  dos: "Director of Studies",
  teacher: "Teacher",
  student: "Student",
};

// ---------- seeded RNG ----------
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);
const pick = <T,>(a: T[]) => a[Math.floor(rand() * a.length)];

// ---------- school config ----------
export const SCHOOL = {
  name: "Westbrook International School",
  code: "WIS-2026",
  academicYear: "2025/2026",
  term: "Term 2",
  totalStudents: 1284,
  totalTeachers: 86,
  totalClasses: 32,
  totalDepartments: 6,
};

export const DEPARTMENTS = [
  { id: "sci", name: "Sciences", color: "indigo", subjects: ["Mathematics", "Physics", "Chemistry", "Biology"] },
  { id: "lang", name: "Languages", color: "violet", subjects: ["English", "French", "Kiswahili"] },
  { id: "hum", name: "Humanities", color: "cyan", subjects: ["History", "Geography", "Religious Studies"] },
  { id: "ict", name: "ICT", color: "indigo", subjects: ["Computer Science", "ICT Fundamentals"] },
  { id: "biz", name: "Business", color: "violet", subjects: ["Economics", "Accounting", "Entrepreneurship"] },
  { id: "arts", name: "Arts", color: "cyan", subjects: ["Fine Art", "Music", "Drama"] },
];

export const ALL_SUBJECTS = DEPARTMENTS.flatMap((d) =>
  d.subjects.map((s) => ({ name: s, department: d.name, departmentId: d.id })),
);

// ---------- class hierarchy ----------
export type ClassNode = {
  id: string;
  label: string;
  level: "O-Level" | "A-Level";
  grade: string; // S1..S6
  stream?: string; // A, B, C
  students: number;
  attendance: number;
  avg: number;
  teacher: string;
};

const TEACHER_NAMES = [
  "Ms. Adler",
  "Mr. Patel",
  "Mrs. Okafor",
  "Mr. Tanaka",
  "Ms. Rivera",
  "Dr. Nguyen",
  "Mr. Lindberg",
  "Mrs. Hadid",
  "Ms. Cohen",
  "Mr. Diallo",
  "Mrs. Park",
  "Mr. Costa",
];

export const CLASSES: ClassNode[] = (() => {
  const out: ClassNode[] = [];
  const oLevel = ["S1", "S2", "S3", "S4"];
  const aLevel = ["S5", "S6"];
  for (const g of oLevel) {
    for (const s of ["A", "B", "C"]) {
      out.push({
        id: `${g}${s}`,
        label: `${g}${s}`,
        level: "O-Level",
        grade: g,
        stream: s,
        students: 28 + Math.floor(rand() * 14),
        attendance: 88 + Math.floor(rand() * 11),
        avg: 65 + Math.floor(rand() * 25),
        teacher: pick(TEACHER_NAMES),
      });
    }
  }
  for (const g of aLevel) {
    for (const s of ["Sciences", "Arts"]) {
      out.push({
        id: `${g}-${s}`,
        label: `${g} ${s}`,
        level: "A-Level",
        grade: g,
        stream: s,
        students: 22 + Math.floor(rand() * 12),
        attendance: 90 + Math.floor(rand() * 9),
        avg: 70 + Math.floor(rand() * 22),
        teacher: pick(TEACHER_NAMES),
      });
    }
  }
  return out;
})();

// ---------- students ----------
const FIRST_NAMES = [
  "Amelia", "Jonas", "Priya", "Diego", "Ines", "Kenji", "Layla", "Mateo",
  "Nia", "Omar", "Sofia", "Theo", "Yara", "Zane", "Aisha", "Bruno",
  "Chiamaka", "Davi", "Elena", "Farouk", "Greta", "Hiro", "Imani", "Jin",
];
const LAST_NAMES = [
  "Adler", "Bellini", "Costa", "Diallo", "Eriksson", "Fontaine", "Gupta",
  "Hadid", "Iversen", "Jansen", "Kovac", "Liang", "Moreau", "Nakamura",
  "Okafor", "Pereira", "Quintero", "Rashid", "Singh", "Tanaka",
];

export type Student = {
  id: string;
  name: string;
  classId: string;
  attendance: number;
  average: number;
  status: "active" | "at-risk" | "honors";
  avatar: string;
};

export const STUDENTS: Student[] = (() => {
  const out: Student[] = [];
  let n = 10000;
  for (const c of CLASSES) {
    for (let i = 0; i < Math.min(c.students, 14); i++) {
      const first = pick(FIRST_NAMES);
      const last = pick(LAST_NAMES);
      const attendance = 70 + Math.floor(rand() * 30);
      const avg = 45 + Math.floor(rand() * 50);
      const status: Student["status"] =
        avg >= 80 ? "honors" : avg < 55 || attendance < 78 ? "at-risk" : "active";
      out.push({
        id: `STU-${n++}`,
        name: `${first} ${last}`,
        classId: c.id,
        attendance,
        average: avg,
        status,
        avatar: `${first[0]}${last[0]}`,
      });
    }
  }
  return out;
})();

// ---------- teachers / staff ----------
export type Staff = {
  id: string;
  name: string;
  role: "DOS" | "Teacher";
  department: string;
  classes: string[];
  email: string;
  activity: number; // 0-100
  status: "active" | "inactive";
  avatar: string;
};

export const STAFF: Staff[] = (() => {
  const out: Staff[] = [];
  let n = 5000;
  // 2 DOS
  for (let i = 0; i < 2; i++) {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    out.push({
      id: `STF-${n++}`,
      name: `${first} ${last}`,
      role: "DOS",
      department: pick(DEPARTMENTS).name,
      classes: [],
      email: `${first.toLowerCase()}.${last.toLowerCase()}@wis.edu`,
      activity: 80 + Math.floor(rand() * 20),
      status: "active",
      avatar: `${first[0]}${last[0]}`,
    });
  }
  // teachers
  for (let i = 0; i < 24; i++) {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const dept = pick(DEPARTMENTS);
    out.push({
      id: `STF-${n++}`,
      name: `${first} ${last}`,
      role: "Teacher",
      department: dept.name,
      classes: Array.from({ length: 2 + Math.floor(rand() * 3) }, () => pick(CLASSES).label),
      email: `${first.toLowerCase()}.${last.toLowerCase()}@wis.edu`,
      activity: 40 + Math.floor(rand() * 60),
      status: rand() > 0.1 ? "active" : "inactive",
      avatar: `${first[0]}${last[0]}`,
    });
  }
  return out;
})();

// ---------- approvals ----------
export type Approval = {
  id: string;
  name: string;
  type: "teacher" | "student";
  email: string;
  submittedAt: string;
  meta: string;
  avatar: string;
};
export const APPROVALS: Approval[] = Array.from({ length: 12 }, (_, i) => {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const type: Approval["type"] = i % 3 === 0 ? "teacher" : "student";
  return {
    id: `APR-${9000 + i}`,
    name: `${first} ${last}`,
    type,
    email: `${first.toLowerCase()}@wis.edu`,
    submittedAt: `${Math.floor(rand() * 23) + 1}h ago`,
    meta:
      type === "teacher"
        ? pick(DEPARTMENTS).name + " · " + pick(["Maths", "Biology", "English"])
        : pick(CLASSES).label + " · " + pick(["Transfer", "New enrolment"]),
    avatar: `${first[0]}${last[0]}`,
  };
});

// ---------- announcements ----------
export const ANNOUNCEMENTS = [
  {
    id: "AN-01",
    title: "Term 2 mid-term exam schedule released",
    body: "Mid-term exams begin next Monday. Full timetable is now available in the Reports module.",
    audience: "All Users",
    author: "Principal's Office",
    date: "2h ago",
    reads: 824,
  },
  {
    id: "AN-02",
    title: "Sciences Department staff meeting",
    body: "All Sciences teachers please meet in the staff room Friday 4pm to review lab safety updates.",
    audience: "Teachers",
    author: "Dr. Nguyen",
    date: "yesterday",
    reads: 28,
  },
  {
    id: "AN-03",
    title: "S4 mock exam results published",
    body: "Results are now visible to S4 students and parents. Reports can be downloaded from My Reports.",
    audience: "Students · S4",
    author: "DOS Office",
    date: "2 days ago",
    reads: 412,
  },
  {
    id: "AN-04",
    title: "Inter-school debate finals on Saturday",
    body: "Our team has reached the regional finals. Buses leave Saturday 8am sharp.",
    audience: "All Users",
    author: "Activities",
    date: "3 days ago",
    reads: 980,
  },
];

// ---------- activity feed ----------
export const ACTIVITY = [
  { who: "Ms. Adler", what: "graded Algebra II midterm", when: "2m", kind: "mark" },
  { who: "Mr. Patel", what: "marked attendance for S3B", when: "8m", kind: "attendance" },
  { who: "Mrs. Okafor", what: "published end-of-term report", when: "21m", kind: "report" },
  { who: "Dr. Nguyen", what: "approved 4 new students", when: "45m", kind: "approval" },
  { who: "Mr. Tanaka", what: "created Quiz: Newton's Laws", when: "1h", kind: "assessment" },
  { who: "Ms. Rivera", what: "submitted CAT 1 marks for S2A", when: "2h", kind: "mark" },
  { who: "System", what: "auto-generated weekly attendance report", when: "3h", kind: "system" },
];

// ---------- time-series ----------
export function makeSeries(n: number, base: number, variance: number) {
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < n; i++) {
    v += (rand() - 0.5) * variance;
    v = Math.max(0, v);
    out.push(Math.round(v * 10) / 10);
  }
  return out;
}

export const ATTENDANCE_TREND = makeSeries(12, 92, 4);
export const PERFORMANCE_TREND = makeSeries(12, 74, 6);
export const GROWTH_TREND = makeSeries(12, 1100, 30).map((v) => Math.round(v));

// ---------- heatmap (52 weeks x 7 days) ----------
export const ATTENDANCE_HEATMAP: number[][] = Array.from({ length: 52 }, () =>
  Array.from({ length: 7 }, () => {
    const r = rand();
    if (r < 0.1) return 0;
    if (r < 0.3) return 1;
    if (r < 0.55) return 2;
    if (r < 0.85) return 3;
    return 4;
  }),
);

// ---------- subjects with metrics ----------
export const SUBJECT_METRICS = ALL_SUBJECTS.map((s) => ({
  ...s,
  teachers: 1 + Math.floor(rand() * 3),
  classes: 3 + Math.floor(rand() * 8),
  average: 60 + Math.floor(rand() * 30),
  trend: makeSeries(10, 70, 5),
  passRate: 70 + Math.floor(rand() * 25),
}));

// ---------- assessments (for teacher) ----------
export type Assessment = {
  id: string;
  title: string;
  type: "CAT" | "Quiz" | "Assignment" | "Exam";
  classLabel: string;
  subject: string;
  due: string;
  status: "draft" | "open" | "graded";
  submissions: number;
  total: number;
};
export const ASSESSMENTS: Assessment[] = [
  { id: "A1", title: "CAT 1 — Algebra", type: "CAT", classLabel: "S2A", subject: "Mathematics", due: "Tomorrow", status: "open", submissions: 24, total: 32 },
  { id: "A2", title: "Quiz — Newton's Laws", type: "Quiz", classLabel: "S3B", subject: "Physics", due: "Fri", status: "open", submissions: 12, total: 30 },
  { id: "A3", title: "Essay — WW2 Causes", type: "Assignment", classLabel: "S4A", subject: "History", due: "Mon", status: "draft", submissions: 0, total: 28 },
  { id: "A4", title: "End-of-term Exam", type: "Exam", classLabel: "S2A", subject: "Mathematics", due: "2 weeks", status: "draft", submissions: 0, total: 32 },
  { id: "A5", title: "CAT 2 — Cell Biology", type: "CAT", classLabel: "S3B", subject: "Biology", due: "Last week", status: "graded", submissions: 30, total: 30 },
];

// ---------- student-specific (logged in as Amelia Adler in S2A) ----------
export const ME_STUDENT = {
  name: "Amelia Adler",
  classId: "S2A",
  studentId: "STU-10042",
  attendance: 94.2,
  averageGrade: 82.4,
  rank: 4,
  classSize: 32,
  subjects: [
    { name: "Mathematics", teacher: "Mr. John", cat1: 82, cat2: 78, exam: 86, grade: "A" },
    { name: "Physics", teacher: "Dr. Nguyen", cat1: 74, cat2: 80, exam: 78, grade: "B+" },
    { name: "Chemistry", teacher: "Ms. Rivera", cat1: 88, cat2: 84, exam: 90, grade: "A" },
    { name: "Biology", teacher: "Mrs. Okafor", cat1: 70, cat2: 76, exam: 80, grade: "B+" },
    { name: "English", teacher: "Mr. Lindberg", cat1: 85, cat2: 88, exam: 84, grade: "A" },
    { name: "History", teacher: "Mrs. Hadid", cat1: 72, cat2: 75, exam: 78, grade: "B" },
  ],
};
