"use client";
// Health Expert in Residence Programme page: six stat cards, participants per session, experts by area, feedback ratings.
import { useState } from "react";
import { Users, BookOpen, Briefcase, TrendingUp, type LucideIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import HeaderDesign from "@/components/layout/header-design";
import FeaturedImpactStory from "@/components/layout/featured-impact-story";
import { ChartWithPlaceholder } from "@/components/ChartWithPlaceholder";
import { HeaderStatsPanel, type HeaderStatCard } from "@/components/hemp/header-stats-panel";
import { useDataSource, useSyncedAt } from "@/hooks/useDataSource";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useProgress } from "@/hooks/useProgress";
import { HECO_BAR, HECO_GRID, HECO_NAVY, HECO_BRAND, HECO_BRAND_DK, HECO_LIGHT_BORDER, Panel, ProgrammeBanner, formatPercent } from "@/components/heco/heco-shared";

const PROGRAMME = "Health Expert in Residence Programme";
// Section tabs, each with the subheading shown under its tab.
const CATEGORIES = [
  { name: "Sessions and Participants", blurb: "Participants reached in each session or event" },
  { name: "Experts and Feedback", blurb: "Expertise areas and participant feedback" },
];
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
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].name);
  const active = CATEGORIES.find(c => c.name === activeCategory) ?? CATEGORIES[0];
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

        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map(category => {
            const on = activeCategory === category.name;
            return (
              <button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                style={{
                  fontSize: 11, fontWeight: on ? 700 : 600, padding: "8px 14px", borderRadius: 20, cursor: "pointer",
                  border: `1px solid ${on ? HECO_BRAND : HECO_LIGHT_BORDER}`,
                  backgroundColor: on ? HECO_BRAND : "white", color: on ? "white" : HECO_BRAND_DK,
                  transition: "all 0.2s ease",
                }}
              >
                {category.name}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ width: 3, height: 16, borderRadius: 999, backgroundColor: HECO_BRAND, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: HECO_BRAND_DK, lineHeight: 1.2, margin: 0 }}>{active.name}</p>
              <p style={{ fontSize: 11, color: "#6B7280", marginTop: 3, margin: 0 }}>{active.blurb}</p>
            </div>
          </div>
        </div>

        {activeCategory === CATEGORIES[0].name && (
          <>
        <section className="space-y-4">
          <Panel title="Participants per session or event" subtitle="Participants in each session, over time" legend={[{ label: "Participants", color: "#479BD6" }]}>
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
          </>
        )}

        {activeCategory === CATEGORIES[1].name && (
          <>
        <section className="space-y-4">
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 16 }}>
            <Panel title="Experts by area of expertise" subtitle="Number of experts in each area" legend={[{ label: "Experts", color: "#479BD6" }]}>
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
            <Panel title="Participant feedback ratings" subtitle="From Poor to Excellent" legend={[{ label: "Poor", color: "#D45F2C" }, { label: "Fair", color: "#F5A76D" }, { label: "Good", color: "#EAB308" }, { label: "Very Good", color: "#479BD6" }, { label: "Excellent", color: "#14306B" }]}>
              <ChartWithPlaceholder data={feedback} height={320}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={feedback ?? []} layout="vertical" margin={{ top: 6, right: 20, bottom: 0, left: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" hide />
                    <Tooltip />
                      {RATINGS.map((rating, i) => (
                      <Bar key={rating} dataKey={rating} stackId="feedback" fill={RATING_COLOURS[i]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </ChartWithPlaceholder>
            </Panel>
          </div>
        </section>
          </>
        )}
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-4 pb-10">
        <FeaturedImpactStory footer dataSynced={syncedAt} dataSource={dataSource} />
      </div>
    </div>
  );
}
