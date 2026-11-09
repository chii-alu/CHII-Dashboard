import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DASHBOARDS = ["HEMP", "EXEC", "HECO"];

// Current-total actual headlines for one dashboard section (or one intervention within it).
// GET /api/dashboard-section?dashboard=HECO&section=At%20a%20Glance
// GET /api/dashboard-section?dashboard=HECO&section=Intervention&intervention=Executive%20Courses
export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const dashboard = params.get("dashboard") ?? "";
    const section = params.get("section") ?? "";
    const intervention = params.get("intervention");
    if (!DASHBOARDS.includes(dashboard) || !section) {
      return NextResponse.json({ error: "dashboard and section are required" }, { status: 400 });
    }

    let query = getSupabaseServer()
      .from("v_metric_values")
      .select("metric, value")
      .eq("dashboard", dashboard)
      .eq("section", section)
      .eq("value_type", "actual")
      .eq("segment", "all")
      .is("year", null);
    query = intervention ? query.eq("intervention", intervention) : query.is("intervention", null);

    const { data, error } = await query;
    if (error) {
      console.error("[API] Supabase error for dashboard section:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const headlines = (data ?? []).map((row: any) => ({ metric: row.metric, value: row.value }));
    return NextResponse.json({ headlines }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    console.error("[API] Error fetching dashboard section:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
