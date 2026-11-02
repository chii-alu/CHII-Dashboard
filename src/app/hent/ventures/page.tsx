"use client";
import { useProgress } from "@/hooks/useProgress";
import { ChartTip, HeaderStatsPanel, FilterButton, FilterDropdown } from "@/components/ui/hent";
import { useDataSource, useSyncedAt } from "@/hooks/useDataSource";
import PortalNav from "@/components/layout/portal-nav";
import PortalFooter from "@/components/layout/portal-footer";
import { DonutRing } from "@/components/charts/donut-chart";
import { useDashboardData } from "@/hooks/useDashboardData";
import { ChartWithPlaceholder } from "@/components/ChartWithPlaceholder";

// HENT sample datasets are removed. Until HENT rows load, these lists are empty and the values show "In coming data".
type Row = Record<string, any>;
const ALL_VENTURES: Row[] = [];
const founders: Row[] = [];
// True once any sample list has rows. Charts show "In coming data" until then.
const hasHentData = [ALL_VENTURES, founders].some(list => list.length > 0);
import { useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer, LabelList,
} from "recharts";
import { Briefcase, Target, TrendingUp, Users, Info, type LucideIcon, ChevronDown, DollarSign } from "lucide-react";

// Female icon - matches Executive dashboard
function WomanIcon({ size = 20, color, style }: { size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color ?? "currentColor"} stroke={color ?? "currentColor"} style={style}>
      <circle cx="12" cy="3.4" r="3.25" stroke="none" />
      <path d="M8.3 7.1 L15.7 7.1 L14.24 12.2 L17.15 18.3 L6.85 18.3 L9.76 12.2 Z" stroke="none" />
      <path d="M8.98 7.5 C7.07 9.8 6.29 12.45 6.29 15.5" fill="none" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M15.02 7.5 C16.93 9.8 17.71 12.45 17.71 15.5" fill="none" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M10.21 18.3 L10.21 22.3" fill="none" strokeWidth="2.7" strokeLinecap="round" />
      <path d="M13.79 18.3 L13.79 22.3" fill="none" strokeWidth="2.7" strokeLinecap="round" />
    </svg>
  );
}

// Color palette - HENT green (matching overview)
const HERO = "#2D6A4F";
const BRAND = "#2D6A4F";
const BRAND_DK = "#0E4633";
const GREEN = "#2D6A4F";
const LIGHT_GREEN = "#E8F5F2";
const LIGHT_BORDER = "rgba(14, 70, 51, 0.12)";
const LIGHT_BG = "#f8fafc";
const GREEN_RAMP = ["#1B4332","#2D6A4F","#40916C","#5BB4A0","#8ECCC4"];

// Helpers
function fmt$(n: number) {
  return n >= 1_000_000 ? `$${(n/1_000_000).toFixed(1)}M` : n >= 1_000 ? `$${Math.round(n/1_000)}K` : `$${n}`;
}

function sg(s: string) {
  if (s === "Ideation" || s === "Validation") return "Expose";
  if (s === "Prototype/MVP" || s === "Early Growth") return "Build";
  return "Scale";
}

function paceColor(a: number, t: number): string {
  const pace = 5 / 12;
  const r = t > 0 ? (a / t) / pace : 1;
  if (r >= 1) return "#16A34A";
  if (r >= 0.95) return "#84CC16";
  if (r >= 0.8) return "#F59E0B";
  return "#DC2626";
}

// Constants
const PACE = 5 / 12;
const TARGETS = { ventures: 400, jobs: 2_000, funds: 910_904 } as const;
const ACTUALS = {
  ventures: ALL_VENTURES.filter(v => v.status === "Active").length,
  jobs: ALL_VENTURES.reduce((s, v) => s + v.jobsTotal, 0),
  funds: ALL_VENTURES.reduce((s, v) => s + v.funding, 0)
};

const VENTURE_YEARS = Array.from(new Set(ALL_VENTURES.map(v => v.cohort))).sort((a, b) => a - b);

// Note: StatsPanel moved to HeaderStatsPanel in @/components/ui/hent

