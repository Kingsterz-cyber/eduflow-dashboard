import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Activity, BarChart3, BookOpen, Calendar, ClipboardCheck, FileText,
  GraduationCap, Home, Layers, Megaphone, Settings, ShieldCheck, Sparkles,
  Users, UserCheck, Award, LineChart, TrendingUp, FolderOpen, Building2,
} from "lucide-react";
import { useRole } from "./role-context";
import type { Role } from "@/lib/eduflow-data";
import type { LucideIcon } from "lucide-react";

type NavItem = { to: string; label: string; icon: LucideIcon };

const NAV: Record<Role, NavItem[]> = {
  director: [
    { to: "/app/director", label: "Dashboard", icon: Home },
    { to: "/app/director/school-setup", label: "School Setup", icon: Building2 },
    { to: "/app/director/staff", label: "Staff", icon: Users },
    { to: "/app/director/students", label: "Students", icon: GraduationCap },
    { to: "/app/director/approvals", label: "Approvals", icon: UserCheck },
    { to: "/app/director/reports", label: "Reports", icon: FileText },
    { to: "/app/director/announcements", label: "Announcements", icon: Megaphone },
    { to: "/app/director/settings", label: "School Settings", icon: Settings },
  ],
  dos: [
    { to: "/app/dos", label: "Dashboard", icon: Home },
    { to: "/app/dos/analytics", label: "Academic Analytics", icon: BarChart3 },
    { to: "/app/dos/classes", label: "Classes", icon: Layers },
    { to: "/app/dos/subjects", label: "Subjects", icon: BookOpen },
    { to: "/app/dos/attendance", label: "Attendance", icon: Calendar },
    { to: "/app/dos/marks", label: "Marks", icon: ClipboardCheck },
    { to: "/app/dos/reports", label: "Reports", icon: FileText },
    { to: "/app/dos/teachers", label: "Teacher Performance", icon: Award },
  ],
  teacher: [
    { to: "/app/teacher", label: "Dashboard", icon: Home },
    { to: "/app/teacher/classes", label: "My Classes", icon: Layers },
    { to: "/app/teacher/attendance", label: "Attendance", icon: Calendar },
    { to: "/app/teacher/marks", label: "Marks", icon: ClipboardCheck },
    { to: "/app/teacher/students", label: "Students", icon: GraduationCap },
    { to: "/app/teacher/announcements", label: "Announcements", icon: Megaphone },
  ],
  student: [
    { to: "/app/student", label: "Dashboard", icon: Home },
    { to: "/app/student/subjects", label: "My Subjects", icon: BookOpen },
    { to: "/app/student/attendance", label: "My Attendance", icon: Calendar },
    { to: "/app/student/marks", label: "My Marks", icon: TrendingUp },
    { to: "/app/student/reports", label: "Reports", icon: FolderOpen },
    { to: "/app/student/announcements", label: "Announcements", icon: Megaphone },
  ],
};

export function Sidebar() {
  const { role } = useRole();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = NAV[role];

  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-border bg-surface/40 backdrop-blur-xl">
      <div className="h-14 flex items-center gap-2 px-5 border-b border-border">
        <div className="h-7 w-7 rounded-lg bg-gradient-hero grid place-items-center shadow-glow-primary">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="font-display font-semibold tracking-tight">EduFlow</div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        <div className="px-2 py-2 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
          Workspace
        </div>
        {items.map((it) => {
          const active = pathname === it.to || (it.to !== `/app/${role}` && pathname.startsWith(it.to));
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-secondary border border-border"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <it.icon className={`relative h-4 w-4 ${active ? "text-primary" : ""}`} />
              <span className="relative">{it.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            <span className="font-medium">All systems normal</span>
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">99.98% uptime · last 30d</div>
        </div>
      </div>
    </aside>
  );
}
