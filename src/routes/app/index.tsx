import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useRole } from "@/components/app/role-context";

export const Route = createFileRoute("/app/")({
  component: AppIndex,
});

function AppIndex() {
  const { role } = useRole();
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: `/app/${role}` });
  }, [role, navigate]);
  return null;
}
