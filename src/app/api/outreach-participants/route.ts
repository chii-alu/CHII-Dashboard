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

    // Fetch all Outreach data with individual records
    const { data, error } = await supabase
      .from("v_metric_values")
      .select("*")
      .eq("dashboard", "EXEC")
      .eq("section", "Outreach")
      .is("year", null)
      .order("metric");

    if (error) {
      console.error("[API] Supabase error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const participants: unknown[] = [];

    return NextResponse.json({
      participants,
      total: participants.length
    });
  } catch (error: any) {
    console.error("[API] Error fetching participants:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
