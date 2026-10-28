import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request, { params }: { params: { section: string } }) {
  try {
    const section = decodeURIComponent(params.section);
    const { data, error } = await getSupabaseServer()
      .from("v_metric_values")
      .select("*")
      .eq("dashboard", "HEMP")
      .eq("section", section)
      .is("year", null)
      ;
    if (error) {
      console.error(`[API] Supabase error for HEMP ${section}:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const rows = (data ?? []).filter((row: any) => row.segment === "all" && !row.label);
    const headlines = rows
      .filter((row: any) => row.value_type === "actual")
      .map((row: any) => ({ metric: row.metric, value: row.value }));
    const targets = rows
      .filter((row: any) => row.value_type === "target")
      .map((row: any) => ({ metric: row.metric, value: row.value }));
    return NextResponse.json({ headlines, targets });
  } catch (error: any) {
    console.error("[API] Error fetching HEMP section:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
