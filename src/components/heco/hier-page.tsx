"use client";
// Health Expert in Residence Programme page: six stat cards, participants per session, experts by area, feedback ratings.
import { Users, BookOpen, Briefcase, TrendingUp, type LucideIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import HeaderDesign from "@/components/layout/header-design";
import FeaturedImpactStory from "@/components/layout/featured-impact-story";
import { ChartWithPlaceholder } from "@/components/ChartWithPlaceholder";
import { HeaderStatsPanel, type HeaderStatCard } from "@/components/hemp/header-stats-panel";
import { useDataSource, useSyncedAt } from "@/hooks/useDataSource";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useProgress } from "@/hooks/useProgress";
import { HECO_BAR, HECO_GRID, HECO_NAVY, Panel, ProgrammeBanner, SectionLabel, formatPercent } from "@/components/heco/heco-shared";

const PROGRAMME = "Health Expert in Residence Programme";
// Feedback ratings from lowest to highest, one segment each in the stacked bar.
const RATINGS = ["Poor", "Fair", "Good", "Very Good", "Excellent"];
const RATING_COLOURS = ["#D45F2C", "#F5A76D", "#EAB308", "#479BD6", "#14306B"];

const CARDS: { label: string; icon: LucideIcon; format?: "percent" | "score"; tip: string }[] = [
  { label: "Experts Hosted", icon: Users, tip: "Health experts hosted in residence" },
  { label: "Sessions Delivered", icon: BookOpen, tip: "Sessions and events delivered" },
  { label: "Participants Reached", icon: Users, tip: "Participants reached across sessions" },
  { label: "Female Participation (%)", icon: Users, format: "percent", tip: "Share of female participants" },
  { label: "Partner Organisations", icon: Briefcase, tip: "Partner organisations" },
  { label: "Average Satisfaction Score", icon: TrendingUp, format: "score", tip: "Average participant satisfaction score" },
];

type Programme = {
  headlines: { metric: string; value: number }[];
  breakdowns: Record<string, { name: string; count: number | null }[]>;
};

export default function HierPage() {
  const dataSource = useDataSource("HECO");
  const syncedAt = useSyncedAt("HECO");
  const progressRows = useProgress("HECO", PROGRAMME);
  const { data: programme } = useDashboardData<Programme>(
    () => fetch(`/api/dashboard-intervention?dashboard=HECO&intervention=${encodeURIComponent(PROGRAMME)}`).then(r => r.json()),
    []
  );

  const headline = (label: string): number | null => programme?.headlines?.find(h => h.metric === label)?.value ?? null;
  const statCards: HeaderStatCard[] = CARDS.map(card => ({
    label: card.label,
    num: headline(card.label),
    icon: card.icon,
    displayFmt: card.format === "percent" ? formatPercent : card.format === "score" ? (n: number) => n.toFixed(1) : undefined,
    tip: card.tip,
  }));

  // Participants per session or event, in the order the workbook gives them.
  const perSession = programme?.breakdowns?.["Participants per Session"]?.map(r => ({ name: r.name, count: r.count ?? 0 })) ?? null;

  // Experts by area of expertise, largest first.
  const expertAreas = programme?.breakdowns?.["Experts by Area of Expertise"]
    ?.map(r => ({ name: r.name, count: r.count ?? 0 }))
    .sort((a, b) => b.count - a.count) ?? null;

  // Feedback ratings: one stacked row, one segment per rating from Poor to Excellent.
  const feedbackRows = programme?.breakdowns?.["Participant Feedback Ratings"];
  const feedback = feedbackRows && feedbackRows.length > 0
    ? [Object.fromEntries([["name", "Participants"], ...RATINGS.map(r => [r, feedbackRows.find(f => f.name === r)?.count ?? 0])])]
    : null;

  return (
    <div style={{ backgroundColor: "#f8fafc" }}>
      <ProgrammeBanner
        title={PROGRAMME}
        subtitle="Health experts placed within public institutions"
        dataSource={dataSource}
        syncedAt={syncedAt}
        headerDesign={<HeaderDesign />}
      />

      <div className="max-w-[1440px] mx-auto px-6 py-7 space-y-7">
        <HeaderStatsPanel title="Programme Overview" progressRows={progressRows} columns={6} cards={statCards} />

        <section className="space-y-4">
          <SectionLabel>Sessions and participants</SectionLabel>
          <Panel title="Participants per session or event" subtitle="Participants in each session, over time">
            <ChartWithPlaceholder data={perSession} height={300}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={perSession ?? []} margin={{ top: 18, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={HECO_GRID} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#374151" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Participants" fill={HECO_BAR} radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="count" position="top" fontSize={10} fill={HECO_NAVY} fontWeight={700} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartWithPlaceholder>
          </Panel>
        </section>

        <section className="space-y-4">
          <SectionLabel>Experts and feedback</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 16 }}>
            <Panel title="Experts by area of expertise" subtitle="Number of experts in each area">
              <ChartWithPlaceholder data={expertAreas} height={320}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={expertAreas ?? []} layout="vertical" margin={{ top: 6, right: 40, bottom: 0, left: 150 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={HECO_GRID} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#374151", fontWeight: 500 }} axisLine={false} tickLine={false} width={140} />
                    <Tooltip />
                    <Bar dataKey="count" fill={HECO_BAR} radius={[0, 4, 4, 0]}>
                      <LabelList dataKey="count" position="right" fontSize={10} fill={HECO_NAVY} fontWeight={700} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartWithPlaceholder>
            </Panel>
            <Panel title="Participant feedback ratings" subtitle="From Poor to Excellent">
              <ChartWithPlaceholder data={feedback} height={320}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={feedback ?? []} layout="vertical" margin={{ top: 6, right: 20, bottom: 0, left: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" hide />
                    <Tooltip />
                    <Legend />
                    {RATINGS.map((rating, i) => (
                      <Bar key={rating} dataKey={rating} stackId="feedback" fill={RATING_COLOURS[i]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </ChartWithPlaceholder>
            </Panel>
          </div>
        </section>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-4 pb-10">
        <FeaturedImpactStory footer dataSynced={syncedAt} dataSource={dataSource} />
      </div>
    </div>
  );
}
