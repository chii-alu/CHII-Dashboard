// Auth callback: finishes sign-in and sends each user to the right place.
//  - ?code=...        an emailed link (e.g. password reset) is exchanged for a session
//  - ?next=/path      after the link, the user goes to that path (e.g. /reset-password)
//  - no next          a normal sign-in: the user's role decides the landing dashboard
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseSessionClient } from "@/lib/supabase-session-server";
import { isRole, type Role } from "@/lib/access";

export const dynamic = "force-dynamic";

const LANDING: Record<Role, string> = {
  admin: "/executive/at-a-glance",
  HEMP: "/hemp",
  HENT: "/hent/at-a-glance",
  HECO: "/heco",
};

function toSignIn(origin: string, error: string) {
  return NextResponse.redirect(new URL(`/sign-in?error=${error}`, origin));
}

export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const supabase = createSupabaseSessionClient();

  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return toSignIn(origin, "link-expired");
  }

  const next = searchParams.get("next");
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return NextResponse.redirect(new URL(next, origin));
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return toSignIn(origin, "session");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = profile?.role;
  if (!isRole(role)) {
    await supabase.auth.signOut();
    return toSignIn(origin, "no-access");
  }
  return NextResponse.redirect(new URL(LANDING[role], origin));
}
