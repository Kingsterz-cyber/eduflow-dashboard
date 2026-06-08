import { Bell, Command, Moon, Search, Sun, LogOut, User } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useRole } from "./role-context";
import { useMe } from "@/hooks/use-me";
import { useTheme } from "@/components/landing/theme-provider";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ROLE_LABEL: Record<string, string> = {
  director: "School Director",
  dos: "Director of Studies",
  teacher: "Teacher",
  student: "Student",
};

export function Topbar() {
  const { role } = useRole();
  const me = useMe();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const display = me.profile?.full_name || me.profile?.email || "Account";
  const initials = display.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <header className="h-14 shrink-0 flex items-center gap-3 px-4 lg:px-6 border-b border-border bg-background/70 backdrop-blur-xl sticky top-0 z-30">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search students, classes, reports…"
            className="w-full h-9 rounded-lg bg-secondary/60 border border-border pl-9 pr-16 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring/40 transition"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground bg-background border border-border rounded px-1.5 py-0.5">
            <Command className="h-2.5 w-2.5" /> K
          </kbd>
        </div>
      </div>

      <button
        onClick={toggle}
        className="h-9 w-9 grid place-items-center rounded-lg hover:bg-secondary transition"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <button className="relative h-9 w-9 grid place-items-center rounded-lg hover:bg-secondary transition" aria-label="Notifications">
        <Bell className="h-4 w-4" />
        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 h-9 pl-1 pr-2.5 rounded-lg border border-border bg-card hover:bg-secondary transition text-sm">
            <div className="h-7 w-7 rounded-md bg-gradient-hero text-white grid place-items-center text-[11px] font-semibold">
              {initials || <User className="h-3.5 w-3.5" />}
            </div>
            <div className="hidden md:flex flex-col items-start leading-tight">
              <span className="font-medium text-xs">{display}</span>
              <span className="text-[10px] text-muted-foreground">{ROLE_LABEL[role]} · {me.school?.name ?? "—"}</span>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="font-normal">
            <div className="text-xs text-muted-foreground">Signed in as</div>
            <div className="text-sm font-medium truncate">{me.profile?.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth" });
            }}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5 mr-2" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
