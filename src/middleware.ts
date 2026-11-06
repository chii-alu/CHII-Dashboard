import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isRole, canOpen, dashboardForPage, dashboardForApi } from "@/lib/access";

// Checks every dashboard page and data request: the visitor must be signed in,
// have a role in `profiles`, and that role must allow the dashboard.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const pathname = request.nextUrl.pathname;
  const isApi = pathname.startsWith("/api/");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    if (isApi) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = profile?.role;

  if (!isRole(role)) {
    if (isApi) return NextResponse.json({ error: "No dashboard access" }, { status: 403 });
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("error", "no-access");
    return NextResponse.redirect(url);
  }

  if (isApi) {
    const dashboard = dashboardForApi(pathname, request.nextUrl.searchParams.get("dashboard"));
    if (dashboard === "ANY") return response;
    if (dashboard === null || !canOpen(role, dashboard)) {
      return NextResponse.json({ error: "No dashboard access" }, { status: 403 });
    }
    return response;
  }

  const dashboard = dashboardForPage(pathname);
  if (dashboard && !canOpen(role, dashboard)) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("error", "no-access");
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/hent/:path*", "/hemp/:path*", "/hm/:path*", "/heco/:path*", "/executive/:path*", "/api/:path*"],
};