// Panel Component for Charts
function Panel({ title, subtitle, info, children, filterOptions, filterValue, onFilterChange }: { title: string; subtitle: string; info?: string; children: React.ReactNode; filterOptions?: string[]; filterValue?: string; onFilterChange?: (v: string) => void }) {
  const [tip, setTip] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  return (
    <div style={{ backgroundColor: "white", borderRadius: 10, border: `1px solid ${LIGHT_BORDER}`, overflow: "hidden" }}>
      <div style={{ backgroundColor: BRAND, padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 2.5, minWidth: 0, flex: 1 }}>
          <div style={{ width: 3, height: 15, borderRadius: 999, backgroundColor: "#D4AF87", flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "white", lineHeight: 1.2 }}>{title}</p>
              {info && (
                <span style={{ position: "relative", display: "flex", cursor: "pointer" }}
                  onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}>
                  <Info size={12} color="white" opacity={0.6} />
                  {tip && (
                    <span style={{ position: "absolute", top: "calc(100% + 7px)", left: "50%", transform: "translateX(-50%)", backgroundColor: "white", color: BRAND_DK, fontSize: 10.5, fontWeight: 400, textTransform: "none", letterSpacing: 0, lineHeight: 1.5, padding: "8px 11px", borderRadius: 7, width: 210, boxShadow: "0 4px 12px rgba(0,0,0,0.12)", border: `1px solid ${LIGHT_BORDER}`, zIndex: 100, textAlign: "left", pointerEvents: "none" }}>
                      {info}
                    </span>
                  )}
                </span>
              )}
            </div>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", marginTop: 1 }}>{subtitle}</p>
          </div>
        </div>
      </div>
      {filterOptions && filterValue && onFilterChange && (
        <div style={{ padding: "8px 18px", display: "flex", justifyContent: "flex-end" }}>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "5px 10px",
                borderRadius: 10,
                border: `1px solid ${LIGHT_BORDER}`,
                borderLeft: `5px solid ${BRAND}`,
                backgroundColor: "white",
                color: BRAND_DK,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                whiteSpace: "nowrap",
              }}
            >
              {filterValue} <ChevronDown size={12} />
            </button>
            {filterOpen && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                right: 0,
                backgroundColor: "white",
                border: `1px solid ${LIGHT_BORDER}`,
                borderLeft: `5px solid ${BRAND}`,
                borderRadius: 10,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                zIndex: 10,
                minWidth: 140,
                overflow: "hidden",
              }}>
                {filterOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => {
                      onFilterChange(opt);
                      setFilterOpen(false);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      fontSize: 11,
                      fontWeight: opt === filterValue ? 700 : 500,
                      backgroundColor: opt === filterValue ? BRAND : "white",
                      color: opt === filterValue ? "white" : BRAND_DK,
                      border: `1px solid ${LIGHT_BORDER}`,
                      borderLeft: `5px solid ${BRAND}`,
                      cursor: "pointer",
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <div style={{ padding: "12px 18px 18px" }}>
        {children}
      </div>
    </div>
  );
}

