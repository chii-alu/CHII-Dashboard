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
      .eq("value_type", "actual")
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

    const participants: unknown[] = [];

    // Card numbers: only the 'Youth In Work Metrics' group, actual values, all segments.
    const cardRows = (data ?? []).filter((r: any) => r.metric_group === "Youth In Work Metrics" && r.segment === "all");
    const cardValue = (metric: string) => cardRows.find((r: any) => r.metric === metric)?.value ?? null;
    const metrics: any = {
      totalParticipants: cardValue("Participants"),
      inInternships: cardValue("In Internships"),
      employed: cardValue("In Employment (Wage)"),
      founders: cardValue("Enterprise (Self-employment)"),
      jobsCreated: cardValue("Jobs Created"),
      femalePct: cardValue("Female Share (%)"),
      africaPct: cardValue("Based in Africa (%)"),
    };
    const byLabel = (metric: string, label: string) =>
      data?.find((r: any) => r.metric === metric && r.segment === "all" && r.label === label)?.value ?? null;
    const bySegment = (metric: string, segment: string) =>
      data?.find((r: any) => r.metric === metric && r.segment === segment)?.value ?? null;
    metrics.primaryJobs = byLabel("Primary & Secondary Jobs", "Primary Jobs");
    metrics.secondaryJobs = byLabel("Primary & Secondary Jobs", "Secondary Jobs");
    metrics.femaleYouthInWork = bySegment("Youth In Work Trend By Inclusion", "female");
    metrics.refugeeYouthInWork = bySegment("Youth In Work Trend By Inclusion", "refugee_idp");
    metrics.pwdYouthInWork = bySegment("Youth In Work Trend By Inclusion", "pwd");
    const byBreakdown = (metric: string, breakdown: string, segment: string) =>
      data?.find((r: any) => r.metric === metric && r.breakdown === breakdown && r.segment === segment)?.value ?? null;
    metrics.femalePrimaryJobs = byBreakdown("Primary & Secondary Jobs By Priority Group", "Primary Jobs", "female");
    metrics.femaleSecondaryJobs = byBreakdown("Primary & Secondary Jobs By Priority Group", "Secondary Jobs", "female");

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
