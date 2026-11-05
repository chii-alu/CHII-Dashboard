import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Server Supabase client that uses the signed-in user's session cookies.
// Row Level Security then applies to that user (anonymous visitors get no rows).
export function createSupabaseSessionClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a server component: the middleware refreshes the session instead.
          }
        },
      },
    }
  );
}
