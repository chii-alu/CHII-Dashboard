import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { toCountries } from "@/lib/shape";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// HEMP participants per country, for the At a Glance map.
export async function GET() {
  try {
    const { data, error } = await getSupabaseServer()
      .from("v_map_values")
      .select("*")
      .eq("dashboard", "HEMP")
      .eq("metric", "Participants by Country")
      .eq("value_type", "actual");
    if (error) {
      console.error("[API] Supabase error for HEMP map:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(toCountries(data ?? []), { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    console.error("[API] Error fetching HEMP map:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
