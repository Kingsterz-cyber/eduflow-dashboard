import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [{ title: "EduFlow Dashboard" }] }),
  component: () => (
    <AppShell />
  ),
});

// Outlet is rendered inside AppShell
export const _unused = Outlet;
