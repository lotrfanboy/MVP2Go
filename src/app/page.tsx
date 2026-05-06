import { redirect } from "next/navigation";
import type { Route } from "next";

// Middleware already routes anonymous users to /login and authed users away
// from /login. This root page just sends users into the dashboard space; the
// middleware handles the auth check on /dashboard.
export default function Root() {
  redirect("/dashboard" as Route);
}
