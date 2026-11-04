"use client";
import { useProgress } from "@/hooks/useProgress";
import { useDashboardData } from "@/hooks/useDashboardData";
import { ChartWithPlaceholder } from "@/components/ChartWithPlaceholder";
import { HeaderStatsPanel, FilterButton, FilterDropdown } from "@/components/ui/hent";
import { useDataSource, useSyncedAt } from "@/hooks/useDataSource";
import { PortalThemeProvider, ChartCard, Funnel, BarList, ChartTip, useCountUp } from "@/components/ui";
import PortalNav from "@/components/layout/portal-nav";
import PortalFooter from "@/components/layout/portal-footer";
import SectionPills from "@/components/filters/section-pills";
import OutreachFilters, { FilterSelect as OFilterSelect } from "@/components/filters/filter-popover";
import { DonutRing } from "@/components/charts/donut-chart";
// HENT sample datasets are removed; the lists below stay empty until HENT rows load.
type ExposureType = string;
type StakeholderGroup = string;
const exposureEvents: any[] = [];
const EXPOSURE_TYPES: string[] = [];
const STAKEHOLDER_GROUPS: string[] = [];
const pilotEngagements: any[] = [];
// True once any sample list has rows. Charts show "In coming data" until then.
const hasHentData = [exposureEvents, pilotEngagements].some(list => list.length > 0);
import { Handshake, Link2, Mic, Star, Target, Users } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from "recharts";

// HENT sample datasets are removed. Until HENT rows load, these lists are empty and the values show "In coming data".
type Row = Record<string, any>;



// ─── Theme (HENT green) ──────────────────────────────────────────────────────
const HERO     = "#2D6A4F";
const BRAND    = "#2D6A4F";
const BRAND_DK = "#0E4633";
const LIGHT_BORDER = "rgba(14, 70, 51, 0.12)";
const GREEN_RAMP = ["#1B4332","#1F9E9E","#A6C13C","#BBD59B","#2D6A4F","#4C8C8A","#6B8E5B","#8FA45A","#40916C","#C8DDB5"];
const DISTINCT   = ["#2E7D5B","#E76F51","#2A6F97","#E9C46A","#6A4C93","#E63946","#43AA8B","#F4A261","#577590","#9B5DE5"];

const TYPE_HEX: Record<ExposureType, string> = {
  "Pitch Event":          "#1B4332",
  "Conference":           "#1F9E9E",
  "Investor Roundtable":  "#A6C13C",
  "Ecosystem Engagement": "#40916C",
  "Demo Day":             "#BBD59B",
  "Pitching Competition": "#6B8E5B",
};

function avg(a: number[]) { return a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0; }
function sum(a: number[]) { return a.reduce((x, y) => x + y, 0); }

const YEARS = Array.from(new Set(exposureEvents.map(e => e.year))).sort();
const COUNTRIES = Array.from(new Set(exposureEvents.map(e => e.country))).sort();

