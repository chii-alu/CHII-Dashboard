import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const dashboard = new URL(request.url).searchParams.get("dashboard") ?? "";
    const { data, error } = await getSupabaseServer()
      .from("v_last_sync")
      .select("workbook, last_synced")
      .eq("dashboard", dashboard)
      .maybeSingle();
    if (error) {
      console.error("[API] Supabase error for data source:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ workbook: data?.workbook ?? null, lastSynced: data?.last_synced ?? null });
  } catch (error: any) {
    console.error("[API] Error fetching data source:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
