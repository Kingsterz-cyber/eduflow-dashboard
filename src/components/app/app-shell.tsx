import { Outlet, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { RoleProvider } from "./role-context";
import { ThemeProvider } from "@/components/landing/theme-provider";

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <ThemeProvider>
      <RoleProvider>
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
