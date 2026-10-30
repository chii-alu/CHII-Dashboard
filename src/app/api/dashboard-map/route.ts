import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export type HempMapCountry = {
  country: string;
  // Mission Students row for the country, or null when the workbook has none.
  missionStudents: number | null;
  // Programme name -> participants in that country.
  interventions: Record<string, number>;
};

export type HempMapData = {
  countries: HempMapCountry[];
  // Programme name -> total across all countries, including Unreported.
  totals: Record<string, number>;
  // Programme name -> participants without a country (the workbook's Unreported row).
  unreported: Record<string, number>;
};

// HEMP map: country rows and programme totals, all read from the Map section of v_metric_values.
export async function GET(request: Request) {
  try {
    const dashboard = new URL(request.url).searchParams.get("dashboard") ?? "";
    if (!["HEMP", "HECO"].includes(dashboard)) {
      return NextResponse.json({ error: "dashboard must be HEMP or HECO" }, { status: 400 });
    }
    const intervention = new URL(request.url).searchParams.get("intervention");
    let query = getSupabaseServer()
      .from("v_metric_values")
      .select("intervention, item, country, breakdown, value")
      .eq("dashboard", dashboard)
      .eq("section", "Map")
      .eq("segment", "all")
      .eq("value_type", "actual");
    if (intervention) query = query.eq("intervention", intervention);
    const { data, error } = await query;
    if (error) {
      console.error("[API] Supabase error for dashboard map:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const byCountry = new Map<string, HempMapCountry>();
    const totals: Record<string, number> = {};
    const unreported: Record<string, number> = {};

    for (const row of data ?? []) {
      const value = Number(row.value);
      if (row.intervention && !row.breakdown) {
        // Programme rows: counted in the total whether or not they have a country.
        totals[row.intervention] = (totals[row.intervention] ?? 0) + value;
        if (!row.country) {
          if (row.item === "Unreported") unreported[row.intervention] = value;
          continue;
        }
      }
      if (!row.country) continue;

      if (!byCountry.has(row.country)) {
        byCountry.set(row.country, { country: row.country, missionStudents: null, interventions: {} });
      }
      const entry = byCountry.get(row.country)!;
      if (row.breakdown === "Mission Students") entry.missionStudents = value;
      else if (row.intervention && !row.breakdown) entry.interventions[row.intervention] = value;
    }

    const body: HempMapData = { countries: Array.from(byCountry.values()), totals, unreported };
    return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    console.error("[API] Error fetching dashboard map:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
