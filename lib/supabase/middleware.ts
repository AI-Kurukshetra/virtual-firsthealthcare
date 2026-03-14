import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const roleRoutes: Record<string, string> = {
  "/admin": "admin",
  "/provider": "provider",
  "/patient": "patient"
};

export async function updateSession(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({
      request: {
        headers: request.headers
      }
    });
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: request.headers
            }
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const matchedPrefix = Object.keys(roleRoutes).find((prefix) => pathname.startsWith(prefix));

  if (matchedPrefix) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const expectedRole = roleRoutes[matchedPrefix];
    const actualRole = profile?.role ?? "member";

    if (actualRole !== expectedRole) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname =
        actualRole === "admin"
          ? "/admin/dashboard"
          : actualRole === "provider"
            ? "/provider/dashboard"
            : actualRole === "patient"
              ? "/patient/dashboard"
              : "/settings";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}
