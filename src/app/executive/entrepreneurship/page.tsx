"use client";
import { ChartWithPlaceholder } from "@/components/ChartWithPlaceholder";
import { useRefreshTick } from "@/hooks/useRefreshTick";
import { useDataSource, useSyncedAt } from "@/hooks/useDataSource";
import { FilterSelect } from "@/components/ui/executive";
import { ChartTip } from "@/components/ui/executive";
import { MetadataHeader } from "@/components/MetadataHeader";

import { useState, useMemo, useEffect } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList,
} from "recharts";
import {
  Users, Info, Rocket, Star, Briefcase,
  Scale, LifeBuoy, Activity, ShieldCheck, Globe, TrendingUp, Banknote,
  SlidersHorizontal, X,
} from "lucide-react";
import {
  VENTURES, STATUSES, FUNDING_SOURCES, STAGES,
  type Gender, type Stage, type Status, type FundingSource,
} from "@/data/executive/entrepreneurship";
import FeaturedImpactStory from "@/components/layout/featured-impact-story";
import HeaderDesign from "@/components/layout/header-design";
import StatsKpiCard from "@/components/ui/stat-kpi-card";
import { DonutRing as Donut } from "@/components/charts/donut-chart";

/* ── palette ─────────────────────────────────────────── */
const NAVY = "var(--brand-secondary)";
const BAND = "var(--brand-secondary)";
const TICK = "#D17A86";
const PALETTE = ["#102C5E", "#479BD6", "#D45F2C", "#A81B2D", "#102C5E", "#D17A86", "#C5D2E0"];
const GENDER_COLOR: Record<Gender, string> = { Female: "#102C5E", Male: "#479BD6", "Non-binary": "#D45F2C" };
const C_ACCENT = "#102C5E";
const C_FEMALE = "#479BD6";
const C_ORANGE = "#D45F2C";
const C_RED    = "#A81B2D";
const C_INDIGO = "#7F77DD";

/* ── helpers ─────────────────────────────────────────── */
const share = (c: number, t: number) => (t ? Math.round((c / t) * 100) : 0);
const fmt = (n: number) => Math.round(n).toLocaleString();
const usd = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `$${Math.round(n)}`);

const YEARS = [2022, 2023, 2024, 2025, 2026];

/* female icon — matches the Outreach "Who Are We Reaching?" cards */
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

/* ════════════════════════════════════════════════════════
   Shared UI
═══════════════════════════════════════════════════════ */
function SectionHeader({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 2 }}>
      <span style={{ width: 4, height: 16, borderRadius: 999, backgroundColor: TICK, flexShrink: 0, alignSelf: "center" }} />
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 800, color: NAVY, letterSpacing: "0.01em" }}>{title}</h2>
        <p style={{ fontSize: 11, color: "#6B7280", marginTop: 1 }}>{blurb}</p>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, info, children }: {
  title: string; subtitle: string; info?: string; children: React.ReactNode;
}) {
  const [tip, setTip] = useState(false);
  return (
    <div style={{ backgroundColor: "white", borderRadius: 10, border: "1px solid rgba(0,33,71,0.08)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ backgroundColor: BAND, padding: "10px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div style={{ width: 3, height: 15, borderRadius: 999, backgroundColor: TICK, flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "white", lineHeight: 1.2 }}>{title}</p>
              {info && (
                <span style={{ position: "relative", display: "flex", cursor: "pointer" }}
                  onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}>
                  <Info size={11} color="rgba(181,212,244,0.85)" />
                  {tip && (
                    <span style={{ position: "absolute", top: "calc(100% + 7px)", left: "50%", transform: "translateX(-50%)", backgroundColor: "white", color: "var(--brand-secondary)", fontSize: 10.5, fontWeight: 400, textTransform: "none", letterSpacing: 0, lineHeight: 1.5, padding: "8px 11px", borderRadius: 7, width: 210, boxShadow: "0 4px 12px rgba(0,0,0,0.12)", border: "1px solid #E0ECFF", zIndex: 100, textAlign: "left", pointerEvents: "none" }}>
                      {info}
                    </span>
                  )}
                </span>
              )}
            </div>
            <p style={{ fontSize: 9.5, color: "rgba(181,212,244,0.7)", marginTop: 1 }}>{subtitle}</p>
          </div>
        </div>
      </div>
      <div style={{ padding: "16px 18px 18px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>{children}</div>
    </div>
  );
}

function MoneyTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: "white", border: "1px solid rgba(0,33,71,0.1)", borderRadius: 6, padding: "8px 11px", fontSize: 11, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      {label != null && <p style={{ fontWeight: 700, color: NAVY, marginBottom: 4 }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: "#6B7280", display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: p.color || p.stroke, display: "inline-block" }} />
          {p.name}: <b style={{ color: NAVY }}>${fmt(p.value)}</b>
        </p>
      ))}
    </div>
  );
}

