import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    const key = supabaseServiceKey || supabaseAnonKey;

    const supabase = createClient(supabaseUrl!, key!);

    // Get all unique sections for EXEC dashboard
    const { data: sections, error: sectionsError } = await supabase
      .from("v_metric_values")
      .select("section")
      .eq("dashboard", "EXEC")
      .eq("segment", "all");

    if (sectionsError) {
      return NextResponse.json({ error: sectionsError }, { status: 500 });
    }

    // Get unique section names
    const uniqueSections = Array.from(new Set(sections?.map((row: any) => row.section) || []));

    // For each section, get the metrics and sample data
    const sectionsData = await Promise.all(
      uniqueSections.map(async (section: string) => {
        const { data } = await supabase
          .from("v_metric_values")
          .select("metric, value, segment")
          .eq("dashboard", "EXEC")
          .eq("section", section)
          .eq("segment", "all")
          .order("metric");

        const metrics = data?.map((row: any) => ({
          metric: row.metric,
          value: row.value,
        })) || [];

        return {
          section,
          rowCount: data?.length || 0,
          metrics,
        };
      })
    );

    return NextResponse.json({ sections: sectionsData });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
