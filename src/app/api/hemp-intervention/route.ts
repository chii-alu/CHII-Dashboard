import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const intervention = new URL(request.url).searchParams.get("intervention") ?? "";
    const { data, error } = await getSupabaseServer()
      .from("v_metric_values")
      .select("*")
      .eq("dashboard", "HEMP")
      .eq("section", "Intervention")
      .eq("intervention", intervention)
      ;

    if (error) {
      console.error("[API] Supabase error for HEMP intervention:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Yearly rows: any segment with a year, plus non-'all' segments (e.g. refugee_idp, pwd, female).
    const yearly = (data ?? []).filter((row: any) => row.value_type === "actual" && (row.segment !== "all" || row.year !== null));
    const actual = (data ?? []).filter((row: any) => row.value_type === "actual" && row.year === null);
    const headlines = actual
      .filter((row: any) => row.segment === "all" && !row.label)
      .map((row: any) => ({ metric: row.metric, value: row.value }));

    const breakdowns: Record<string, { name: string; count: number | null }[]> = {};
    actual
      .filter((row: any) => row.segment === "all" && row.label)
      .forEach((row: any) => {
        (breakdowns[row.metric] ??= []).push({ name: row.label, count: row.value });
      });
    const segments = yearly.map((row: any) => ({ metric: row.metric, segment: row.segment, year: row.year, value: row.value }));
    return NextResponse.json({ headlines, breakdowns, segments });
  } catch (error: any) {
    console.error("[API] Error fetching HEMP intervention:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
