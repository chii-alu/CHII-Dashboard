import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    const key = supabaseServiceKey || supabaseAnonKey;
    const supabase = getSupabaseServer();

    // Fetch all Youth in Work data
    const { data, error } = await supabase
      .from("v_metric_values")
      .select("*")
      .eq("dashboard", "EXEC")
      .eq("section", "Youth in Work")
      .is("year", null)
      .order("metric");

    if (error) {
      console.error("[API] Supabase error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log("[API] Youth in Work data rows:", data?.length || 0);

    // Extract metrics from Youth in Work section
    const metricsMap = new Map<string, number>();
    data?.forEach((row: any) => {
      if (row.segment === "all" && !metricsMap.has(row.metric)) {
        metricsMap.set(row.metric, row.value);
      }
    });

    // Fetch "Jobs Created (Total)" from "At a Glance" section
    const { data: atGlanceData, error: atGlanceError } = await supabase
      .from("v_metric_values")
      .select("*")
      .eq("dashboard", "EXEC")
      .eq("section", "At a Glance")
      .is("year", null)
      .eq("metric", "Jobs Created (Total)")
      .eq("segment", "all")
      .limit(1);

    if (!atGlanceError && atGlanceData && atGlanceData.length > 0) {
      metricsMap.set("Jobs Created (Total)", atGlanceData[0].value);
    }

    // Get only available metrics from Supabase (don't add hardcoded values)
    const totalParticipants = metricsMap.get("Participants") || 0;
    const inInternships = metricsMap.get("In Internships") || 0;

    const participants: unknown[] = [];

    // Only return metrics that actually exist in Supabase
    const metrics: any = {};
    if (metricsMap.has("Participants")) {
      metrics.totalParticipants = totalParticipants;
    }
    if (metricsMap.has("In Internships")) {
      metrics.inInternships = inInternships;
    }
    if (metricsMap.has("Jobs Created (Total)")) {
      metrics.jobsCreated = metricsMap.get("Jobs Created (Total)");
    }
    const byLabel = (metric: string, label: string) =>
      data?.find((r: any) => r.metric === metric && r.segment === "all" && r.label === label)?.value ?? null;
    const bySegment = (metric: string, segment: string) =>
      data?.find((r: any) => r.metric === metric && r.segment === segment)?.value ?? null;
    metrics.primaryJobs = byLabel("Primary & Secondary Jobs", "Primary Jobs");
    metrics.secondaryJobs = byLabel("Primary & Secondary Jobs", "Secondary Jobs");
    metrics.femaleYouthInWork = bySegment("Youth In Work Trend By Inclusion", "female");
    metrics.refugeeYouthInWork = bySegment("Youth In Work Trend By Inclusion", "refugee_idp");
    metrics.pwdYouthInWork = bySegment("Youth In Work Trend By Inclusion", "pwd");

    return NextResponse.json({
      participants,
      total: participants.length,
      metrics,
      availableMetrics: Array.from(metricsMap.keys()),
      rawData: data || [],
    });
  } catch (error: any) {
    console.error("[API] Error fetching Youth in Work participants:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
