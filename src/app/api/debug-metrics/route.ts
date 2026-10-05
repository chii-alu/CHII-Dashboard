import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    const key = supabaseServiceKey || supabaseAnonKey;
    const supabase = createClient(supabaseUrl!, key!);

    // Get all data for metrics that might be used
    const metrics = [
      'Youth with Disability',
      'Refugee / IDP',
      'Wage Employment',
      'Job Seeking',
      'Further Education'
    ];

    const results: any = {};

    for (const metric of metrics) {
      const { data } = await supabase
        .from("v_metric_values")
        .select("metric, segment, value, item, breakdown")
        .eq("dashboard", "EXEC")
        .eq("section", "At a Glance")
        .eq("metric", metric)
        .order("segment");

      results[metric] = data || [];
    }

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