// Median of a list, or null when there are no values.
function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((x, y) => x - y);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export default function HENTVentures() {
  // Live progress against target for the stat cards, from v_progress (HENT rows).
  const progressRows = useProgress("HENT");
  // Headline values for the stat cards, from HENT At a Glance (actual values only).
  const { data: ventureHeadlines } = useDashboardData(
    () => fetch("/api/hent-section/At%20a%20Glance").then(r => r.json()).then(r => r.headlines || []),
    []
  );
  const headline = (metric: string): number | null =>
    ventureHeadlines?.find((h: any) => h.metric === metric)?.value ?? null;
  const dataSource = useDataSource("HENT");
  const syncedAt = useSyncedAt("HENT");
  const categories = ["Portfolio Composition", "Portfolio Health"];
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  // Global filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterYear, setFilterYear] = useState("All Years");
  const [filterStage, setFilterStage] = useState("All");
  const [filterGender, setFilterGender] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const show = (category: string) => activeCategory === category;

  const activeFilterCount = [filterYear !== "All Years", filterStage !== "All", filterGender !== "All", filterStatus !== "All"].filter(Boolean).length;

  // Year filters for each chart
  const [filterGrowthYear, setFilterGrowthYear] = useState("All Years");
  const [filterCompYear, setFilterCompYear] = useState("All Years");
  const [filterGeoYear, setFilterGeoYear] = useState("All Years");
  const [filterHealthYear, setFilterHealthYear] = useState("All Years");

  // Filtered ventures based on global filters
  const filteredVentures = useMemo(() => {
    return ALL_VENTURES.filter(v => {
      if (filterYear !== "All Years" && v.cohort !== parseInt(filterYear)) return false;
      if (filterStage !== "All" && sg(v.stage) !== filterStage) return false;
      if (filterGender !== "All") {
        const ventureId = `V${String(v.id).padStart(3, "0")}`;
        const founder = founders.find(f => f.ventureId === ventureId);
        const gender = founder?.gender || "Unknown";
        if (filterGender === "Female" && gender !== "Female") return false;
        if (filterGender === "Male" && gender !== "Male") return false;
      }
      if (filterStatus !== "All" && v.status !== filterStatus) return false;
      return true;
    });
  }, [filterYear, filterStage, filterGender, filterStatus]);

  // Aggregations
  const years = Array.from(new Set(ALL_VENTURES.map(v => v.cohort))).sort();
  const femaleVentures = filteredVentures.filter(v => v.teamGender === "Female").length;
  const activeVentures = filteredVentures.filter(v => v.status === "Active").length;
  const retentionRate = filteredVentures.length ? Math.round((filteredVentures.filter(v => v.status !== "Stalled").length / filteredVentures.length) * 100) : 0;
  const acceleratorVentures = filteredVentures.filter(v => v.accelerator).length;
  const acceleratorPct = filteredVentures.length ? Math.round((acceleratorVentures / filteredVentures.length) * 100) : 0;
  const venturesFunded = filteredVentures.filter(v => v.funding > 0).length;
  const totalPartnerships = filteredVentures.reduce((s, v) => s + v.partnerships, 0);
  const filteredActuals = {
    ventures: filteredVentures.filter(v => v.status === "Active").length,
    jobs: filteredVentures.reduce((s, v) => s + v.jobsTotal, 0),
    funds: filteredVentures.reduce((s, v) => s + v.funding, 0)
  };
  // Portfolio Health data: filled from the database once HENT rows exist; empty means "In coming data".
  const survivalByCohort: { year: string; survival: number }[] = [];
  const statusData: { name: string; value: number }[] = [];
  const stageProgression: { year: string; expose_to_build: number; build_to_scale: number }[] = [];
  // Median per year, so a year with no ventures is left out instead of reading as zero.
  const revenueMedianByYear: { year: string; revenue: number }[] = years.flatMap(y => {
    const m = median(filteredVentures.filter(v => v.cohort === y).map(v => v.revenue));
    return m === null ? [] : [{ year: String(y), revenue: m }];
  });
  const avgJobsPerVenture = filteredVentures.length ? Math.round(filteredActuals.jobs / filteredVentures.length) : 0;
  const totalRevenue = filteredVentures.reduce((s, v) => s + v.revenue, 0);

  return (
    <div style={{ backgroundColor: LIGHT_BG, minHeight: "100vh" }}>
      <PortalNav portal="hent" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-2">
        <header style={{ position: "relative", overflow: "hidden", backgroundColor: HERO, borderRadius: 12, minHeight: 120, display: "flex", alignItems: "center" }}>
          <div style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", backgroundImage: "url('/images/Pat.png')", backgroundSize: "auto 100%", backgroundRepeat: "repeat", backgroundPosition: "center", opacity: 0.05 }} />
          <img src="/images/design1.png" alt="" aria-hidden="true"
            style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", height: "100%", width: "auto", zIndex: 1, pointerEvents: "none", userSelect: "none" }} />
          <img src="/images/design1.png" alt="" aria-hidden="true"
            style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%) scaleX(-1)", height: "100%", width: "auto", zIndex: 1, pointerEvents: "none", userSelect: "none" }} />
          <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", background: "linear-gradient(90deg, rgba(45,106,79,0) 0%, #2D6A4F 34%, #2D6A4F 66%, rgba(45,106,79,0) 100%)" }} />
          <div className="px-4 sm:px-6 py-6" style={{ position: "relative", zIndex: 10, width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <h1 className="text-lg font-black leading-tight" style={{ color: "white", letterSpacing: "0.01em" }}>Ventures Portfolio</h1>
              <p className="text-[11px] mt-1.5 font-medium" style={{ color: "rgba(190,228,214,0.78)" }}>
                Portfolio ventures, founders and the jobs, funding and impact they generate
              </p>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10px]" style={{ color: "rgba(190,228,214,0.5)" }}>
                <span><span style={{ color: "rgba(190,228,214,0.8)", fontWeight: 600 }}>Data source:</span> {dataSource}</span>
                <span aria-hidden="true">·</span>
                <span><span style={{ color: "rgba(190,228,214,0.8)", fontWeight: 600 }}>Period:</span> 2022–2026</span>
                <span aria-hidden="true">·</span>
                <span><span style={{ color: "rgba(190,228,214,0.8)", fontWeight: 600 }}>Last updated:</span> {syncedAt}</span>
              </div>
            </div>
          </div>
        </header>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-7">

        {/* ════ TOP STATS HEADER ════ */}
        <HeaderStatsPanel
        progressRows={progressRows}
          title="Portfolio Overview"
          cards={[
            { label: "Ventures Supported", num: headline("Total of Ventures Supported"), displayFmt: (n) => Math.round(n).toLocaleString(), icon: Briefcase, tip: "Ventures supported across the HENT portfolio." },
            { label: "Women-Led Ventures Supported", num: headline("Total of Women-Led Ventures Supported"), displayFmt: (n) => Math.round(n).toLocaleString(), icon: Users, tip: "Women-led ventures supported." },
            { label: "PWD-Led Ventures Supported", num: headline("Total of PWD-Led Ventures Supported"), displayFmt: (n) => Math.round(n).toLocaleString(), icon: Target, tip: "PWD-led ventures supported." },
            { label: "Jobs Created by Ventures", num: headline("Jobs Created by Ventures"), displayFmt: (n) => Math.round(n).toLocaleString(), icon: TrendingUp, tip: "Jobs created by supported ventures." },
            { label: "Funding Deployed", num: headline("Funding Deployed"), displayFmt: (n) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `$${Math.round(n / 1_000)}K` : `$${Math.round(n)}`, icon: DollarSign, tip: "Funding deployed to supported ventures." },
            { label: "Revenue Generated", num: headline("Revenue Generated"), displayFmt: (n) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `$${Math.round(n / 1_000)}K` : `$${Math.round(n)}`, icon: DollarSign, tip: "Revenue generated by supported ventures." },
          ]}
        />

        {/* ════ SECTION FILTER PILLS + FILTER BUTTON ════ */}
        <div style={{ marginBottom: 32, display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", flex: 1 }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  fontSize: 11,
                  fontWeight: activeCategory === cat ? 700 : 600,
                  padding: "8px 14px",
                  borderRadius: 20,
                  border: `1px solid ${activeCategory === cat ? BRAND : LIGHT_BORDER}`,
                  backgroundColor: activeCategory === cat ? BRAND : "white",
                  color: activeCategory === cat ? "white" : BRAND_DK,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <div style={{ position: "relative" }}>
            <FilterButton
              activeFilterCount={activeFilterCount}
              isOpen={filtersOpen}
              onClick={() => setFiltersOpen(!filtersOpen)}
            />
            <FilterDropdown
              isOpen={filtersOpen}
              onResetFilters={() => {
                setFilterYear("All Years");
                setFilterStage("All");
                setFilterGender("All");
                setFilterStatus("All");
              }}
            >
              {[
                { label: "Year", value: filterYear, setValue: setFilterYear, options: ["All Years", ...years.map(String)] },
                { label: "Stage", value: filterStage, setValue: setFilterStage, options: ["All", "Expose", "Build", "Scale"] },
                { label: "Gender", value: filterGender, setValue: setFilterGender, options: ["All", "Male", "Female"] },
                { label: "Status", value: filterStatus, setValue: setFilterStatus, options: ["All", "Active", "Stalled"] },
              ].map(filter => (
                <div key={filter.label} style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: BRAND_DK, margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.02em" }}>
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
                          border: `1px solid ${filter.value === opt ? BRAND : LIGHT_BORDER}`,
                          backgroundColor: filter.value === opt ? BRAND : "white",
                          color: filter.value === opt ? "white" : BRAND_DK,
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

        {/* ════ GROWTH & JOBS ════ */}
        {show("Portfolio Composition") && (
          <section style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ width: 3, height: 16, borderRadius: 999, backgroundColor: BRAND, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: BRAND_DK, lineHeight: 1.2, margin: 0 }}>
                    Portfolio Composition
                  </p>
                  <p style={{ fontSize: 11, color: "#6B7280", marginTop: 3, margin: 0 }}>Where HENT ventures are based, what stage they’re at, and who leads them.</p>
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              <Panel title="Ventures by Country" subtitle="Number of active ventures based in each country" info="Number of active ventures based in each country" filterOptions={["All Years", ...years.map(String)]} filterValue={filterGeoYear} onFilterChange={setFilterGeoYear}>
                <ChartWithPlaceholder data={hasHentData ? Array.from(new Set(filteredVentures.map(v => v.country))).map(c => ({
                    name: c,
                    value: filteredVentures.filter(v => v.country === c).length
                  })).sort((a, b) => b.value - a.value).slice(0, 8) : null} height={250}>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={Array.from(new Set(filteredVentures.map(v => v.country))).map(c => ({
                    name: c,
                    value: filteredVentures.filter(v => v.country === c).length
                  })).sort((a, b) => b.value - a.value).slice(0, 8)} margin={{ top: 6, right: 10, bottom: 0, left: -16 }} barCategoryGap="28%">
                    <CartesianGrid vertical={false} stroke={LIGHT_BORDER} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(14, 70, 51, 0.04)" }} />
                    <Bar dataKey="value" fill={GREEN} barSize={46} radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="value" position="top" fontSize={11} fill={BRAND_DK} fontWeight={700} />
                    </Bar>
                    <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 10 }} />
                  </BarChart>
                </ResponsiveContainer>
                </ChartWithPlaceholder>
              </Panel>
              <Panel title="Ventures by Stage" subtitle="How the portfolio splits across Expose, Build and Scale" info="How the portfolio splits across Expose, Build and Scale" filterOptions={["All Years", ...years.map(String)]} filterValue={filterGrowthYear} onFilterChange={setFilterGrowthYear}>
                <ChartWithPlaceholder data={hasHentData ? [
                    { name: "Expose", value: filteredVentures.filter(v => sg(v.stage) === "Expose").length },
                    { name: "Build", value: filteredVentures.filter(v => sg(v.stage) === "Build").length },
                    { name: "Scale", value: filteredVentures.filter(v => sg(v.stage) === "Scale").length },
                  ] : null} height={250}>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { name: "Expose", value: filteredVentures.filter(v => sg(v.stage) === "Expose").length },
                    { name: "Build", value: filteredVentures.filter(v => sg(v.stage) === "Build").length },
                    { name: "Scale", value: filteredVentures.filter(v => sg(v.stage) === "Scale").length },
                  ]} margin={{ top: 6, right: 10, bottom: 0, left: -16 }} barCategoryGap="28%">
                    <CartesianGrid vertical={false} stroke={LIGHT_BORDER} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(14, 70, 51, 0.04)" }} />
                    <Bar dataKey="value" fill={GREEN} barSize={46} radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="value" position="top" fontSize={11} fill={BRAND_DK} fontWeight={700} />
                    </Bar>
                    <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 10 }} />
                  </BarChart>
                </ResponsiveContainer>
                </ChartWithPlaceholder>
              </Panel>
              <Panel title="Female-Led and Accelerated Ventures" subtitle="Share of ventures that are female-led or in an accelerator" info="Share of ventures that are female-led or in an accelerator">
                <ChartWithPlaceholder data={hasHentData ? [
                    { name: "Female-Led", value: filteredVentures.filter(v => v.teamGender === "Female").length },
                    { name: "In Accelerators", value: filteredVentures.filter(v => v.accelerator).length },
                    { name: "Active & Female-Led", value: filteredVentures.filter(v => v.status === "Active" && v.teamGender === "Female").length },
                  ] : null} height={250}>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { name: "Female-Led", value: filteredVentures.filter(v => v.teamGender === "Female").length },
                    { name: "In Accelerators", value: filteredVentures.filter(v => v.accelerator).length },
                    { name: "Active & Female-Led", value: filteredVentures.filter(v => v.status === "Active" && v.teamGender === "Female").length },
                  ]} margin={{ top: 6, right: 10, bottom: 0, left: -16 }} barCategoryGap="28%">
                    <CartesianGrid vertical={false} stroke={LIGHT_BORDER} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(14, 70, 51, 0.04)" }} />
                    <Bar dataKey="value" fill="#FF5722" barSize={40} radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="value" position="top" fontSize={11} fill={BRAND_DK} fontWeight={700} />
                    </Bar>
                    <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 10 }} />
                  </BarChart>
                </ResponsiveContainer>
                </ChartWithPlaceholder>
              </Panel>
              <Panel title="Jobs Created Over Time" subtitle="Total jobs created by ventures each year" info="Total jobs created by ventures each year" filterOptions={["All Years", ...years.map(String)]} filterValue={filterGrowthYear} onFilterChange={setFilterGrowthYear}>
                <ChartWithPlaceholder data={hasHentData ? years.map(y => ({ year: String(y), jobs: filteredVentures.filter(v => v.cohort === y).reduce((s, v) => s + v.jobsTotal, 0) })) : null} height={250}>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={years.map(y => ({ year: String(y), jobs: filteredVentures.filter(v => v.cohort === y).reduce((s, v) => s + v.jobsTotal, 0) }))} margin={{ top: 6, right: 14, bottom: 0, left: -12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={LIGHT_BORDER} />
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} />
                    <Legend wrapperStyle={{ fontSize: 10 }} iconType="plainline" />
                    <Line type="monotone" dataKey="jobs" stroke={GREEN} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Jobs Created" />
                  </LineChart>
                </ResponsiveContainer>
                </ChartWithPlaceholder>
              </Panel>
            </div>
          </section>
        )}

        {show("Portfolio Health") && (
          <section style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ width: 3, height: 16, borderRadius: 999, backgroundColor: BRAND, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: BRAND_DK, lineHeight: 1.2, margin: 0 }}>
                    Portfolio Health
                  </p>
                  <p style={{ fontSize: 11, color: "#6B7280", marginTop: 3, margin: 0 }}>Whether ventures are surviving, growing and moving to the next stage.</p>
                </div>
              </div>
            </div>
            <div style={ { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 } }>
              <Panel title="Venture Survival by Cohort"
                subtitle="Share of each intake year still operating today"
                info="Share of each intake year still operating today">
                <ChartWithPlaceholder data={hasHentData ? survivalByCohort : null} height={250}>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={survivalByCohort} margin={ { top: 6, right: 10, bottom: 0, left: -16 } } barCategoryGap="28%">
                    <CartesianGrid vertical={false} stroke={LIGHT_BORDER} />
                    <XAxis dataKey="year" tick={ { fontSize: 11, fill: "#374151", fontWeight: 600 } } axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={ { fontSize: 10, fill: "#9CA3AF" } } axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={ { fill: "rgba(14, 70, 51, 0.04)" } } />
                    <Bar dataKey="survival" name="Still operating %" fill="#26A69A" barSize={40} radius={[4, 4, 0, 0]} />
                    <Legend verticalAlign="bottom" align="center" wrapperStyle={ { fontSize: 10 } } />
                  </BarChart>
                </ResponsiveContainer>
                </ChartWithPlaceholder>
              </Panel>

              <Panel title="Ventures by Status"
                subtitle="Active, growing, stalled or closed ventures right now"
                info="Active, growing, stalled or closed ventures right now">
                <ChartWithPlaceholder data={hasHentData ? statusData : null} height={250}>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={statusData} margin={ { top: 6, right: 10, bottom: 0, left: -16 } } barCategoryGap="28%">
                    <CartesianGrid vertical={false} stroke={LIGHT_BORDER} />
                    <XAxis dataKey="name" tick={ { fontSize: 11, fill: "#374151", fontWeight: 600 } } axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={ { fontSize: 10, fill: "#9CA3AF" } } axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={ { fill: "rgba(14, 70, 51, 0.04)" } } />
                    <Bar dataKey="value" name="Ventures" fill="#26A69A" barSize={40} radius={[4, 4, 0, 0]} />
                    <Legend verticalAlign="bottom" align="center" wrapperStyle={ { fontSize: 10 } } />
                  </BarChart>
                </ResponsiveContainer>
                </ChartWithPlaceholder>
              </Panel>
            </div>
            <div style={ { marginBottom: 16 } } />
            <div style={ { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 } }>
              <Panel title="Stage Progression"
                subtitle="Ventures that moved from Expose to Build or Build to Scale each year"
                info="Ventures that moved from Expose to Build or Build to Scale each year">
                <ChartWithPlaceholder data={hasHentData ? stageProgression : null} height={250}>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stageProgression} margin={ { top: 6, right: 10, bottom: 0, left: -16 } } barCategoryGap="28%" barGap={2}>
                    <CartesianGrid vertical={false} stroke={LIGHT_BORDER} />
                    <XAxis dataKey="year" tick={ { fontSize: 11, fill: "#374151", fontWeight: 600 } } axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={ { fontSize: 10, fill: "#9CA3AF" } } axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={ { fill: "rgba(14, 70, 51, 0.04)" } } />
                    <Bar dataKey="expose_to_build" name="Expose to Build" fill="#26A69A" barSize={24} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="build_to_scale" name="Build to Scale" fill={GREEN} barSize={24} radius={[4, 4, 0, 0]} />
                    <Legend verticalAlign="bottom" align="center" wrapperStyle={ { fontSize: 10 } } />
                  </BarChart>
                </ResponsiveContainer>
                </ChartWithPlaceholder>
              </Panel>

              <Panel title="Revenue Trend"
                subtitle="Median venture revenue per year (USD)"
                info="Median venture revenue per year (USD). The median keeps one large venture from hiding how most ventures are doing."
                filterOptions={["All Years", ...years.map(String)]} filterValue={filterHealthYear} onFilterChange={setFilterHealthYear}>
                <ChartWithPlaceholder data={hasHentData ? revenueMedianByYear : null} height={250}>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={revenueMedianByYear} margin={ { top: 6, right: 14, bottom: 0, left: -12 } }>
                    <CartesianGrid strokeDasharray="3 3" stroke={LIGHT_BORDER} />
                    <XAxis dataKey="year" tick={ { fontSize: 10, fill: "#9CA3AF" } } axisLine={false} tickLine={false} />
                    <YAxis tick={ { fontSize: 10, fill: "#9CA3AF" } } axisLine={false} tickLine={false} tickFormatter={v => fmt$(v)} />
                    <Tooltip content={<ChartTip money />} />
                    <Line type="monotone" dataKey="revenue" name="Median revenue (USD)" stroke={GREEN} strokeWidth={2.5} dot={ { r: 3 } } activeDot={ { r: 5 } } />
                    <Legend verticalAlign="bottom" align="center" wrapperStyle={ { fontSize: 10 } } />
                  </LineChart>
                </ResponsiveContainer>
                </ChartWithPlaceholder>
              </Panel>
            </div>
          </section>
        )}


        <PortalFooter source={dataSource} portal="hent" synced={syncedAt} />

      </div>
    </div>
  );
}