// ─── Derivations (filter-aware) ──────────────────────────────────────────────
function derive(rows: typeof exposureEvents) {
  const events = rows.length;
  const founders = sum(rows.map(e => e.founders));
  const femaleFounders = sum(rows.map(e => e.femaleFounders));
  const femalePct = founders ? Math.round(femaleFounders / founders * 100) : 0;
  const ventures = sum(rows.map(e => e.ventures));
  const connections = sum(rows.map(e => e.connections));
  const followUps = sum(rows.map(e => e.followUps));
  const deals = sum(rows.map(e => e.dealsInitiated));
  const mous = sum(rows.map(e => e.mousSigned));
  const investors = sum(rows.map(e => e.stakeholders.Investors));
  const visibility = parseFloat(avg(rows.map(e => e.visibilityScore)).toFixed(1));

  // Relationship funnel — the core value chain of the intervention
  const funnel = [
    { label: "Connections made",      value: connections },
    { label: "Follow-up meetings",    value: followUps },
    { label: "Deals / partnerships opened", value: deals },
    { label: "Formal agreements signed",    value: mous },
  ];

  // Events + founders reached per year
  const byYear = YEARS.map(y => {
    const rs = rows.filter(e => e.year === y);
    return {
      Year: String(y),
      Events: rs.length,
      Founders: sum(rs.map(e => e.founders)),
      Connections: sum(rs.map(e => e.connections)),
    };
  }).filter(d => d.Events > 0);

  // Events by type
  const byType = EXPOSURE_TYPES.map(t => {
    const rs = rows.filter(e => e.type === t);
    return {
      name: t,
      value: rs.length,
      Events: rs.length,
      Founders: sum(rs.map(e => e.founders)),
      Connections: sum(rs.map(e => e.connections)),
      Deals: sum(rs.map(e => e.dealsInitiated)),
      // effectiveness: deals opened per event
      DealsPerEvent: rs.length ? parseFloat((sum(rs.map(e => e.dealsInitiated)) / rs.length).toFixed(1)) : 0,
      ConnPerFounder: sum(rs.map(e => e.founders))
        ? parseFloat((sum(rs.map(e => e.connections)) / sum(rs.map(e => e.founders))).toFixed(1))
        : 0,
    };
  }).filter(d => d.Events > 0);

  // Stakeholder mix — who founders are being connected to
  const byStakeholder = STAKEHOLDER_GROUPS.map(g => ({
    name: g,
    value: sum(rows.map(e => e.stakeholders[g as StakeholderGroup])),
  })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);

  return {
    events, founders, femalePct, ventures, connections, followUps, deals, mous,
    investors, visibility, funnel, byYear, byType, byStakeholder,
  };
}


