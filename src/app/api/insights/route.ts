import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DASHBOARDS = ["HEMP", "EXEC", "HECO", "HENT"];

// Insight cards for a dashboard's At a Glance page, in the order set in the workbook.
export async function GET(request: Request) {
  try {
    const dashboard = new URL(request.url).searchParams.get("dashboard") ?? "";
    if (!DASHBOARDS.includes(dashboard)) {
      return NextResponse.json({ error: "dashboard must be HEMP, EXEC, HECO or HENT" }, { status: 400 });
    }
    const { data, error } = await getSupabaseServer()
      .from("v_insights")
      .select("sort_order, title, description, detail, value_display")
      .eq("dashboard", dashboard)
      .eq("section", "At a Glance")
      .order("sort_order", { ascending: true });
    if (error) {
      console.error(`[API] Supabase error for insights ${dashboard}:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ insights: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    console.error("[API] Error fetching insights:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
