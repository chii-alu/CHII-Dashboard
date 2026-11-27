"use client";
// HENT Incubator Program: ventures moving through the three incubator stages,
// Ideation -> Expose -> Scale. Laid out like the other HENT intervention pages.
// No incubator rows are in Supabase yet, so every card and chart shows "In coming data".
import { useProgress } from "@/hooks/useProgress";
import { useDashboardData } from "@/hooks/useDashboardData";
import { ChartWithPlaceholder } from "@/components/ChartWithPlaceholder";
import { HeaderStatsPanel, FilterButton, FilterDropdown } from "@/components/ui/hent";
import { useDataSource, useSyncedAt } from "@/hooks/useDataSource";
import { PortalThemeProvider, ChartCard, Funnel, ChartTip } from "@/components/ui";
import PortalNav from "@/components/layout/portal-nav";
import PortalFooter from "@/components/layout/portal-footer";
import SectionPills from "@/components/filters/section-pills";
import { DonutRing } from "@/components/charts/donut-chart";
import { PeriodPicker } from "@/components/filters/period-picker";
import { ALL_PERIODS } from "@/lib/filter-years";
import { Briefcase, DollarSign, Lightbulb, Rocket, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import {
  Bar, BarChart, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from "recharts";

// ─── Theme (HENT green) ──────────────────────────────────────────────────────
const HERO     = "#2D6A4F";
const BRAND    = "#2D6A4F";
const BRAND_DK = "#0E4633";
const DISTINCT = ["#2E7D5B","#E76F51","#2A6F97","#E9C46A","#6A4C93","#E63946","#43AA8B","#F4A261"];

const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
const count = (n: number) => Math.round(n).toLocaleString();
const percent = (n: number) => `${Math.round(n)}%`;
const usd = (n: number) => `$${Math.round(n).toLocaleString()}`;

const EMPTY = <p style={ { fontSize: 14, color: "#9CA3AF", textAlign: "center", padding: 40 } }>In coming data</p>;

// Section title row, matching the other HENT pages.
function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={ { display: "flex", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" } }>
      <div style={ { display: "flex", alignItems: "baseline", gap: 8 } }>
        <span style={ { width: 3, height: 16, borderRadius: 999, backgroundColor: BRAND, flexShrink: 0 } } />
        <div>
          <p style={ { fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: BRAND_DK, lineHeight: 1.2, margin: 0 } }>{title}</p>
          <p style={ { fontSize: 11, color: "#6B7280", margin: "3px 0 0" } }>{sub}</p>
        </div>
      </div>
    </div>
  );
}

const axis = { fontSize: 11, fill: "#6B7280" };
const grid = <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" vertical={false} />;
const cursor = { fill: "rgba(0,33,71,0.04)" };
const legend = <Legend verticalAlign="bottom" align="center" wrapperStyle={ { fontSize: 10 } } />;

/** A per-year bar chart with one bar per series (stacked when `stack` is set). */
function YearBars({ data, series, stack }: { data: Record<string, any>[]; series: { key: string; color: string }[]; stack?: boolean }) {
  return (
    <ChartWithPlaceholder data={data.length ? data : null} height={240}>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={ { top: 8, right: 8, left: 0, bottom: 0 } } barCategoryGap="30%">
          {grid}
          <XAxis dataKey="Year" tick={axis} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={axis} axisLine={false} tickLine={false} width={40} />
          <Tooltip cursor={cursor} content={<ChartTip />} />
          {series.map((s, i) => (
            <Bar key={s.key} dataKey={s.key} name={s.key} fill={s.color} stackId={stack ? "s" : undefined}
              radius={!stack || i === series.length - 1 ? [4, 4, 0, 0] : undefined} maxBarSize={38} />
          ))}
          {legend}
        </BarChart>
      </ResponsiveContainer>
    </ChartWithPlaceholder>
  );
}

/** A horizontal bar list by category. */
function CategoryBars({ data, name }: { data: { name: string; value: number }[]; name: string }) {
  return (
    <ChartWithPlaceholder data={data.length ? data : null} height={260}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={ { top: 8, right: 16, left: 0, bottom: 0 } } barCategoryGap="22%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={axis} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={150} tick={ { fontSize: 10, fill: "#6B7280" } } axisLine={false} tickLine={false} />
          <Tooltip cursor={cursor} content={<ChartTip />} />
          <Bar dataKey="value" name={name} fill="#1B4332" radius={[0, 4, 4, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </ChartWithPlaceholder>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function IncubatorProgramPage() {
  // Headline values from HENT At a Glance; a card with no row shows "In coming data".
  const { data: headlineRows } = useDashboardData(
    () => fetch("/api/hent-section/At%20a%20Glance").then(r => r.json()).then(r => r.headlines || []),
    []
  );
  const headline = (metric: string): number | null =>
    headlineRows?.find((h: any) => h.metric === metric)?.value ?? null;
  const dataSource = useDataSource("HENT");
  const syncedAt = useSyncedAt("HENT");

  const [period, setPeriod] = useState(ALL_PERIODS);
  const progressRows = useProgress("HENT", undefined, undefined, undefined, period);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(1);
  const show = (n: number) => activeSection === n;

  // Chart data the database does not provide yet: empty until incubator rows exist.
  // Ideation
  const ideasPerYear: { Year: string; Female: number; Male: number }[] = [];
  const ideasByFocus: { name: string; value: number }[] = [];
  const ideationFunnel: { label: string; value: number }[] = [];
  const teamComposition: { name: string; value: number }[] = [];
  // Expose
  const exposePerYear: { Year: string; Ventures: number; Pilots: number }[] = [];
  const validationActivities: { name: string; value: number }[] = [];
  const productStage: { name: string; value: number }[] = [];
  const exposeOutcomes: { Year: string; "Advanced to Scale": number; "Still in Expose": number; Exited: number }[] = [];
  // Scale
  const revenuePerYear: { Year: string; Revenue: number; Ventures: number }[] = [];
  const jobsPerYear: { Year: string; Female: number; Male: number }[] = [];
  const fundingBySource: { name: string; value: number }[] = [];
  const scaleByCountry: { name: string; value: number }[] = [];

  return (
    <PortalThemeProvider portal="hent">
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      <PortalNav portal="hent" />

      {/* ── HEADER ─── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-2">
        <header style={{ position: "relative", overflow: "hidden", backgroundColor: HERO, borderRadius: 12, minHeight: 120, display: "flex", alignItems: "center" }}>
          <div style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", backgroundImage: "url('/images/Pat.png')", backgroundSize: "auto 100%", backgroundRepeat: "repeat", backgroundPosition: "center", opacity: 0.05 }} />
          <img src="/images/design1.png" alt="" aria-hidden="true"
            style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", height: "100%", width: "auto", zIndex: 1, pointerEvents: "none", userSelect: "none" }} />
          <img src="/images/design1.png" alt="" aria-hidden="true"
            style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%) scaleX(-1)", height: "100%", width: "auto", zIndex: 1, pointerEvents: "none", userSelect: "none" }} />
          <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", background: "linear-gradient(90deg, rgba(14,70,51,0) 0%, #2D6A4F 34%, #2D6A4F 66%, rgba(14,70,51,0) 100%)" }} />
          <div className="px-4 sm:px-6 py-6" style={{ position: "relative", zIndex: 10, width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <h1 className="text-lg font-black leading-tight" style={{ color: "white", letterSpacing: "0.01em" }}>Incubator Program</h1>
              <p className="text-[11px] mt-1.5 font-medium" style={{ color: "rgba(190,228,214,0.78)" }}>
                Taking health ventures from idea to scale through the Ideation, Expose and Scale stages
              </p>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10px]" style={{ color: "rgba(190,228,214,0.5)" }}>
                <span><span style={{ color: "rgba(190,228,214,0.8)", fontWeight: 600 }}>Data source:</span> {dataSource}</span>
                <span aria-hidden="true">·</span>
                <span><span style={{ color: "rgba(190,228,214,0.8)", fontWeight: 600 }}>Period:</span> 2025–2030</span>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* ── BODY ─── */}
      <div className="max-w-[1440px] mx-auto px-6 py-7 space-y-8">

        <HeaderStatsPanel
          progressRows={progressRows}
          title="Incubator Program Metrics"
          cards={[
            { label: "Ideas Submitted", num: headline("Ideas Submitted"), displayFmt: count, icon: Lightbulb, tip: "Venture ideas submitted to the Ideation stage." },
            { label: "Ventures in Expose", num: headline("Ventures in Expose"), displayFmt: count, icon: Users, tip: "Ventures testing their product with real users and partners in the Expose stage." },
            { label: "Ventures Scaling", num: headline("Ventures Scaling"), displayFmt: count, icon: Rocket, tip: "Ventures growing revenue, customers and teams in the Scale stage." },
            { label: "Progression Rate", num: headline("Progression Rate"), displayFmt: percent, icon: TrendingUp, tip: "Share of Ideation teams that reached the Scale stage." },
            { label: "Jobs Created", num: headline("Incubator Jobs Created"), displayFmt: count, icon: Briefcase, tip: "Jobs created by incubated ventures." },
            { label: "Funding Raised", num: headline("Incubator Funding Raised"), displayFmt: usd, icon: DollarSign, tip: "Grants, investment and prizes raised by incubated ventures, in USD." },
          ]}
        />

        {/* Stage pills (left) + filters (right) */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <SectionPills
            accent={BRAND}
            value={String(activeSection)}
            onChange={(v) => setActiveSection(Number(v))}
            options={[
              { label: "Ideation", value: "1" },
              { label: "Expose", value: "2" },
              { label: "Scale", value: "3" },
            ]}
          />
          <div style={{ position: "relative" }}>
            <FilterButton activeFilterCount={period !== ALL_PERIODS ? 1 : 0} isOpen={filtersOpen} onClick={() => setFiltersOpen(!filtersOpen)} />
            <FilterDropdown isOpen={filtersOpen} onResetFilters={() => setPeriod(ALL_PERIODS)}>
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: BRAND_DK, margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.02em" }}>Year</p>
                <PeriodPicker value={period} onChange={setPeriod} accent={BRAND} dark={BRAND_DK} border="rgba(14, 70, 51, 0.12)" hideYearHeading />
              </div>
            </FilterDropdown>
          </div>
        </div>

        {/* ── SECTION 1: Ideation ─── */}
        <section style={ { display: show(1) ? undefined : "none" } }>
          <SectionTitle title="Ideation" sub="Turning health problems into venture ideas, and choosing the ones that move on." />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Ideas Submitted per Year" sub="Venture ideas submitted, by the lead founder's gender"
              info="Ideas submitted to the Ideation stage each year, split by the gender of the lead founder.">
              <YearBars data={ideasPerYear} stack series={[{ key: "Female", color: "#1F9E9E" }, { key: "Male", color: "#1B4332" }]} />
            </ChartCard>
            <ChartCard title="Ideas by Health Focus Area" sub="The health problems ideas set out to solve"
              info="Ideas submitted, grouped by the health focus area they address.">
              <CategoryBars data={ideasByFocus} name="Ideas" />
            </ChartCard>
            <ChartCard title="Ideation Funnel" sub="Ideas submitted, shortlisted, validated and moved on to Expose"
              info="How many ideas pass each step of the Ideation stage, with the conversion from each step to the next.">
              {ideationFunnel.length ? <Funnel steps={ideationFunnel} /> : EMPTY}
            </ChartCard>
            <ChartCard title="Team Composition" sub="Ideation teams by founder background"
              info="Ideation teams grouped by founder background, for example students, alumni or external founders.">
              {teamComposition.length
                ? <DonutRing data={teamComposition} colors={DISTINCT} total={sum(teamComposition.map(d => d.value))} totalLabel="Teams" height={300} legendPercent />
                : EMPTY}
            </ChartCard>
          </div>
        </section>

        {/* ── SECTION 2: Expose ─── */}
        <section style={ { display: show(2) ? undefined : "none" } }>
          <SectionTitle title="Expose" sub="Testing ventures with real users, partners and markets." />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Ventures and Pilots per Year" sub="Ventures in the Expose stage and the pilots they ran"
              info="Ventures in the Expose stage each year and the pilots they ran with users or partners.">
              <YearBars data={exposePerYear} series={[{ key: "Ventures", color: "#1B4332" }, { key: "Pilots", color: "#A6C13C" }]} />
            </ChartCard>
            <ChartCard title="Market Validation Activities" sub="Customer interviews, user tests, pilots and partner meetings"
              info="Validation activities completed by Expose ventures, by type.">
              <CategoryBars data={validationActivities} name="Activities" />
            </ChartCard>
            <ChartCard title="Product Stage" sub="Ventures by product stage: concept, prototype, MVP or in market"
              info="Expose ventures grouped by how far their product has developed.">
              {productStage.length
                ? <DonutRing data={productStage} colors={DISTINCT} total={sum(productStage.map(d => d.value))} totalLabel="Ventures" height={300} legendPercent />
                : EMPTY}
            </ChartCard>
            <ChartCard title="Expose Outcomes" sub="Ventures that advanced to Scale, stayed in Expose or exited"
              info="What happened to Expose ventures each year: advanced to Scale, still in Expose, or exited the programme.">
              <YearBars data={exposeOutcomes} stack series={[
                { key: "Advanced to Scale", color: "#1B4332" }, { key: "Still in Expose", color: "#1F9E9E" }, { key: "Exited", color: "#E9C46A" },
              ]} />
            </ChartCard>
          </div>
        </section>

        {/* ── SECTION 3: Scale ─── */}
        <section style={ { display: show(3) ? undefined : "none" } }>
          <SectionTitle title="Scale" sub="Growing revenue, customers, jobs and funding." />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Revenue per Year" sub="Revenue earned by Scale ventures (bars, USD) and ventures reporting (line)"
              info="Total revenue earned by Scale ventures each year, in USD, and the number of ventures reporting revenue.">
              <ChartWithPlaceholder data={revenuePerYear.length ? revenuePerYear : null} height={240}>
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart data={revenuePerYear} margin={ { top: 8, right: 8, left: 0, bottom: 0 } } barCategoryGap="30%">
                    {grid}
                    <XAxis dataKey="Year" tick={axis} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="rev" tick={axis} axisLine={false} tickLine={false} width={56} tickFormatter={(v: number) => usd(v)} />
                    <YAxis yAxisId="ven" orientation="right" allowDecimals={false} tick={axis} axisLine={false} tickLine={false} width={32} />
                    <Tooltip cursor={cursor} content={<ChartTip />} />
                    <Bar yAxisId="rev" dataKey="Revenue" name="Revenue (USD)" fill="#1B4332" radius={[4, 4, 0, 0]} maxBarSize={38} />
                    <Line yAxisId="ven" type="monotone" dataKey="Ventures" name="Ventures reporting" stroke="#1F9E9E" strokeWidth={2.5} dot={ { r: 4, fill: "#1F9E9E", strokeWidth: 0 } } />
                    {legend}
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartWithPlaceholder>
            </ChartCard>
            <ChartCard title="Jobs Created per Year" sub="Jobs created by Scale ventures, by gender"
              info="Jobs created by Scale ventures each year, split by the gender of the person employed.">
              <YearBars data={jobsPerYear} stack series={[{ key: "Female", color: "#1F9E9E" }, { key: "Male", color: "#1B4332" }]} />
            </ChartCard>
            <ChartCard title="Funding Raised by Source" sub="Grants, equity, debt and prizes (USD)"
              info="Funding raised by Scale ventures, grouped by source, in USD.">
              <CategoryBars data={fundingBySource} name="Funding (USD)" />
            </ChartCard>
            <ChartCard title="Scale Ventures by Country" sub="Where Scale ventures operate"
              info="Scale ventures grouped by the country they operate in.">
              <CategoryBars data={scaleByCountry} name="Ventures" />
            </ChartCard>
          </div>
        </section>

        <PortalFooter synced={syncedAt} source={dataSource} portal="hent" />
      </div>
    </div>
    </PortalThemeProvider>
  );
}
