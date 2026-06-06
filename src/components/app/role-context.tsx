import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Role } from "@/lib/eduflow-data";

const RoleCtx = createContext<{ role: Role; setRole: (r: Role) => void }>({
  role: "director",
  setRole: () => {},
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("director");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? (localStorage.getItem("eduflow-role") as Role | null) : null;
    if (stored) setRoleState(stored);
  }, []);

  const setRole = (r: Role) => {
    setRoleState(r);
    if (typeof window !== "undefined") localStorage.setItem("eduflow-role", r);
  };

  return <RoleCtx.Provider value={{ role, setRole }}>{children}</RoleCtx.Provider>;
}

export const useRole = () => useContext(RoleCtx);
