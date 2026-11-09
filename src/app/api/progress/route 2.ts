// GET /api/progress?dashboard=HEMP&intervention=Internships
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dashboard = searchParams.get("dashboard") ?? "HEMP";
    const intervention = searchParams.get("intervention");
    const section = searchParams.get("section");
    const metricGroup = searchParams.get("metricGroup");
    // Overall targets apply to all years only; a chosen year gets its own rows and no target until one is set.
    const yearParam = searchParams.get("year");
    const year = yearParam && /^\d{4}$/.test(yearParam) ? Number(yearParam) : null;

    let query = getSupabaseServer()
      .from("v_progress")
      .select("metric, unit, actual, target, progress_pct, intervention, section, metric_group")
      .eq("dashboard", dashboard)
      .eq("segment", "all");
    query = year !== null ? query.eq("year", year) : query.is("year", null);

    query = intervention ? query.eq("intervention", intervention) : query.is("intervention", null);
    if (section) query = query.eq("section", section);
    if (metricGroup) query = query.eq("metric_group", metricGroup);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ progress: data ?? [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
