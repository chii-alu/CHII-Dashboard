import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { computeExecInsights, type MetricRow } from "@/lib/exec-insights";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Executive Key Performance Insights, calculated from the synced data (not typed in the workbook).
// ?year=2026 or 2026-H1 picks the period; without it, cumulative.
export async function GET(request: Request) {
  try {
    const period = new URL(request.url).searchParams.get("year");
    // Every period is loaded (not just the selected one) so each card can compare with the previous period.
    const { data, error } = await getSupabaseServer()
      .from("v_metric_values")
      .select("section, metric, value_type, year, period, segment, label, breakdown, country, value")
      .eq("dashboard", "EXEC")
      .in("section", ["At a Glance", "Youth in Work", "Map"])
      .limit(5000);
    if (error) {
      console.error("[API] Supabase error for executive insights:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const insights = computeExecInsights((data ?? []) as MetricRow[], period);
    return NextResponse.json({ insights }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    console.error("[API] Error computing executive insights:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