/* white section KPI card — matches the "Jobs Created" cards in Youth in Work */
function SectionKpi({ Icon, label, num, displayFmt = (n) => Math.round(n).toLocaleString() }: {
  Icon: React.ComponentType<any>; label: string; num: number;
  displayFmt?: (n: number) => string; sub?: string; tooltip?: string;
}) {
  return (
    <div style={{ backgroundColor: "white", borderRadius: 10, border: `1px solid ${C_ACCENT}`, padding: "13px 15px", display: "flex", alignItems: "center", justifyContent: "center", gap: 11 }}>
      <span style={{ width: 36, height: 36, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={20} color={C_ACCENT} />
      </span>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 21, fontWeight: 800, color: NAVY, lineHeight: 1.05 }}>{displayFmt(num)}</p>
        <p style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 2 }}>{label}</p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════ */
const SECTIONS: { n: number; label: string }[] = [
  { n: 1, label: "Enterprise Portfolio" },
  { n: 2, label: "Business Growth" },
  { n: 3, label: "Founder Profile" },
  { n: 4, label: "Employment Created" },
];

export default function EntrepreneurshipPage() {
  const refreshTick = useRefreshTick();
  const dataSource = useDataSource("EXEC");
  const syncedAt = useSyncedAt("EXEC");
  const [entHeadlines, setEntHeadlines] = useState<any[] | null>(null);
  useEffect(() => {
    fetch("/api/exec-section/Entrepreneurship")
      .then(r => r.json())
      .then(result => setEntHeadlines(Array.isArray(result.headlines) ? result.headlines : []))
      .catch(() => setEntHeadlines([]));
  }, [refreshTick]);
  const ent = (metric: string): number | null =>
    entHeadlines?.find((h: any) => h.metric === metric)?.value ?? null;
  const entLoaded = entHeadlines !== null;

  const [year, setYear] = useState<"all" | number>("all");
  const [gender, setGender] = useState<"all" | Gender>("all");
  const [stage, setStage] = useState<"all" | Stage>("all");
  const [status, setStatus] = useState<"all" | Status>("all");
  const [funding, setFunding] = useState<"all" | FundingSource>("all");
  const [active, setActive] = useState<number>(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const show = (n: number) => active === n;

  useEffect(() => {
    setLastUpdated("Data available");
  }, []);

  const scope = useMemo(() =>
    VENTURES.filter(x => {
      if (year !== "all" && x.yearLaunched !== year) return false;
      if (gender !== "all" && x.gender !== gender) return false;
      if (stage !== "all" && x.stage !== stage) return false;
      if (status !== "all" && x.status !== status) return false;
      if (funding !== "all" && x.fundingSource !== funding) return false;
      return true;
    }),
  [year, gender, stage, status, funding]);
  const total = scope.length;

  const activeCount = [year, gender, stage, status, funding].filter(v => v !== "all").length;
  const reset = () => { setYear("all"); setGender("all"); setStage("all"); setStatus("all"); setFunding("all"); };

  /* ── Overview KPIs ─────────────────────────────────── */
  const kpis = useMemo(() => {
    const female = scope.filter(v => v.gender === "Female").length;
    const active = scope.filter(v => v.status !== "Closed" && v.status !== "Non-operational").length;
    const jobs = scope.reduce((s, v) => s + v.jobsCreated, 0);
    const formal = scope.filter(v => v.formal).length;
    const enabler = scope.filter(v => v.enablerSupport).length;
    const avgRating = total ? scope.reduce((s, v) => s + v.rating, 0) / total : 0;
    const newThisYear = scope.filter(v => v.yearLaunched === 2024).length;
    return {
      count: total, active, female, jobs, formalPct: share(formal, total),
      enablerPct: share(enabler, total), survivalPct: share(active, total),
      avgRating, enablerCount: enabler, newThisYear,
    };
  }, [scope, total]);

  /* ── Section 1: enterprise portfolio ──────────────────── */
  const v = useMemo(() => {
    const stageDist = STAGES.map(s => ({ name: s, value: scope.filter(x => x.stage === s).length })).sort((a, b) => b.value - a.value);
    const statusData = (["Active", "Non-operational", "Closed"] as const).map(s => ({ name: s, value: scope.filter(x => x.status === s).length }));
    const statusTotal = statusData.reduce((s, d) => s + d.value, 0);
    const funding = FUNDING_SOURCES.map(f => ({ name: f, value: scope.filter(x => x.fundingSource === f).length })).sort((a, b) => b.value - a.value);
    const formalCount = scope.filter(x => x.formal).length;
    const formal = [{ name: "Formally registered", value: formalCount }, { name: "Informal", value: total - formalCount }];
    const genderData = (["Female", "Male"] as Gender[]).map(g => ({ name: g, value: scope.filter(x => x.gender === g).length })).filter(d => d.value > 0);
    const perYear = YEARS.map(y => {
      const yrScope = scope.filter(x => x.yearLaunched === y);
      const total = yrScope.length;
      const female = yrScope.filter(x => x.gender === "Female").length;
      return { name: `${y}`, value: total, female };
    });
    const survival: any[] = [];
    return { stageDist, statusData, statusTotal, funding, formal, genderData, perYear, survival };
  }, [scope, total]);

  /* ── Section 2: growth & sustainability ────────────── */
  const growth = useMemo(() => {
    const income: any[] = [];
    const capital: any[] = [];
    const byStage = STAGES.filter(s => s !== "Closed").map(s => ({ name: s, value: scope.filter(x => x.stage === s).length }));
    return { income, capital, byStage };
  }, [scope]);

  /* ── Section 3: employment created ─────────────────── */
  const ji = useMemo(() => {
    const totalJobs = scope.reduce((s, x) => s + x.jobsCreated, 0);
    const composition: any[] = [];
    const priority: any[] = [];
    const byGender: any[] = [];
    const byType: any[] = [];
    const quality: any[] = [];
    const trend: any[] = [];
    const topVentures: any[] = [];
    return {
      totalJobs, composition, priority, byGender, byType, quality, trend, topVentures,
      fullTime: byType[0]?.value ?? null, partTime: byType[1]?.value ?? null,
      womenJobs: byGender[1]?.value ?? null, youthJobs: priority.find(p => p.name === "Youth")?.value ?? null,
    };
  }, [scope]);

  /* ── Section 4: founder profile ────────────────────── */
  const founders = useMemo(() => {
    const genderData = (["Female", "Male"] as Gender[]).map(g => ({ name: g, value: scope.filter(x => x.gender === g).length })).filter(d => d.value > 0);
    const inclusionReachData: any[] = [];
    const countries: any[] = [];
    return { genderData, inclusionReachData, countries };
  }, [scope, total]);

  /* ── Section 5: sectors & innovation ───────────────── */
  const sectors = useMemo(() => {
    const topSectors: any[] = [];
    const industries: any[] = [];
    const techVsTraditional: any[] = [];
    return { topSectors, industries, techVsTraditional };
  }, []);

  /* ── Section 6: CHII support ───────────────────────── */
  const support = useMemo(() => {
    const interventionsRaw: any[] = [];
    const interventionUptake = interventionsRaw.map(x => ({ name: x.name, value: x.uptake }));
    const helpfulness = interventionsRaw.map(x => ({ name: x.name, value: x.help }));
    const supportQuality: any[] = [];
    const supportTotal = supportQuality.reduce((s, d) => s + d.value, 0);
    const byStage: any[] = [];
    return { interventionUptake, helpfulness, supportQuality, supportTotal, byStage };
  }, [scope]);

  /* ── Section 7: founder outcomes ───────────────────── */
  const outcomes = useMemo(() => {
    const indicators: any[] = [];
    const household: any[] = [];
    const persistence: any[] = [];
    return { indicators, household, persistence };
  }, []);

  return (
    <div style={{ backgroundColor: "var(--bg-page)", minHeight: "100vh" }}>

      {/* ── Header ─────────────────────────────────────── */}
      <MetadataHeader
        title="Entrepreneurship"
        subtitle="The journey from founder to enterprise growth, jobs created, and long-term economic impact"
        dataSource={dataSource}
        lastUpdated={syncedAt}
        period="2024–2030"
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-7 space-y-10">

        {/* ════ OVERVIEW ════ */}
        <section className="space-y-4">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
            <StatsKpiCard missingText={entLoaded ? "In coming data" : ""} label="Entrepreneurs" num={null} sub="founders tracked" Icon={Rocket}
              tooltip="Total entrepreneurs (founders) tracked across the portfolio." />
            <StatsKpiCard missingText={entLoaded ? "In coming data" : ""} label="Enterprises" num={ent("Enterprise Started Per Year")} sub="started" Icon={Activity}
              tooltip="Enterprises started by participants." />
            <StatsKpiCard missingText={entLoaded ? "In coming data" : ""} label="Jobs Created" num={ent("Jobs created")} sub="created" Icon={Briefcase}
              tooltip="Jobs created across all enterprises." />
            <StatsKpiCard missingText={entLoaded ? "In coming data" : ""} label="Female-led" num={ent("Female-led")} sub="female-led enterprises" Icon={WomanIcon}
              tooltip="Enterprises led by female founders." />
            <StatsKpiCard missingText={entLoaded ? "In coming data" : ""} label="Capital Secured" num={null} sub="raised to date" Icon={Banknote}
              tooltip="Total capital raised by enterprises across the portfolio." />
            <StatsKpiCard missingText={entLoaded ? "In coming data" : ""} label="Market Extension" num={null} sub="entered new markets" Icon={Globe}
              tooltip="Enterprises that expanded into new markets or geographies." />
          </div>

          {/* Section pills (left) + compact filters dropdown (right) */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SECTIONS.map(({ n, label }) => {
                const on = active === n;
                return (
                  <button key={n} onClick={() => setActive(n)}
                    style={{ fontSize: 11.5, fontWeight: 700, padding: "7px 13px", borderRadius: 999, cursor: "pointer",
                      border: `1px solid ${on ? NAVY : "rgba(0,33,71,0.15)"}`,
                      backgroundColor: on ? NAVY : "white", color: on ? "white" : "#6B7280" }}>
                    {label}
                  </button>
                );
              })}
            </div>

            <div style={{ position: "relative", flexShrink: 0 }}>
              <button onClick={() => setFiltersOpen(o => !o)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, padding: "7px 13px", borderRadius: 999, cursor: "pointer",
                  border: `1px solid ${activeCount || filtersOpen ? NAVY : "rgba(0,33,71,0.15)"}`,
                  backgroundColor: filtersOpen ? NAVY : "white", color: filtersOpen ? "white" : "#374151" }}>
                <SlidersHorizontal size={13} />
                Filters
                {activeCount > 0 && (
                  <span style={{ fontSize: 9.5, fontWeight: 800, color: "white", backgroundColor: filtersOpen ? "rgba(255,255,255,0.25)" : C_ACCENT, borderRadius: 999, minWidth: 16, height: 16, padding: "0 4px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{activeCount}</span>
                )}
              </button>
              {filtersOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 50, width: 320, backgroundColor: "white", borderRadius: 10, border: "1px solid rgba(0,33,71,0.12)", boxShadow: "0 10px 30px rgba(0,0,0,0.14)", overflow: "hidden" }}>
                  <div style={{ backgroundColor: BAND, padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "white", textTransform: "uppercase", letterSpacing: "0.04em" }}>Filters</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {activeCount > 0 && (
                        <button onClick={reset} style={{ fontSize: 10, fontWeight: 600, color: "white", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 6, padding: "3px 8px", backgroundColor: "rgba(255,255,255,0.08)", cursor: "pointer" }}>Reset</button>
                      )}
                      <button onClick={() => setFiltersOpen(false)} title="Close" style={{ color: "white", display: "flex", cursor: "pointer", background: "none", border: "none", padding: 0 }}><X size={13} /></button>
                    </div>
                  </div>
                  <div style={{ padding: "12px 14px", display: "grid", gridTemplateColumns: "200px", gap: 10 }}>
                    <FilterSelect label="Year Launched" value={year} onChange={setYear}
                      options={[{ value: "all" as const, label: "All Years" }, ...YEARS.map(y => ({ value: y, label: String(y) }))]} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ════ SECTION 1 — VENTURE PORTFOLIO ════ */}
        {show(1) && (
        <section className="space-y-4">
          <SectionHeader title="Enterprise Portfolio" blurb="How large and healthy is the entrepreneurship portfolio?" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            <Panel title="Enterprise Stage Distribution" subtitle="Enterprises per stage"
              info="Number of enterprises in each stage, sorted by magnitude.">
<ChartWithPlaceholder data={null} height={300}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart layout="vertical" data={v.stageDist || []} margin={{ top: 4, right: 36, bottom: 0, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10.5, fill: "#374151" }} width={96} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                  <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="value" name="Enterprises" fill={C_ACCENT} radius={[0, 4, 4, 0]} barSize={22}>
                    <LabelList dataKey="value" position="right" fontSize={9.5} fill="var(--chart-label)" fontWeight={700} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartWithPlaceholder>
</Panel>
            <Panel title="Enterprise Status" subtitle="Current operating status"
              info="Breakdown of enterprises by current status, from pre-seed through to non-operational.">
<ChartWithPlaceholder data={null} height={300}>
              <Donut data={v.statusData || []} colors={PALETTE} total={v.statusTotal} totalLabel="Enterprises" height={340} legendPercent />
            </ChartWithPlaceholder>
</Panel>
            <Panel title="Enterprises Started per Year" subtitle="New enterprises by year"
              info="Count of enterprises launched each year, in chronological order.">
<ChartWithPlaceholder data={null} height={300}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={v.perYear || []} margin={{ top: 18, right: 10, bottom: 0, left: -18 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#374151" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                  <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="value" name="All Enterprises" fill={C_ACCENT} radius={[4, 4, 0, 0]} barSize={40}>
                    <LabelList dataKey="value" position="top" fontSize={10} fill="var(--chart-label)" fontWeight={700} />
                  </Bar>
                  <Bar dataKey="female" name="Female-Led" fill={C_FEMALE} radius={[4, 4, 0, 0]} barSize={40}>
                    <LabelList dataKey="female" position="top" fontSize={10} fill="var(--chart-label)" fontWeight={700} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartWithPlaceholder>
</Panel>
            <Panel title="Enterprise Survival Rate" subtitle="% surviving over time"
              info="Share of enterprises still operating at year 1, 3, and 5 after launch.">
<ChartWithPlaceholder data={null} height={300}>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={v.survival || []} margin={{ top: 10, right: 16, bottom: 14, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#374151" }} axisLine={false} tickLine={false}
                    label={{ value: "Years since launch", position: "insideBottom", offset: -8, fontSize: 10, fill: "#9CA3AF" }} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="value" name="Survival rate" stroke={C_ACCENT} strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartWithPlaceholder>
</Panel>
          </div>
        </section>

        )}

        {/* ════ SECTION 2 — BUSINESS GROWTH & SUSTAINABILITY ════ */}
        {show(2) && (
        <section className="space-y-4">
          <SectionHeader title="Business Growth & Sustainability" blurb="Are enterprises becoming sustainable businesses?" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            <Panel title="Capital Raised Over Time" subtitle="Total raised by year (USD)"
              info="Total capital raised by enterprises each year, in USD. Hover a point for the exact amount.">
<ChartWithPlaceholder data={null} height={300}>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={growth.capital || []} margin={{ top: 10, right: 16, bottom: 14, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#374151" }} axisLine={false} tickLine={false}
                    label={{ value: "Year", position: "insideBottom", offset: -8, fontSize: 10, fill: "#9CA3AF" }} />
                  <YAxis tickFormatter={usd} tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={56} />
                  <Tooltip content={<MoneyTip />} />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="value" name="Capital raised" stroke={C_ACCENT} strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartWithPlaceholder>
</Panel>
            <Panel title="Funding Sources" subtitle="How enterprises are funded"
              info="Primary funding source per enterprise, sorted by magnitude.">
<ChartWithPlaceholder data={null} height={300}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={v.funding || []} margin={{ top: 18, right: 10, bottom: 0, left: -18 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#374151" }} axisLine={false} tickLine={false} interval={0} height={40} />
                  <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                  <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="value" name="Enterprises" fill={C_ACCENT} radius={[4, 4, 0, 0]} barSize={30}>
                    <LabelList dataKey="value" position="top" fontSize={9.5} fill="var(--chart-label)" fontWeight={700} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartWithPlaceholder>
</Panel>
          </div>
        </section>

        )}

        {/* ════ SECTION 4 — EMPLOYMENT CREATED ════ */}
        {show(4) && (
        <section className="space-y-4">
          <SectionHeader title="Employment Created" blurb="How much work are these enterprises creating?" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            <Panel title="Jobs by Employment Type" subtitle="Full-time · Part-time · Seasonal"
              info="Contract-type split of jobs created by enterprises.">
<ChartWithPlaceholder data={null} height={300}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ji.byType || []} margin={{ top: 18, right: 12, bottom: 0, left: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10.5, fill: "#374151" }} axisLine={false} tickLine={false} interval={0} />
                  <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={44} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                  <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="value" name="Jobs" fill={C_FEMALE} radius={[4, 4, 0, 0]} barSize={48}>
                    <LabelList dataKey="value" position="top" fontSize={10} fill="var(--chart-label)" fontWeight={700} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartWithPlaceholder>
</Panel>
<Panel title="Jobs by Priority Groups" subtitle="Inclusive reach, ranked"
              info="Jobs reaching priority groups — women, youth, refugees/displaced, and persons with disability. Sorted by magnitude.">
<ChartWithPlaceholder data={null} height={300}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart layout="vertical" data={ji.priority || []} margin={{ top: 4, right: 40, bottom: 0, left: 8 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10.5, fill: "#374151" }} width={150} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                  <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="value" name="Jobs" fill={C_INDIGO} radius={[0, 4, 4, 0]} barSize={20}>
                    <LabelList dataKey="value" position="right" fontSize={10} fill="var(--chart-label)" fontWeight={700} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartWithPlaceholder>
</Panel>
          </div>
        </section>

        )}

        {/* ════ SECTION 3 — FOUNDER PROFILE ════ */}
        {show(3) && (
        <section className="space-y-4">
          <SectionHeader title="Founder Profile" blurb="Who are the entrepreneurs, and how has entrepreneurship changed their lives?" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }} className="ep-two">
            <Panel title="Founder Inclusion Reach" subtitle="Female · PWD · Refugee / IDP"
              info="Reach across inclusion demographics: female founders, persons with disabilities, and refugees/displaced persons.">
<ChartWithPlaceholder data={null} height={300}>
              <Donut data={founders.inclusionReachData || []} colors={["#102C5E", "#479BD6", "#E0A458"]} total={total} totalLabel="Founders" height={340} legendPercent />
            </ChartWithPlaceholder>
</Panel>
            <Panel title="Enterprise Work Indicators" subtitle="Share of founders reporting each, %"
              info="Share of founders reporting each decent-work indicator, on a fixed 0–100% scale.">
<ChartWithPlaceholder data={null} height={300}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={outcomes.indicators || []} margin={{ top: 20, right: 12, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#374151" }} axisLine={false} tickLine={false} interval={0} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                  <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="value" name="Reporting" fill={C_ACCENT} radius={[4, 4, 0, 0]} barSize={64}>
                    <LabelList dataKey="value" position="top" fontSize={11} fill="var(--chart-label)" fontWeight={700} formatter={(val: number) => `${val}%`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartWithPlaceholder>
</Panel>
          </div>
          <style>{`@media (max-width: 720px){ .ep-two{ grid-template-columns: 1fr !important; } }`}</style>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
            <Panel title="Household Improvements" subtitle="Reported impact areas, ranked"
              info="How enterprise income improved founder households, sorted from most to least reported.">
<ChartWithPlaceholder data={null} height={300}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart layout="vertical" data={outcomes.household || []} margin={{ top: 4, right: 40, bottom: 0, left: 8 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10.5, fill: "#374151" }} width={160} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                  <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="value" name="Respondents" fill={C_ACCENT} radius={[0, 4, 4, 0]} barSize={18}>
                    <LabelList dataKey="value" position="right" fontSize={10} fill="var(--chart-label)" fontWeight={700} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartWithPlaceholder>
</Panel>
            <Panel title="Reasons Founders Continue" subtitle="Why founders keep trading, ranked"
              info="Top reasons founders continue running their enterprises, sorted from most to least cited.">
<ChartWithPlaceholder data={null} height={300}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart layout="vertical" data={outcomes.persistence || []} margin={{ top: 4, right: 40, bottom: 0, left: 8 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10.5, fill: "#374151" }} width={170} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                  <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="value" name="Founders" fill={C_FEMALE} radius={[0, 4, 4, 0]} barSize={18}>
                    <LabelList dataKey="value" position="right" fontSize={10} fill="var(--chart-label)" fontWeight={700} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartWithPlaceholder>
</Panel>
          </div>
        </section>

        )}

<FeaturedImpactStory footer dataSynced={syncedAt} dataSource={dataSource} />
      </div>

      <style>{`
        .ent-row { transition: background-color 0.12s ease; }
        .ent-row:hover { background-color: rgba(24,95,165,0.07) !important; }
      `}</style>
    </div>
  );
}
