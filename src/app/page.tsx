import { redirect } from "next/navigation";
import type { Route } from "next";

const HOME_ROUTE = "/funil/radar" as Route;

// Middleware sends anonymous users from / to /login. If this page is reached,
// send the operator to the current product home: the Funil radar.
export default function Root() {
  redirect(HOME_ROUTE);
}
