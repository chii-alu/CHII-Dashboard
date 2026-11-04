import { createClient } from "@/lib/supabase-client";

// Ends the Supabase session, then returns to the dashboard sign-in page.
export async function signOutToSignIn(): Promise<void> {
  await createClient().auth.signOut();
  window.location.href = "/sign-in";
}
