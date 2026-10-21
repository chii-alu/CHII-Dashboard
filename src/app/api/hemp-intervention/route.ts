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
      .is("year", null)
      .eq("value_type", "actual");

    if (error) {
      console.error("[API] Supabase error for HEMP intervention:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const headlines = (data ?? [])
      .filter((row: any) => row.segment === "all" && !row.label)
      .map((row: any) => ({ metric: row.metric, value: row.value }));

    const breakdowns: Record<string, { name: string; count: number | null }[]> = {};
    (data ?? [])
      .filter((row: any) => row.segment === "all" && row.label)
      .forEach((row: any) => {
        (breakdowns[row.metric] ??= []).push({ name: row.label, count: row.value });
      });
    return NextResponse.json({ headlines, breakdowns });
  } catch (error: any) {
    console.error("[API] Error fetching HEMP intervention:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
