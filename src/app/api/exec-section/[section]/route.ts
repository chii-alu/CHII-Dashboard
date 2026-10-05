import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  request: Request,
  { params }: { params: { section: string } }
) {
  try {
    const section = decodeURIComponent(params.section);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_SUPABASE_URL" },
        { status: 500 }
      );
    }

    const key = supabaseServiceKey || supabaseAnonKey;
    if (!key) {
      return NextResponse.json(
        { error: "Missing Supabase keys" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, key);
    console.log(`[API] Fetching ${section} data with key type:`, supabaseServiceKey ? "service_role" : "anon");

    const { data, error } = await supabase
      .from("v_metric_values")
      .select("*")
      .eq("dashboard", "EXEC")
      .eq("section", section)
      .is("year", null)
      .order("metric");

    if (error) {
      console.error(`[API] Supabase error for ${section}:`, error);
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      );
    }

    console.log(`[API] ${section} data rows:`, data?.length || 0);

    // Transform to headline format - filter for segment='all'
    const headlines = (data || [])
      .filter((row: any) => row.segment === "all")
      .map((row: any) => ({
        metric: row.metric,
        value: row.value,
      }));

    return NextResponse.json({ headlines, rawRowCount: data?.length || 0 });
  } catch (error: any) {
    console.error(`[API] Error fetching section data:`, error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
