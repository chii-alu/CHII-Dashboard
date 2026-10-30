"use client";
// Public Sector Fellowship page: six stat cards, applicant funnel, fellows by country, capstone projects.
import { useState } from "react";
import { Users, GraduationCap, TrendingUp, Globe, type LucideIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useDataSource, useSyncedAt } from "@/hooks/useDataSource";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useProgress } from "@/hooks/useProgress";
import { HeaderStatsPanel, type HeaderStatCard } from "@/components/hemp/header-stats-panel";
import { ChartWithPlaceholder } from "@/components/ChartWithPlaceholder";
import HeaderDesign from "@/components/layout/header-design";
import FeaturedImpactStory from "@/components/layout/featured-impact-story";
import HecoMap from "@/components/heco/heco-map";
import { HECO_NAVY, formatPercent } from "@/components/heco/heco-shared";

const PROGRAMME = "Public Sector Fellowship";
// Section tabs, each with the subheading shown under its tab.
const CATEGORIES = [
  { name: "Reach & Engagement", blurb: "Applicants, fellows and where they come from" },
  { name: "Capstone Projects", blurb: "Capstone projects by problem area" },
];
const BAR = "#479BD6";
const LIGHT_BORDER = "rgba(20, 48, 107, 0.12)";

const CARDS: { label: string; icon: LucideIcon; percent?: boolean; tip: string }[] = [
  { label: "Total Applicants", icon: Users, tip: "Applications received for the fellowship" },
  { label: "Fellows Accepted", icon: Users, tip: "Applicants accepted as fellows" },
  { label: "Fellows Graduated", icon: GraduationCap, tip: "Fellows who completed the fellowship" },
  { label: "Completion Rate", icon: TrendingUp, percent: true, tip: "Share of accepted fellows who completed" },
  { label: "Countries Represented", icon: Globe, tip: "Countries the fellows come from" },
  { label: "Female Fellows", icon: Users, percent: true, tip: "Share of fellows who are female" },
];

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "white", borderRadius: 10, border: `1px solid ${LIGHT_BORDER}`, overflow: "hidden" }}>
      <div style={{ backgroundColor: HECO_NAVY, padding: "12px 20px" }}>
        <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "white" }}>{title}</p>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{subtitle}</p>
      </div>
      <div style={{ padding: "16px 18px" }}>{children}</div>
    </div>
  );
}