// Section title row, laid out like the HEMP section headers: title and subtitle on the left, an optional control on the right.
function SectionTitle({ title, sub, children }: { title: string; sub: string; children?: React.ReactNode }) {
  return (
    <div style={ { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 16, flexWrap: "wrap" } }>
      <div style={ { display: "flex", alignItems: "baseline", gap: 8 } }>
        <span style={ { width: 3, height: 16, borderRadius: 999, backgroundColor: BRAND, flexShrink: 0 } } />
        <div>
          <p style={ { fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: BRAND_DK, lineHeight: 1.2, margin: 0 } }>{title}</p>
          <p style={ { fontSize: 11, color: "#6B7280", marginTop: 3, margin: 0 } }>{sub}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

// Section filter: a pill-style select, matching the other section filters.
function SectionFilter({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label style={ { display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#6B7280" } }>
      <span>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={ { fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 10, border: `1px solid ${LIGHT_BORDER}`, borderLeft: `5px solid ${BRAND}`, backgroundColor: "white", color: BRAND_DK } }>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ExposureNetworkingPage() {
  // Live progress against target for the stat cards, from v_progress (HENT rows).
  const progressRows = useProgress("HENT");
  // Headline values for the stat cards, from HENT At a Glance (actual values only).
  const { data: headlineRows } = useDashboardData(
    () => fetch("/api/hent-section/At%20a%20Glance").then(r => r.json()).then(r => r.headlines || []),
    []
  );
  const headline = (metric: string): number | null =>
    headlineRows?.find((h: any) => h.metric === metric)?.value ?? null;
  const dataSource = useDataSource("HENT");
  const syncedAt = useSyncedAt("HENT");
  const [fYear, setFYear]       = useState("All Years");
  const PLATFORM_TYPES = ["All Platform Types", "Pitch Event", "Conference", "Roundtable", "Ecosystem Engagement", "Demo Day"];
  const [fType, setFType]       = useState("All Platform Types");
  const [fCountry, setFCountry] = useState("All Countries");
  const [fStakeholder, setFStakeholder] = useState("All Stakeholder Types");
  const [fPilot, setFPilot] = useState("All Statuses");
  const PILOT_STATUSES = ["All Statuses", "Ongoing", "Completed", "Converted to Contract"];
  const STAKEHOLDER_TYPES = ["All Stakeholder Types", "Investors", "Partners", "Health Stakeholders", "Policymakers", "Peers"];

  const filtered = useMemo(() => exposureEvents.filter(e =>
    (fYear === "All Years" || String(e.year) === fYear) &&
    (fType === "All Platform Types" || e.type === fType) &&
    (fCountry === "All Countries" || e.country === fCountry) &&
    (fStakeholder === "All Stakeholder Types" || (e.stakeholders?.[fStakeholder] ?? 0) > 0) &&
    (fPilot === "All Statuses" || e.pilotStatus === fPilot)
  ), [fYear, fType, fCountry, fStakeholder, fPilot]);

  const D = useMemo(() => derive(filtered), [filtered]);
  const activeCount = (fYear !== "All Years" ? 1 : 0) + (fType !== "All Platform Types" ? 1 : 0) + (fCountry !== "All Countries" ? 1 : 0) + (fStakeholder !== "All Stakeholder Types" ? 1 : 0) + (fPilot !== "All Statuses" ? 1 : 0);

  const [activeSection, setActiveSection] = useState<number>(1);
  const show = (n: number) => activeSection === n;
  // Chart data the database does not provide yet: empty until those rows exist, so each chart shows "In coming data".
  const reachByYear: { Year: string; Events: number; Founders: number }[] = [];
  const introductionsByStakeholder: { Year: string; Investors: number; Partners: number; "Health stakeholders": number; Policymakers: number; Peers: number }[] = [];
  const commitmentFunnel: { label: string; value: number }[] = [];
  const dealsByStakeholder: { name: string; Introductions: number; "Deals signed": number }[] = [];
  const dealsPerEventByFormat: { name: string; value: number }[] = [];
  const platformRows: { format: string; events: number; founders: number; introductions: number; meetings: number; deals: number; conversion: number }[] = [];
  const competitionResults: { Year: string; Entered: number; Finalists: number; Winners: number }[] = [];
  const prizeValue = null as number | null;
  const pilotsByStage: { Year: string; Expose: number; Build: number; Scale: number }[] = [];
  const pilotOutcomes: { name: string; value: number }[] = [];
  const [filtersOpen, setFiltersOpen] = useState(false);

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
              <h1 className="text-lg font-black leading-tight" style={{ color: "white", letterSpacing: "0.01em" }}>Exposure &amp; Networking Opportunities</h1>
              <p className="text-[11px] mt-1.5 font-medium" style={{ color: "rgba(190,228,214,0.78)" }}>
                Connecting founders with investors, partners, healthcare stakeholders, policy makers and peers
              </p>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10px]" style={{ color: "rgba(190,228,214,0.5)" }}>
                <span><span style={{ color: "rgba(190,228,214,0.8)", fontWeight: 600 }}>Data source:</span> {dataSource}</span>
                <span aria-hidden="true">·</span>
                <span><span style={{ color: "rgba(190,228,214,0.8)", fontWeight: 600 }}>Period:</span> {YEARS[0]}–{YEARS[YEARS.length - 1]}</span>
                <span aria-hidden="true">·</span>
                <span>{hasHentData ? `${D.events} events · ${D.founders} founder placements` : "In coming data"}</span>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* ── BODY ─── */}
      <div className="max-w-[1440px] mx-auto px-6 py-7 space-y-8">

        {/* KPI strip */}
        <HeaderStatsPanel
        progressRows={progressRows}
          title="Exposure & Networking Metrics"
          cards={[
            { label: "Founders Reached", num: headline("Founders Reached"), displayFmt: (n) => `${Math.round(n)}%`, icon: Users, tip: "Share of portfolio founders who attended at least one networking event." },
            { label: "Founders Showcased", num: headline("Founders Showcased"), displayFmt: (n) => Math.round(n).toLocaleString(), icon: Mic, tip: "Founders who pitched, exhibited or spoke at external events." },
            { label: "Investors Engaged", num: headline("Investors Engaged"), displayFmt: (n) => Math.round(n).toLocaleString(), icon: Target, tip: "Investors who met or heard pitches from portfolio founders." },
            { label: "Follow-Up Meetings", num: headline("Follow-Up Meetings"), displayFmt: (n) => Math.round(n).toLocaleString(), icon: Link2, tip: "Meetings founders held with investors, partners or officials after an event." },
            { label: "Deals Signed", num: headline("Deals Signed"), displayFmt: (n) => Math.round(n).toLocaleString(), icon: Handshake, tip: "Partnerships, contracts or investment agreements that came from these connections." },
            { label: "Founder Value Rating", num: headline("Founder Value Rating"), displayFmt: (n) => `${n.toFixed(1)}/5`, icon: Star, tip: "How founders rate the visibility and strategic value they gained, out of 5." },
          ]}
        />

        {/* Section pills (left) + outreach-style filters popover (right) */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <SectionPills
            accent={BRAND}
            value={String(activeSection)}
            onChange={(v) => setActiveSection(Number(v))}
            options={[
              { label: "Reach Over Time", value: "1" },
              { label: "Connection to Commitment", value: "2" },
              { label: "Which Platforms Work", value: "3" },
              { label: "Pitch Competitions and Pilots", value: "4" },
            ]}
          />
          <div style={{ position: "relative" }}>
            <FilterButton
              activeFilterCount={activeCount}
              isOpen={filtersOpen}
              onClick={() => setFiltersOpen(!filtersOpen)}
            />
            <FilterDropdown
              isOpen={filtersOpen}
              onResetFilters={() => { setFYear("All Years"); setFType("All Platform Types"); setFCountry("All Countries"); setFStakeholder("All Stakeholder Types"); setFPilot("All Statuses"); }}
            >
              {[
                { label: "Year", value: fYear, setValue: setFYear, options: ["All Years", ...YEARS.map(String)] },
                { label: "Platform type", value: fType, setValue: setFType, options: PLATFORM_TYPES },
                { label: "Country", value: fCountry, setValue: setFCountry, options: ["All Countries", ...COUNTRIES] },
                { label: "Stakeholder type", value: fStakeholder, setValue: setFStakeholder, options: STAKEHOLDER_TYPES },
                { label: "Competition / pilot status", value: fPilot, setValue: setFPilot, options: PILOT_STATUSES },
              ].map(filter => (
                <div key={filter.label} style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#0E4633", margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                    {filter.label}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {filter.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => filter.setValue(opt)}
                        style={{
                          fontSize: 10,
                          fontWeight: filter.value === opt ? 700 : 500,
                          padding: "5px 10px",
                          borderRadius: 6,
                          border: `1px solid ${filter.value === opt ? "#2D6A4F" : "rgba(14,70,51,0.12)"}`,
                          backgroundColor: filter.value === opt ? "#2D6A4F" : "white",
                          color: filter.value === opt ? "white" : "#0E4633",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </FilterDropdown>
          </div>
        </div>

        {/* ── SECTION 1: Reach Over Time ─── */}
        <section style={ { display: show(1) ? undefined : "none" } }>
          <SectionTitle title="Reach Over Time" sub="How many founders, events and introductions each year.">
          </SectionTitle>
          <div style={ { marginBottom: 24 } } />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Events and Founders Reached per Year" sub="Events held (bars) and founders who attended (line) per year"
              info="Events held each year (bars) and the founders who attended them (line).">
              <ChartWithPlaceholder data={hasHentData ? reachByYear : null} height={240}>
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={reachByYear} margin={ { top: 8, right: 8, left: 0, bottom: 0 } } barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" vertical={false} />
                  <XAxis dataKey="Year" tick={ { fontSize: 11, fill: "#6B7280" } } axisLine={false} tickLine={false} />
                  <YAxis yAxisId="events" allowDecimals={false} tick={ { fontSize: 11, fill: "#6B7280" } } axisLine={false} tickLine={false} width={32} />
                  <YAxis yAxisId="founders" orientation="right" tick={ { fontSize: 11, fill: "#6B7280" } } axisLine={false} tickLine={false} width={44} />
                  <Tooltip cursor={ { fill: "rgba(0,33,71,0.04)" } } content={<ChartTip />} />
                  <Bar yAxisId="events" dataKey="Events" name="Events" fill="#1B4332" radius={[4, 4, 0, 0]} maxBarSize={38} />
                  <Line yAxisId="founders" type="monotone" dataKey="Founders" name="Founders reached" stroke="#1F9E9E" strokeWidth={2.5} dot={ { r: 4, fill: "#1F9E9E", strokeWidth: 0 } } />
                  <Legend verticalAlign="bottom" align="center" wrapperStyle={ { fontSize: 10 } } />
                </ComposedChart>
              </ResponsiveContainer>
              </ChartWithPlaceholder>
            </ChartCard>
            <ChartCard title="Introductions per Year, by Stakeholder" sub="Introductions to investors, partners, health stakeholders, policymakers and peers"
              info="Introductions founders made each year, split by the stakeholder group they were made to.">
              <ChartWithPlaceholder data={hasHentData ? introductionsByStakeholder : null} height={240}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={introductionsByStakeholder} margin={ { top: 8, right: 8, left: 0, bottom: 0 } } barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" vertical={false} />
                  <XAxis dataKey="Year" tick={ { fontSize: 11, fill: "#6B7280" } } axisLine={false} tickLine={false} />
                  <YAxis tick={ { fontSize: 11, fill: "#6B7280" } } axisLine={false} tickLine={false} width={32} />
                  <Tooltip cursor={ { fill: "rgba(0,33,71,0.04)" } } content={<ChartTip />} />
                  <Bar dataKey="Investors" name="Investors" stackId="intro" fill="#1B4332" maxBarSize={38} />
                  <Bar dataKey="Partners" name="Partners" stackId="intro" fill="#1F9E9E" maxBarSize={38} />
                  <Bar dataKey="Health stakeholders" name="Health stakeholders" stackId="intro" fill="#A6C13C" maxBarSize={38} />
                  <Bar dataKey="Policymakers" name="Policymakers" stackId="intro" fill="#E9C46A" maxBarSize={38} />
                  <Bar dataKey="Peers" name="Peers" stackId="intro" fill="#6A4C93" radius={[4, 4, 0, 0]} maxBarSize={38} />
                  <Legend verticalAlign="bottom" align="center" wrapperStyle={ { fontSize: 10 } } />
                </BarChart>
              </ResponsiveContainer>
              </ChartWithPlaceholder>
            </ChartCard>
          </div>
        </section>

        {/* ── SECTION 2: From Connection to Commitment ─── */}
        <section style={ { display: show(2) ? undefined : "none" } }>
          <SectionTitle title="From Connection to Commitment" sub="Whether introductions turn into meetings, deals and signed agreements.">
          </SectionTitle>
          <div style={ { marginBottom: 24 } } />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Relationship Funnel" sub="Introductions, follow-up meetings, deals opened and deals signed, with % conversion at each step"
              info="Introductions to follow-up meetings, deals opened and deals signed, with the conversion from each step to the next.">
              {hasHentData ? (
                <Funnel steps={commitmentFunnel} />
              ) : (
                <p style={ { fontSize: 14, color: "#9CA3AF", textAlign: "center", padding: 40 } }>In coming data</p>
              )}
            </ChartCard>
            <ChartCard title="Deals by Stakeholder Type" sub="Introductions compared with deals signed for each stakeholder group"
              info="Introductions and deals signed for each stakeholder group, so you can see which relationships pay off.">
              <ChartWithPlaceholder data={hasHentData ? dealsByStakeholder : null} height={240}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={dealsByStakeholder} margin={ { top: 8, right: 8, left: 0, bottom: 0 } } barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" vertical={false} />
                  <XAxis dataKey="name" tick={ { fontSize: 11, fill: "#6B7280" } } axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={ { fontSize: 11, fill: "#6B7280" } } axisLine={false} tickLine={false} width={32} />
                  <Tooltip cursor={ { fill: "rgba(0,33,71,0.04)" } } content={<ChartTip />} />
                  <Bar dataKey="Introductions" name="Introductions" fill="#1F9E9E" radius={[4, 4, 0, 0]} maxBarSize={38} />
                  <Bar dataKey="Deals signed" name="Deals signed" fill="#1B4332" radius={[4, 4, 0, 0]} maxBarSize={38} />
                  <Legend verticalAlign="bottom" align="center" wrapperStyle={ { fontSize: 10 } } />
                </BarChart>
              </ResponsiveContainer>
              </ChartWithPlaceholder>
            </ChartCard>
          </div>
        </section>

        {/* ── SECTION 3: Which Platforms Work ─── */}
        <section style={ { display: show(3) ? undefined : "none" } }>
          <SectionTitle title="Which Platforms Work" sub="Comparing formats on the deals they produce.">
          </SectionTitle>
          <div style={ { marginBottom: 24 } } />
          <div className="grid grid-cols-1 gap-4">
            <ChartCard title="Deals per Event, by Format" sub="Average deals opened per event; higher means more productive"
              info="Average deals opened per event for each format. Higher means more productive.">
              <ChartWithPlaceholder data={hasHentData ? dealsPerEventByFormat : null} height={260}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dealsPerEventByFormat} layout="vertical" margin={ { top: 8, right: 16, left: 0, bottom: 0 } } barCategoryGap="22%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" horizontal={false} />
                  <XAxis type="number" tick={ { fontSize: 11, fill: "#6B7280" } } axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={150} tick={ { fontSize: 10, fill: "#6B7280" } } axisLine={false} tickLine={false} />
                  <Tooltip cursor={ { fill: "rgba(0,33,71,0.04)" } } content={<ChartTip />} />
                  <Bar dataKey="value" name="Deals per event" fill="#1B4332" radius={[0, 4, 4, 0]} maxBarSize={22} />
                  <Legend verticalAlign="bottom" align="center" wrapperStyle={ { fontSize: 10 } } />
                </BarChart>
              </ResponsiveContainer>
              </ChartWithPlaceholder>
            </ChartCard>
            <ChartCard title="Platform Comparison" sub="The full breakdown by format"
              info="Events, founders, introductions, meetings and deals by format. Conversion % is deals signed divided by introductions.">
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr>
                      <th className="text-left text-gray-400 font-bold pb-3 pr-6 uppercase tracking-wider text-[9px]">Format</th>
                      <th className="text-center text-gray-400 font-bold pb-3 px-2 uppercase tracking-wider text-[9px]">Events</th>
                      <th className="text-center text-gray-400 font-bold pb-3 px-2 uppercase tracking-wider text-[9px]">Founders</th>
                      <th className="text-center text-gray-400 font-bold pb-3 px-2 uppercase tracking-wider text-[9px]">Introductions</th>
                      <th className="text-center text-gray-400 font-bold pb-3 px-2 uppercase tracking-wider text-[9px]">Meetings</th>
                      <th className="text-center text-gray-400 font-bold pb-3 px-2 uppercase tracking-wider text-[9px]">Deals Signed</th>
                      <th className="text-center text-gray-400 font-bold pb-3 pl-2 uppercase tracking-wider text-[9px]">Conversion %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {platformRows.map(row => (
                      <tr key={row.format} style={ { borderTop: `1px solid ${LIGHT_BORDER}` } }>
                        <td className="py-2.5 pr-6 whitespace-nowrap font-semibold text-gray-700">{row.format}</td>
                        <td className="py-2.5 px-2 text-center tabular-nums text-gray-600">{row.events}</td>
                        <td className="py-2.5 px-2 text-center tabular-nums text-gray-600">{row.founders}</td>
                        <td className="py-2.5 px-2 text-center tabular-nums text-gray-600">{row.introductions}</td>
                        <td className="py-2.5 px-2 text-center tabular-nums text-gray-600">{row.meetings}</td>
                        <td className="py-2.5 px-2 text-center tabular-nums text-gray-600">{row.deals}</td>
                        <td className="py-2.5 pl-2 text-center tabular-nums font-bold" style={ { color: BRAND_DK } }>{row.conversion}%</td>
                      </tr>
                    ))}
                    {!platformRows.length && (
                      <tr><td colSpan={7} className="text-center text-gray-400 py-6">In coming data</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          </div>
        </section>

        {/* ── SECTION 4: Pitch Competitions and Pilots ─── */}
        <section style={ { display: show(4) ? undefined : "none" } }>
          <SectionTitle title="Pitch Competitions and Pilots" sub="Competitive visibility and hands-on pilot support for ventures.">
          </SectionTitle>
          <div style={ { marginBottom: 24 } } />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Competition Results" sub="Founders who entered, reached the finals and won each year"
              info="Founders who entered pitch competitions, reached the finals and won, per year.">
              <ChartWithPlaceholder data={hasHentData ? competitionResults : null} height={240}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={competitionResults} margin={ { top: 8, right: 8, left: 0, bottom: 0 } } barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" vertical={false} />
                  <XAxis dataKey="Year" tick={ { fontSize: 11, fill: "#6B7280" } } axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={ { fontSize: 11, fill: "#6B7280" } } axisLine={false} tickLine={false} width={32} />
                  <Tooltip cursor={ { fill: "rgba(0,33,71,0.04)" } } content={<ChartTip />} />
                  <Bar dataKey="Entered" name="Entered" fill="#A6C13C" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="Finalists" name="Finalists" fill="#1F9E9E" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="Winners" name="Winners" fill="#1B4332" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Legend verticalAlign="bottom" align="center" wrapperStyle={ { fontSize: 10 } } />
                </BarChart>
              </ResponsiveContainer>
              </ChartWithPlaceholder>
            </ChartCard>
            <ChartCard title="Prize and Award Value" sub="Total prize money and awards won by founders (USD)"
              info="Total prize money and awards won by founders, in USD.">
              <ChartWithPlaceholder data={prizeValue} height={208}>
                <div style={ { height: 208, display: "flex", alignItems: "center", justifyContent: "center" } }>
                  <p style={ { fontSize: 28, fontWeight: 800, color: BRAND_DK, lineHeight: 1 } }>{prizeValue !== null ? `$${prizeValue.toLocaleString()}` : ""}</p>
                </div>
              </ChartWithPlaceholder>
            </ChartCard>
            <ChartCard title="Pilots by Stage" sub="Pilot engagements per year, split by Expose, Build and Scale"
              info="Pilot engagements each year, split by venture stage.">
              <ChartWithPlaceholder data={hasHentData ? pilotsByStage : null} height={240}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={pilotsByStage} margin={ { top: 8, right: 8, left: 0, bottom: 0 } } barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" vertical={false} />
                  <XAxis dataKey="Year" tick={ { fontSize: 11, fill: "#6B7280" } } axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={ { fontSize: 11, fill: "#6B7280" } } axisLine={false} tickLine={false} width={32} />
                  <Tooltip cursor={ { fill: "rgba(0,33,71,0.04)" } } content={<ChartTip />} />
                  <Bar dataKey="Expose" name="Expose" stackId="pilot" fill="#A6C13C" maxBarSize={38} />
                  <Bar dataKey="Build" name="Build" stackId="pilot" fill="#1F9E9E" maxBarSize={38} />
                  <Bar dataKey="Scale" name="Scale" stackId="pilot" fill="#1B4332" radius={[4, 4, 0, 0]} maxBarSize={38} />
                  <Legend verticalAlign="bottom" align="center" wrapperStyle={ { fontSize: 10 } } />
                </BarChart>
              </ResponsiveContainer>
              </ChartWithPlaceholder>
            </ChartCard>
            <ChartCard title="Pilot Outcomes" sub="Pilots completed, ongoing, or converted to contracts"
              info="Pilot engagements by outcome: completed, ongoing, or converted to a contract.">
              {hasHentData ? (
                <DonutRing data={pilotOutcomes} colors={DISTINCT} total={sum(pilotOutcomes.map(d => d.value))} totalLabel="Pilots" height={300} legendPercent />
              ) : (
                <p style={ { fontSize: 14, color: "#9CA3AF", textAlign: "center", padding: 40 } }>In coming data</p>
              )}
            </ChartCard>
          </div>
        </section>

        <PortalFooter synced={syncedAt} source={dataSource} portal="hent" />

      </div>
    </div>
    </PortalThemeProvider>
  );
}
