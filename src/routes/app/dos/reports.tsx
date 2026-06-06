import { createFileRoute } from "@tanstack/react-router";
export { Route as default } from "./reports-impl";
import * as impl from "@/routes/app/director/reports";

export const Route = createFileRoute("/app/dos/reports")({
  component: impl.Route.options.component!,
});
