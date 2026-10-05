import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_SUPABASE_URL" },
        { status: 500 }
      );
    }

    // Try service role key first (bypasses RLS), fall back to publishable key (anon)
    const key = supabaseServiceKey || supabaseAnonKey;
    if (!key) {
      return NextResponse.json(
        { error: "Missing Supabase keys" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, key);
    console.log("[API] Fetching Outreach data with key type:", supabaseServiceKey ? "service_role" : "anon");

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
        { error: error.message, details: error },
        { status: 500 }
      );
    }

    console.log("[API] Outreach data rows:", data?.length || 0);
    console.log("[API] Sample row:", data?.[0]);

    // Transform to headline format
    const metricsMap = new Map<string, number>();
    data?.forEach((row: any) => {
      if (row.segment === "all" && !metricsMap.has(row.metric)) {
        metricsMap.set(row.metric, row.value);
      }
    });

    const headlines = Array.from(metricsMap.entries()).map(([metric, value]) => ({
      metric,
      value,
    }));

    return NextResponse.json({ headlines, rawRowCount: data?.length || 0 });
  } catch (error: any) {
    console.error("[API] Error fetching Outreach data:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
