import { Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { RoleProvider } from "./role-context";
import { ThemeProvider } from "@/components/landing/theme-provider";
import { useMe } from "@/hooks/use-me";
import { Loader2, Hourglass } from "lucide-react";

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const me = useMe();
  const navigate = useNavigate();

  useEffect(() => {
    if (me.loading) return;
    if (!me.session) navigate({ to: "/auth" });
    else if (!me.role) navigate({ to: "/onboarding" });
  }, [me.loading, me.session, me.role, navigate]);

  if (me.loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen grid place-items-center bg-background text-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </ThemeProvider>
    );
  }

  if (!me.session || !me.role) return null;

  if (me.profile?.status === "pending" && me.role !== "director") {
    return (
      <ThemeProvider>
        <div className="min-h-screen grid place-items-center bg-background text-foreground px-6">
          <div className="max-w-md text-center">
            <div className="h-12 w-12 rounded-2xl bg-gradient-hero text-white grid place-items-center mx-auto mb-5">
              <Hourglass className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-semibold">Waiting for approval</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your account is pending approval from the School Director. You'll get full access as soon as you're approved.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Signed in as {me.profile?.email}
            </p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <RoleProvider role={me.role} pending={me.profile?.status === "pending"}>
        <div className="min-h-screen flex bg-background text-foreground">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Topbar />
            <main className="flex-1 overflow-x-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto"
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </RoleProvider>
    </ThemeProvider>
  );
}
