import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/signin_/super-admin")({
  beforeLoad: () => {
    throw redirect({ to: "/signin", search: { role: "super-admin" } });
  },
  component: () => null,
});
