import { redirect } from "next/navigation";
import { createSupabaseSessionClient } from "@/lib/supabase-session-server";
import StoriesView, { type CityMarker, type StoryRow, type StorySummary } from "./stories-view";

// Stories contain personal data: the page needs a signed-in session, and the rows are read with that session.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ImpactStoriesPage() {
  const supabase = createSupabaseSessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const [storiesResult, summaryResult, markersResult] = await Promise.all([
    supabase
      .from("impact_stories")
      .select("story_id, story_name, story_type, story_url, date_captured, featured, academic_program, countries(name), pillars(code), academic_programs(code, name)")
      .order("featured", { ascending: false })
      .order("story_id"),
    supabase.from("v_story_summary").select("*").maybeSingle(),
    supabase.from("v_story_markers").select("*"),
  ]);

  const stories: StoryRow[] = storiesResult.error ? [] : ((storiesResult.data ?? []) as unknown as StoryRow[]);
  const summary: StorySummary | null = summaryResult.error ? null : ((summaryResult.data ?? null) as StorySummary | null);
  const cities: CityMarker[] = markersResult.error ? [] : ((markersResult.data ?? []) as CityMarker[]);

  return <StoriesView stories={stories} summary={summary} cities={cities} />;
}
