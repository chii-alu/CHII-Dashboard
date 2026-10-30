import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Internship host organisations and their per-host rows, read from the database (never a fixed list).
export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const dashboard = params.get("dashboard") ?? "";
    const intervention = params.get("intervention") ?? "";
    if (!["HEMP", "HECO"].includes(dashboard) || !intervention) {
      return NextResponse.json({ error: "dashboard and intervention are required" }, { status: 400 });
    }
    const supabase = getSupabaseServer();
    const [orgs, rows] = await Promise.all([
      supabase.from("organizations").select("name").order("name"),
      supabase
        .from("v_metric_values")
        .select("metric, organization, item, year, value")
        .eq("dashboard", dashboard)
        .eq("intervention", intervention)
        .eq("value_type", "actual")
        .eq("segment", "all")
        .not("organization", "is", null),
    ]);
    if (orgs.error || rows.error) {
      const message = orgs.error?.message ?? rows.error?.message ?? "Query failed";
      console.error("[API] Supabase error for internship hosts:", message);
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const metrics: Record<string, { organization: string; item: string | null; year: number | null; value: number }[]> = {};
    for (const row of rows.data ?? []) {
      (metrics[row.metric] ??= []).push({
        organization: row.organization,
        item: row.item ?? null,
        year: row.year ?? null,
        value: Number(row.value),
      });
    }

    return NextResponse.json(
      { hosts: (orgs.data ?? []).map((o: any) => o.name), metrics },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: any) {
    console.error("[API] Error fetching internship hosts:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
