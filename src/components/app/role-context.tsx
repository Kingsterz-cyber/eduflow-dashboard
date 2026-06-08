import { createContext, useContext, type ReactNode } from "react";
import { useMe, type AppRole } from "@/hooks/use-me";

// Legacy alias for existing code.
export type Role = AppRole;

type Ctx = {
  role: Role;
  // kept for backwards-compat with old role-switcher; no-op in real mode
  setRole: (r: Role) => void;
  pending: boolean;
};

const RoleCtx = createContext<Ctx>({
  role: "student",
  setRole: () => {},
  pending: false,
});

export function RoleProvider({ children, role, pending }: { children: ReactNode; role: Role; pending?: boolean }) {
  return <RoleCtx.Provider value={{ role, setRole: () => {}, pending: !!pending }}>{children}</RoleCtx.Provider>;
}

export const useRole = () => useContext(RoleCtx);

// Re-export for components that want raw hook directly.
export { useMe };
