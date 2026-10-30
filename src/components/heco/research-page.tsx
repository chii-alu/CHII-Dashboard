"use client";
// Research Activities page: six stat cards, papers by topic, grant pipeline, masterclass attendance per session.
import { FlaskConical, FileText, HandCoins, Building2, Users, type LucideIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import HeaderDesign from "@/components/layout/header-design";
import FeaturedImpactStory from "@/components/layout/featured-impact-story";
import { ChartWithPlaceholder } from "@/components/ChartWithPlaceholder";
import { HeaderStatsPanel, type HeaderStatCard } from "@/components/hemp/header-stats-panel";
import { useDataSource, useSyncedAt } from "@/hooks/useDataSource";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useProgress } from "@/hooks/useProgress";
import { HECO_BAR, HECO_GRID, HECO_NAVY, Panel, ProgrammeBanner, SectionLabel } from "@/components/heco/heco-shared";

const PROGRAMME = "Research Activities";
// Grant pipeline stages, in order, one segment each in the stacked bar.
const STAGES = ["Applied", "Under Review", "Awarded", "Rejected"];
const STAGE_COLOURS = ["#479BD6", "#EAB308", "#16A34A", "#D45F2C"];

const CARDS: { label: string; icon: LucideIcon; tip: string }[] = [
  { label: "Research Projects", icon: FlaskConical, tip: "Research projects underway or completed" },
  { label: "Papers Published", icon: FileText, tip: "Papers published (target: 2 per year)" },
  { label: "Grants Applied For", icon: HandCoins, tip: "Grant applications submitted" },
  { label: "Grants Secured / Funding Raised", icon: HandCoins, tip: "Grants secured and funding raised" },
  { label: "Institutions & Hospitals Engaged", icon: Building2, tip: "Institutions and hospitals engaged in research" },
  { label: "Masterclass Participants", icon: Users, tip: "Participants in research masterclasses" },
];

type Programme = {
  headlines: { metric: string; value: number }[];
  breakdowns: Record<string, { name: string; count: number | null }[]>;
};

export default function ResearchPage() {
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
    tip: card.tip,
  }));

  // Papers by research topic, largest first.
  const topics = programme?.breakdowns?.["Papers by Research Topic"]
    ?.map(r => ({ name: r.name, count: r.count ?? 0 }))
    .sort((a, b) => b.count - a.count) ?? null;

  // Grant pipeline: one stacked row, one segment per stage.
  const pipelineRows = programme?.breakdowns?.["Grant Pipeline"];
  const pipeline = pipelineRows && pipelineRows.length > 0
    ? [Object.fromEntries([["name", "Grants"], ...STAGES.map(s => [s, pipelineRows.find(p => p.name === s)?.count ?? 0])])]
    : null;

  // Masterclass attendance, one bar per session, in the workbook's order.
  const attendance = programme?.breakdowns?.["Masterclass Attendance per Session"]?.map(r => ({ name: r.name, count: r.count ?? 0 })) ?? null;

  return (
    <div style={{ backgroundColor: "#f8fafc" }}>
      <ProgrammeBanner
        title={PROGRAMME}
        subtitle="Health ecosystem research and evidence generation"
        dataSource={dataSource}
        syncedAt={syncedAt}
        headerDesign={<HeaderDesign />}
      />

      <div className="max-w-[1440px] mx-auto px-6 py-7 space-y-7">
        <HeaderStatsPanel title="Programme Overview" progressRows={progressRows} columns={6} cards={statCards} />

        <section className="space-y-4">
          <SectionLabel>Research output and funding</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 16 }}>
            <Panel title="Papers by research topic" subtitle="Number of papers in each topic">
              <ChartWithPlaceholder data={topics} height={320}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={topics ?? []} layout="vertical" margin={{ top: 6, right: 40, bottom: 0, left: 150 }}>
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
            <Panel title="Grant pipeline" subtitle="Applied, under review, awarded and rejected">
              <ChartWithPlaceholder data={pipeline} height={320}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={pipeline ?? []} layout="vertical" margin={{ top: 6, right: 20, bottom: 0, left: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" hide />
                    <Tooltip />
                    <Legend />
                    {STAGES.map((stage, i) => (
                      <Bar key={stage} dataKey={stage} stackId="pipeline" fill={STAGE_COLOURS[i]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </ChartWithPlaceholder>
            </Panel>
          </div>
        </section>

        <section className="space-y-4">
          <SectionLabel>Masterclass training</SectionLabel>
          <Panel title="Masterclass attendance per session" subtitle="Training attendance, kept separate from research output">
            <ChartWithPlaceholder data={attendance} height={300}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendance ?? []} margin={{ top: 18, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={HECO_GRID} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#374151" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Attendees" fill={HECO_BAR} radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="count" position="top" fontSize={10} fill={HECO_NAVY} fontWeight={700} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartWithPlaceholder>
          </Panel>
        </section>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-4 pb-10">
        <FeaturedImpactStory footer dataSynced={syncedAt} dataSource={dataSource} />
      </div>
    </div>
  );
}
