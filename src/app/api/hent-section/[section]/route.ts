import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { section: string } }
) {
  try {
    const section = decodeURIComponent(params.section);
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("v_metric_values")
      .select("*")
      .eq("dashboard", "HENT")
      .eq("section", section)
      .is("year", null)
      .order("metric");

    if (error) {
      console.error(`[API] Supabase error for HENT ${section}:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = data ?? [];
    const headlines = rows
      .filter((row: any) => row.segment === "all")
      .map((row: any) => ({ metric: row.metric, value: row.value }));
    const segments = rows
      .filter((row: any) => row.segment !== "all")
      .map((row: any) => ({ metric: row.metric, segment: row.segment, value: row.value }));

    return NextResponse.json({ headlines, segments, rawRowCount: rows.length });
  } catch (error: any) {
    console.error("[API] Error fetching HENT section:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
