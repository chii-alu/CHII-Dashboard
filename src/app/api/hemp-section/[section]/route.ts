import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { periodFromRequest, withPeriod } from "@/lib/period-query";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request, { params }: { params: { section: string } }) {
  try {
    const section = decodeURIComponent(params.section);
    // ?year=2026 or 2026-H1 picks that period's rows; without it, the cumulative rows.
    const { data, error } = await withPeriod(getSupabaseServer()
      .from("v_metric_values")
      .select("*")
      .eq("dashboard", "HEMP")
      .eq("section", section)
      .eq("value_type", "actual"), periodFromRequest(request));
    if (error) {
      console.error(`[API] Supabase error for HEMP ${section}:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const rows = (data ?? []).filter((row: any) => row.segment === "all" && !row.label);
    const headlines = rows
      .filter((row: any) => row.value_type === "actual")
      .map((row: any) => ({ metric: row.metric, value: row.value }));
    return NextResponse.json({ headlines });
  } catch (error: any) {
    console.error("[API] Error fetching HEMP section:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