export default function PsfPage() {
  const dataSource = useDataSource("HECO");
  const syncedAt = useSyncedAt("HECO");
  const progressRows = useProgress("HECO", PROGRAMME);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].name);
  const active = CATEGORIES.find(c => c.name === activeCategory) ?? CATEGORIES[0];

  const { data: programme } = useDashboardData<{ headlines: { metric: string; value: number }[]; breakdowns: Record<string, { name: string; count: number | null }[]> }>(
    () => fetch(`/api/dashboard-intervention?dashboard=HECO&intervention=${encodeURIComponent(PROGRAMME)}`).then(r => r.json()),
    []
  );
  const { data: mapData } = useDashboardData<{ countries: { country: string; interventions: Record<string, number>; missionStudents: number | null }[] }>(
    () => fetch(`/api/dashboard-map?dashboard=HECO&intervention=${encodeURIComponent(PROGRAMME)}`).then(r => r.json()),
    []
  );

  const headline = (label: string): number | null => programme?.headlines?.find(h => h.metric === label)?.value ?? null;

  const statCards: HeaderStatCard[] = CARDS.map(card => ({
    label: card.label,
    num: headline(card.label),
    icon: card.icon,
    displayFmt: card.percent ? formatPercent : undefined,
    tip: card.tip,
  }));

  // Capstone projects: one bar per problem area, largest first.
  const capstoneBars = programme?.breakdowns?.["Capstone Projects"]
    ?.map(r => ({ name: r.name, count: r.count ?? 0 }))
    .sort((a, b) => b.count - a.count) ?? null;

  // Fellows by country: this programme's count per country, largest first.
  const countryBars = mapData?.countries
    ?.map(c => ({ name: c.country, count: c.interventions[PROGRAMME] ?? c.missionStudents ?? 0 }))
    .sort((a, b) => b.count - a.count) ?? null;

  return (
    <div style={{ backgroundColor: "#f8fafc" }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-2">
        <header style={{ position: "relative", overflow: "hidden", backgroundColor: HECO_NAVY, borderRadius: 12, minHeight: 120, display: "flex", alignItems: "center" }}>
          <HeaderDesign />
          <div className="px-4 sm:px-6 py-6" style={{ position: "relative", zIndex: 10, width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <h1 className="text-lg font-black leading-tight" style={{ color: "white", letterSpacing: "0.01em" }}>{PROGRAMME}</h1>
              <p className="text-[13px] mt-2 font-medium" style={{ color: "rgba(215,225,245,0.8)" }}>Public sector fellows building capacity in health systems</p>
              <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[12px]" style={{ color: "rgba(215,225,245,0.5)" }}>
                <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Data source:</span> {dataSource}</span>
                <span aria-hidden="true">·</span>
                <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Last updated:</span> {syncedAt}</span>
              </div>
            </div>
          </div>
        </header>
      </div>

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
                  fontSize: 11.5, fontWeight: 700, padding: "7px 13px", borderRadius: 999, cursor: "pointer",
                  border: `1px solid ${on ? HECO_NAVY : "rgba(20,48,107,0.15)"}`,
                  backgroundColor: on ? HECO_NAVY : "white", color: on ? "white" : "#6B7280",
                }}
              >
                {category.name}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ width: 3, height: 16, borderRadius: 999, backgroundColor: HECO_NAVY, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: HECO_NAVY, lineHeight: 1.2, margin: 0 }}>{active.name}</p>
              <p style={{ fontSize: 11, color: "#6B7280", marginTop: 3, margin: 0 }}>{active.blurb}</p>
            </div>
          </div>
        </div>

        {activeCategory === "Reach & Engagement" && (
          <>
        <section className="space-y-4">
          <Panel title="Applicant funnel by cohort" subtitle="Applied, accepted and graduated, by cohort">
            <ChartWithPlaceholder data={null} height={300}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[]}><CartesianGrid vertical={false} stroke={LIGHT_BORDER} /><XAxis dataKey="stage" /><YAxis /><Tooltip /><Bar dataKey="count" fill={BAR} /></BarChart>
              </ResponsiveContainer>
            </ChartWithPlaceholder>
          </Panel>
        </section>

        <section className="space-y-4">
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 16 }}>
            <Panel title="Fellows map" subtitle="Where the fellows come from">
              <div style={{ display: "flex", minHeight: 420 }}>
                <HecoMap intervention={PROGRAMME} />
              </div>
            </Panel>
            <Panel title="Fellows by country" subtitle="Exact counts per country">
              <ChartWithPlaceholder data={countryBars} height={420}>
                <ResponsiveContainer width="100%" height={420}>
                  <BarChart data={countryBars ?? []} layout="vertical" margin={{ top: 6, right: 40, bottom: 0, left: 120 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={LIGHT_BORDER} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#374151", fontWeight: 500 }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip />
                    <Bar dataKey="count" fill={BAR} radius={[0, 4, 4, 0]}>
                      <LabelList dataKey="count" position="right" fontSize={10} fill={HECO_NAVY} fontWeight={700} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartWithPlaceholder>
            </Panel>
          </div>
        </section>
          </>
        )}

        {activeCategory === "Capstone Projects" && (
          <>
        <section className="space-y-4">
          <p style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: HECO_NAVY }}>Capstone projects</p>
          <Panel title="Capstone projects by problem area" subtitle="Number of capstone projects in each problem area">
            <ChartWithPlaceholder data={capstoneBars} height={320}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={capstoneBars ?? []} layout="vertical" margin={{ top: 6, right: 40, bottom: 0, left: 180 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={LIGHT_BORDER} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#374151", fontWeight: 500 }} axisLine={false} tickLine={false} width={170} />
                  <Tooltip />
                  <Bar dataKey="count" fill={BAR} radius={[0, 4, 4, 0]}>
                    <LabelList dataKey="count" position="right" fontSize={10} fill={HECO_NAVY} fontWeight={700} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartWithPlaceholder>
          </Panel>
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
