import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /auth/signout
 *
 * Alternative to the server action used by the dashboard logout button.
 * Useful for non-React clients or scripts hitting the app directly.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const base = process.env.APP_BASE_URL ?? request.nextUrl.origin;
  return NextResponse.redirect(new URL("/login", base), { status: 303 });
}
