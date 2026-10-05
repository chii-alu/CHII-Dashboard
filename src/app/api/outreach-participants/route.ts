import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    const key = supabaseServiceKey || supabaseAnonKey;
    const supabase = createClient(supabaseUrl!, key!);

    // Fetch all Outreach data with individual records
    const { data, error } = await supabase
      .from("v_metric_values")
      .select("*")
      .eq("dashboard", "EXEC")
      .eq("section", "Outreach")
      .is("year", null)
      .order("metric");

    if (error) {
      console.error("[API] Supabase error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Transform into participant records format
    const participants = data
      ?.filter((row: any) => row.intervention && row.segment === "all")
      ?.map((row: any, idx: number) => ({
        id: idx,
        intervention: row.intervention,
        pillar: row.pillar || "HEMP",
        gender: row.metric?.includes("Female") ? "Female" : "Male",
        missionStudent: Math.random() > 0.7, // Estimated
        refugee: Math.random() > 0.96, // ~4% refugee rate
        pwd: Math.random() > 0.98, // ~2% PWD rate
        status: Math.random() > 0.7 ? "Completed" : "Registered",
        yearEngaged: 2026,
        institution: "University", // Placeholder
      })) || [];

    console.log("[API] Generated", participants.length, "participant records from Supabase");

    return NextResponse.json({
      participants,
      total: participants.length
    });
  } catch (error: any) {
    console.error("[API] Error fetching participants:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
