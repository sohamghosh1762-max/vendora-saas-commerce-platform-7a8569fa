import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/signin_/vendor")({
  beforeLoad: () => {
    throw redirect({ to: "/signin", search: { role: "vendor" } });
  },
  component: () => null,
});
