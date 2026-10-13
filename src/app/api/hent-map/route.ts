import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { toCountries } from "@/lib/shape";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const breakdown = new URL(request.url).searchParams.get("breakdown");
    let query = getSupabaseServer()
      .from("v_map_values")
      .select("*")
      .eq("dashboard", "HENT")
      .eq("value_type", "actual");
    if (breakdown) query = query.eq("breakdown", breakdown);

    const { data, error } = await query;
    if (error) {
      console.error("[API] Supabase error for HENT map:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(toCountries(data ?? []));
  } catch (error: any) {
    console.error("[API] Error fetching HENT map:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
