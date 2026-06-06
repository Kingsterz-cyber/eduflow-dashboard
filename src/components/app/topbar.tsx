import { Bell, Command, Moon, Search, Sun } from "lucide-react";
import { useRole } from "./role-context";
import { ROLE_LABELS, type Role } from "@/lib/eduflow-data";
import { useTheme } from "@/components/landing/theme-provider";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Topbar() {
  const { role, setRole } = useRole();
  const { theme, toggle } = useTheme();
  const me = ROLE_LABELS[role];

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
              {me.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </div>
            <div className="hidden md:flex flex-col items-start leading-tight">
              <span className="font-medium text-xs">{me}</span>
              <span className="text-[10px] text-muted-foreground">Demo workspace</span>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Switch role</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(["director", "dos", "teacher", "student"] as Role[]).map((r) => (
            <DropdownMenuItem
              key={r}
              onClick={() => {
                setRole(r);
                // navigate to that role's home
                if (typeof window !== "undefined") window.location.href = `/app/${r}`;
              }}
              className={role === r ? "bg-secondary" : ""}
            >
              {ROLE_LABELS[r]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
