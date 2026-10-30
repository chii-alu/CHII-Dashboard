"use client";
import { useState } from "react";
// Public Sector Innovation Hackathon page: six stat cards, hackathon funnel, projects by problem area, participation by round split by gender.
import { Users, FileText, Lightbulb, Rocket, HandCoins, type LucideIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import HeaderDesign from "@/components/layout/header-design";
import FeaturedImpactStory from "@/components/layout/featured-impact-story";
import { ChartWithPlaceholder } from "@/components/ChartWithPlaceholder";
import { HeaderStatsPanel, type HeaderStatCard } from "@/components/hemp/header-stats-panel";
import { useDataSource, useSyncedAt } from "@/hooks/useDataSource";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useProgress } from "@/hooks/useProgress";
import { HECO_BAR, HECO_GRID, HECO_NAVY, Panel, ProgrammeBanner, SectionTabs, formatPercent } from "@/components/heco/heco-shared";

const PROGRAMME = "Public Sector Innovation Hackathon";
const CATEGORIES = [
  { name: "Funnel and Projects", blurb: "Teams entered, winners and projects by problem area" },
  { name: "Participation by Round", blurb: "Female and male participants in each hackathon round" },
];
const FUNNEL = ["Teams Entered", "Round 1 Winners", "Final Winners"];
const GENDER_COLOURS = { Female: "#D45F2C", Male: "#479BD6" };

const CARDS: { label: string; icon: LucideIcon; format?: "percent" | "currency"; tip: string }[] = [
  { label: "Student Participants", icon: Users, tip: "Students taking part in the hackathon" },
  { label: "Projects Submitted", icon: FileText, tip: "Projects submitted by teams" },
  { label: "Problem Statements Used", icon: Lightbulb, tip: "Problem statements taken from the PSF fellows" },
  { label: "Ventures Funded", icon: Rocket, tip: "Ventures funded (target: about 25)" },
  { label: "Total Seed Funding Awarded", icon: HandCoins, format: "currency", tip: "Total seed funding awarded to teams" },
  { label: "Female Participation (%)", icon: Users, format: "percent", tip: "Share of female participants" },
];

type Programme = {
  headlines: { metric: string; value: number }[];
  breakdowns: Record<string, { name: string; count: number | null }[]>;
  segments: { metric: string; segment: string; year: number | null; label: string | null; value: number }[];
};

export default function HackathonPage() {
  const dataSource = useDataSource("HECO");
  const syncedAt = useSyncedAt("HECO");
  const progressRows = useProgress("HECO", PROGRAMME);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].name);
  const { data: programme } = useDashboardData<Programme>(
    () => fetch(`/api/dashboard-intervention?dashboard=HECO&intervention=${encodeURIComponent(PROGRAMME)}`).then(r => r.json()),
    []
  );

  const headline = (label: string): number | null => programme?.headlines?.find(h => h.metric === label)?.value ?? null;
  const statCards: HeaderStatCard[] = CARDS.map(card => ({
    label: card.label,
    num: headline(card.label),
    icon: card.icon,
    displayFmt: card.format === "percent" ? formatPercent : card.format === "currency" ? (n: number) => `$${Math.round(n).toLocaleString()}` : undefined,
    tip: card.tip,
  }));

  // Funnel: the three stages in order. Null when the workbook has no funnel rows.
  const funnelRows = programme?.breakdowns?.["Hackathon Funnel"];
  const funnel = funnelRows && funnelRows.length > 0
    ? FUNNEL.map(stage => ({ name: stage, count: funnelRows.find(r => r.name === stage)?.count ?? 0 }))
    : null;

  // Projects by problem area, largest first.
  const problemAreas = programme?.breakdowns?.["Projects by Problem Area"]
    ?.map(r => ({ name: r.name, count: r.count ?? 0 }))
    .sort((a, b) => b.count - a.count) ?? null;

  // Participation by round, split by gender: one row per round, in the order the workbook gives them.
  const genderRows = (programme?.segments ?? []).filter(r => r.metric === "Participation by Hackathon Round" && r.year == null && r.label && (r.segment === "female" || r.segment === "male"));
  const rounds = Array.from(new Set(genderRows.map(r => r.label as string)));
  const byRound = rounds.length > 0
    ? rounds.map(round => ({
        name: round,
        Female: genderRows.find(r => r.label === round && r.segment === "female")?.value ?? 0,
        Male: genderRows.find(r => r.label === round && r.segment === "male")?.value ?? 0,
      }))
    : null;

  return (
    <div style={{ backgroundColor: "#f8fafc" }}>
      <ProgrammeBanner
        title={PROGRAMME}
        subtitle="Innovation challenges that tackle public health problems"
        dataSource={dataSource}
        syncedAt={syncedAt}
        headerDesign={<HeaderDesign />}
      />

      <div className="max-w-[1440px] mx-auto px-6 py-7 space-y-7">
        <HeaderStatsPanel title="Programme Overview" progressRows={progressRows} columns={6} cards={statCards} />

        <SectionTabs categories={CATEGORIES} active={activeCategory} onChange={setActiveCategory} />

        {activeCategory === "Funnel and Projects" && (
          <>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 16 }}>
            <Panel title="Hackathon funnel" subtitle="Teams entered, round 1 winners and final winners" legend={[{ label: "Teams", color: "#479BD6" }]}>
              <ChartWithPlaceholder data={funnel} height={320}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={funnel ?? []} margin={{ top: 18, right: 10, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={HECO_GRID} vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#374151" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="count" name="Teams" fill={HECO_BAR} radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="count" position="top" fontSize={10} fill={HECO_NAVY} fontWeight={700} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartWithPlaceholder>
            </Panel>
            <Panel title="Projects by problem area" subtitle="Each problem area is a problem taken from a PSF fellow" legend={[{ label: "Projects", color: "#479BD6" }]}>
              <ChartWithPlaceholder data={problemAreas} height={320}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={problemAreas ?? []} layout="vertical" margin={{ top: 6, right: 40, bottom: 0, left: 150 }}>
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
          </div>
          </>
        )}

        {activeCategory === "Participation by Round" && (
          <>
          <Panel title="Participation by hackathon round, split by gender" subtitle="Female and male participants in each round" legend={[{ label: "Female", color: "#D45F2C" }, { label: "Male", color: "#479BD6" }]}>
            <ChartWithPlaceholder data={byRound} height={300}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={byRound ?? []} margin={{ top: 18, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={HECO_GRID} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#374151" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="Female" stackId="gender" fill={GENDER_COLOURS.Female} />
                  <Bar dataKey="Male" stackId="gender" fill={GENDER_COLOURS.Male} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartWithPlaceholder>
          </Panel>
          </>
        )}
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-4 pb-10">
        <FeaturedImpactStory footer dataSynced={syncedAt} dataSource={dataSource} />
      </div>
    </div>
  );
}
