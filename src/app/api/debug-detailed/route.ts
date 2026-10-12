import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    const key = supabaseServiceKey || supabaseAnonKey;
    const supabase = getSupabaseServer();

    // Get ALL columns for Youth with Disability to see what's different
    const { data } = await supabase
      .from("v_metric_values")
      .select("*")
      .eq("dashboard", "EXEC")
      .eq("section", "At a Glance")
      .eq("metric", "Youth with Disability")
      .eq("segment", "all");

    return NextResponse.json({ count: data?.length, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
