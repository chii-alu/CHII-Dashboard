import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

// Always fetch fresh data; never serve a saved copy.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { section: string } }
) {
  try {
    const section = decodeURIComponent(params.section);
    const supabase = getSupabaseServer();

    const [values, sync] = await Promise.all([
      supabase
        .from("v_metric_values")
        .select("*")
        .eq("dashboard", "EXEC")
        .eq("section", section)
        .is("year", null)
        .eq("value_type", "actual")
        .order("metric"),
      supabase
        .from("v_last_sync")
        .select("last_synced, workbook")
        .eq("dashboard", "EXEC")
        .maybeSingle(),
    ]);

    if (values.error) {
      console.error(`[API] Supabase error for ${section}:`, values.error);
      return NextResponse.json({ error: values.error.message }, { status: 500 });
    }

    const data = values.data ?? [];
    console.log(`[API] ${section} data rows:`, data.length);

    const headlines = data
      .filter((row: any) => row.segment === "all")
      .map((row: any) => ({ metric: row.metric, value: row.value }));

    const segments = data
      .filter((row: any) => row.segment !== "all")
      .map((row: any) => ({ metric: row.metric, segment: row.segment, value: row.value }));

    return NextResponse.json({
      headlines,
      segments,
      lastSynced: sync.data?.last_synced ?? null,
      workbook: sync.data?.workbook ?? null,
      rawRowCount: data.length,
    });
  } catch (error: any) {
    console.error(`[API] Error fetching section data:`, error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
