import { createBrowserClient } from "@supabase/ssr";

// Browser client. The session is kept in cookies, so the server middleware can read it.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
