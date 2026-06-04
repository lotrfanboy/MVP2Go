import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const HOME_PATH = "/funil/radar";
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/funil",
  "/blacklist",
  "/brief",
  "/clusters",
  "/coleta",
  "/configuracoes",
  "/custos",
  "/filtradas",
  "/fontes",
  "/ideias",
  "/pesos",
  "/prompts",
  "/ranking",
  "/runs",
  "/sinais",
];

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. See .env.example.",
    );
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options: _options }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = request.nextUrl.pathname.startsWith("/login");
  const isRootRoute = request.nextUrl.pathname === "/";
  const isProtectedRoute = PROTECTED_PREFIXES.some(
    (prefix) => request.nextUrl.pathname === prefix || request.nextUrl.pathname.startsWith(`${prefix}/`),
  );

  if (!user && (isRootRoute || isProtectedRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && (isAuthRoute || isRootRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = HOME_PATH;
    return NextResponse.redirect(url);
  }

  return response;
}
