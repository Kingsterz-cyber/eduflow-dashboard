import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useRole } from "@/components/app/role-context";

export const Route = createFileRoute("/app/")({
  component: AppIndex,
});

function AppIndex() {
  const { role } = useRole();
  return <Navigate to={`/app/${role}` as never} />;
}
