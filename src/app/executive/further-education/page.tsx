"use client";
import { FilterSelect } from "@/components/ui/executive";
import { ChartTip } from "@/components/ui/executive";
import { MetadataHeader } from "@/components/MetadataHeader";
import { ChartWithPlaceholder } from "@/components/ChartWithPlaceholder";

import { useState, useMemo, useEffect } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList,
} from "recharts";
import {
  Users, Info, GraduationCap, BookOpen, Wallet,
  SlidersHorizontal, X, Globe, MapPin, TrendingUp,
} from "lucide-react";
import {
  FE_STUDENTS, GENDERS, QUALIFICATIONS, FIELDS, FUNDING_SOURCES, DESTINATIONS,
  RELEVANCE, COUNTRIES, PROGRAMMES, YEARS,
  type Gender,
} from "@/data/executive/further-education";
import FeaturedImpactStory from "@/components/layout/featured-impact-story";
import HeaderDesign from "@/components/layout/header-design";
import StatsKpiCard from "@/components/ui/stat-kpi-card";
import { DonutRing as Donut } from "@/components/charts/donut-chart";

/* ── palette ─────────────────────────────────────────── */
const NAVY = "var(--brand-secondary)";
const BAND = "var(--brand-secondary)";
const TICK = "#D17A86";
const PALETTE = ["#102C5E", "#479BD6", "#D45F2C", "#A81B2D", "#102C5E", "#D17A86", "#C5D2E0"];
const GENDER_COLOR: Record<string, string> = { Female: "#102C5E", Male: "#479BD6", "Non-binary": "#D45F2C" };
const C_ACCENT = "#102C5E";
const FUNDING_COLOR: Record<string, string> = {
  "Scholarship / funded": "#102C5E", "Self-funded": "#479BD6", "Employer": "#D45F2C", "Loan": "#A81B2D",
};

/* ── helpers ─────────────────────────────────────────── */
const fmt = (n: number) => Math.round(n).toLocaleString();
const share = (c: number, t: number) => (t ? Math.round((c / t) * 100) : 0);
const countBy = (rows: { [k: string]: any }[], key: string, order: string[]) =>
  order.map(name => ({ name, value: rows.filter(r => r[key] === name).length })).filter(d => d.value > 0);

/* ♀ woman / female symbol icon — matches the Entrepreneurship page */
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


/* light section KPI strip card — white, blue border */
function MiniKpi({ Icon, label, value, center }: { Icon: React.ComponentType<any>; label: string; value: string; center?: boolean }) {
  return (
    <div style={{ backgroundColor: "white", borderRadius: 10, border: `1px solid ${C_ACCENT}`, padding: "13px 15px", display: "flex", flexDirection: center ? "column" : "row", alignItems: "center", justifyContent: "center", gap: center ? 7 : 11, textAlign: center ? "center" : "left" }}>
      <span style={{ width: 36, height: 36, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={20} color={C_ACCENT} />
      </span>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 21, fontWeight: 800, color: NAVY, lineHeight: 1.05 }}>{value}</p>
        <p style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, info, children }: {
  title: string; subtitle: string; info?: string; children: React.ReactNode;
}) {
  const [tip, setTip] = useState(false);
  return (
    <div style={{ backgroundColor: "white", borderRadius: 10, border: "1px solid rgba(0,33,71,0.08)", overflow: "hidden" }}>
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
      <div style={{ padding: "16px 18px 18px" }}>{children}</div>
    </div>
  );
}


function RankBar({ data, color = BAND, width = 130, legend = false, center = false }: { data: { name: string; value: number }[]; color?: string; width?: number; legend?: boolean; center?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 32) + (legend ? 24 : 0)}>
      <BarChart layout="vertical" data={data || []} margin={{ top: 4, right: 16, bottom: 0, left: width }}>
        <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#374151" }} width={width} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
        {legend && <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 10 }} />}
        <Bar dataKey="value" name="Graduates" fill={color} radius={[0, 4, 4, 0]} barSize={20}>
          <LabelList dataKey="value" position="insideRight" fontSize={10} fill="white" fontWeight={700} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ── Sections for filter pills ─────────────────────── */
const FE_SECTIONS: { n: number; label: string }[] = [
  { n: 1, label: "Participants" },
];

/* ════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════ */

export default function FurtherEducationPage() {
  const [activeSection, setActiveSection] = useState<number>(1);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [dataSource, setDataSource] = useState<string>("CHII MELA Consolidated Database");
  const show = (n: number) => activeSection === n;

  const [gender, setGender] = useState<"all" | Gender>("all");
  const [scholar, setScholar] = useState<"all" | "scholar" | "non">("all");
  const [qualification, setQualification] = useState<string>("all");
  const [field, setField] = useState<string>("all");
  const [funding, setFunding] = useState<string>("all");
  const [destination, setDestination] = useState<string>("all");
  const [year, setYear] = useState<"all" | number>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setLastUpdated("Data available");
  }, []);

  const scope = useMemo(() =>
    FE_STUDENTS.filter(s => {
      if (gender !== "all" && s.gender !== gender) return false;
      if (scholar === "scholar" && !s.scholar) return false;
      if (scholar === "non" && s.scholar) return false;
      if (qualification !== "all" && s.qualification !== qualification) return false;
      if (field !== "all" && s.field !== field) return false;
      if (funding !== "all" && s.funding !== funding) return false;
      if (destination !== "all" && s.destination !== destination) return false;
      if (year !== "all" && s.year !== year) return false;
      return true;
    }),
  [gender, scholar, qualification, field, funding, destination, year]);

  const TOTAL = scope.length;
  const activeCount = [gender, scholar, qualification, field, funding, destination, year].filter(v => v !== "all").length;
  const reset = () => { setGender("all"); setScholar("all"); setQualification("all"); setField("all"); setFunding("all"); setDestination("all"); setYear("all"); };

  const d = useMemo(() => {
    const enrolled = scope.filter(s => s.active).length;
    const within = scope.filter(s => s.destination === "Within Africa").length;
    const countriesOfStudy = new Set(scope.map(s => s.countryOfStudy)).size;

    const genderData = countBy(scope, "gender", ["Female", "Male"]);
    const cohortRate = [
      { name: "All Talents", value: 7, pct: true },
      { name: "Scholars", value: 17, pct: true },
    ];
    const activeCompleted = [
      { name: "Active", value: enrolled },
      { name: "Completed", value: TOTAL - enrolled },
    ];
    const origin = countBy(scope, "country", COUNTRIES).sort((a, b) => b.value - a.value);
    const programme = countBy(scope, "programme", PROGRAMMES).sort((a, b) => b.value - a.value);
    const qualification = countBy(scope, "qualification", QUALIFICATIONS.filter(q => q !== "Bachelor's top-up"));
    const fieldData = countBy(scope, "field", FIELDS).sort((a, b) => b.value - a.value);
    const relevance = countBy(scope, "relevance", RELEVANCE);
    const region = countBy(scope, "destination", DESTINATIONS);
    const countryStudy = Object.entries(
      scope.reduce((acc: Record<string, number>, s) => { acc[s.countryOfStudy] = (acc[s.countryOfStudy] || 0) + 1; return acc; }, {})
    ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const fundingData = countBy(scope, "funding", FUNDING_SOURCES);
    const fundingByQual = QUALIFICATIONS.map(q => {
      const rows = scope.filter(s => s.qualification === q);
      const rec: Record<string, number | string> = { name: q };
      FUNDING_SOURCES.forEach(f => { rec[f] = rows.filter(s => s.funding === f).length; });
      return rec;
    }).filter(r => FUNDING_SOURCES.some(f => (r[f] as number) > 0));
    const qualByProgramme = PROGRAMMES.map(p => {
      const rows = scope.filter(s => s.programme === p);
      const rec: Record<string, number | string> = { name: p };
      QUALIFICATIONS.forEach(q => { rec[q] = rows.filter(s => s.qualification === q).length; });
      return rec;
    });
    let cum = 0;
    const trend = YEARS.map(yr => { cum += scope.filter(s => s.year === yr).length; return { year: yr, value: cum }; });

    return {
      enrolled, within, abroad: TOTAL - within, countriesOfStudy,
      femalePct: share(scope.filter(s => s.gender === "Female").length, TOTAL),
      malePct: share(scope.filter(s => s.gender === "Male").length, TOTAL),
      fundedPct: share(scope.filter(s => s.funding === "Scholarship / funded").length, TOTAL),
      scholars: scope.filter(s => s.scholar).length,
      talents: scope.filter(s => !s.scholar).length,
      fundedCount: scope.filter(s => s.funding === "Scholarship / funded").length,
      selfFunded: scope.filter(s => s.funding === "Self-funded").length,
      employer: scope.filter(s => s.funding === "Employer").length,
      countriesRepresented: new Set(scope.map(s => s.country)).size,
      genderData, cohortRate, activeCompleted, origin, programme, qualification, fieldData,
      relevance, region, countryStudy, fundingData, fundingByQual, qualByProgramme, trend,
    };
  }, [scope, TOTAL]);

  const renderFilters = () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
      {/* Section pills (left) */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {FE_SECTIONS.map(({ n, label }) => {
          const on = activeSection === n;
          return (
            <button key={n} onClick={() => setActiveSection(n)}
              style={{
                fontSize: 11.5, fontWeight: 700, padding: "7px 13px", borderRadius: 999, cursor: "pointer",
                border: `1px solid ${on ? NAVY : "rgba(0,33,71,0.15)"}`,
                backgroundColor: on ? NAVY : "white", color: on ? "white" : "#6B7280"
              }}>
              {label}
            </button>
          );
        })}
      </div>

      {/* Filters dropdown (right) */}
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
              <FilterSelect label="Year" value={year} onChange={setYear}
                options={[{ value: "all" as const, label: "All Years" }, ...YEARS.map(y => ({ value: y, label: String(y) }))]} />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: "var(--bg-page)", minHeight: "100vh" }}>
      <MetadataHeader
        title="Further Study"
        subtitle="Further Education, Study Pathways, and Lifelong Learning"
        dataSource={dataSource}
        lastUpdated={lastUpdated || "Loading..."}
        period="2022–2026"
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-7 space-y-10">

        {/* ════ OVERVIEW ════ */}
        <section className="space-y-4">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
            <StatsKpiCard label="In Further Education" num={226} sub="graduates" Icon={GraduationCap}
              tooltip="Graduates pursuing further education." />
            <StatsKpiCard label="Female Graduates" num={126} sub="female students" Icon={WomanIcon}
              tooltip="Female graduates in further education." />
            <StatsKpiCard label="Master's & Above" num={88} displayFmt={(n) => `${n}%`} sub="postgraduate" Icon={BookOpen}
              tooltip="Share pursuing master's degrees or higher." />
            <StatsKpiCard label="Scholarship-Funded" num={29} displayFmt={(n) => `${n}%`} sub="funded share" Icon={Wallet}
              tooltip="Share on a scholarship or otherwise funded place." />
            <StatsKpiCard label="Further Study Rate" num={5} displayFmt={(n) => `${n}%`} sub="of all graduates" Icon={TrendingUp}
              tooltip="Share of CHII graduates who progress to further study." />
            <StatsKpiCard label="Countries of Study" num={d.countriesOfStudy} sub="destinations" Icon={Globe}
              tooltip="Distinct countries where graduates pursue further study." />
          </div>

          {/* Filters and Section Pills */}
          {renderFilters()}
        </section>

        {/* ════ PARTICIPANTS & STUDY PATHWAYS ════ */}
        {show(1) && (
        <section className="space-y-4">
          <SectionHeader title="Participants" blurb="Who is pursuing further education and what pathways are they following - profiles, qualifications, fields, and destinations." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            <Panel title="Qualification Level" subtitle="Type of qualification pursued"
              info="Qualification level graduates are pursuing.">
              <Donut data={d.qualification} colors={PALETTE} total={TOTAL} totalLabel="Graduates" height={340} legendPercent />
            </Panel>
            <Panel title="Field of Study" subtitle="Disciplines, ranked"
              info="Fields of study graduates pursue, sorted from most to least.">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart layout="vertical" data={d.fieldData} margin={{ top: 4, right: 36, bottom: 0, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10.5, fill: "#374151" }} width={120} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                  <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="value" name="Graduates" fill={C_ACCENT} radius={[0, 4, 4, 0]} barSize={22}>
                    <LabelList dataKey="value" position="right" fontSize={10} fill="var(--chart-label)" fontWeight={700} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Panel>
            <Panel title="Relevance to ALU Degree" subtitle="How further study relates to the degree"
              info="How closely graduates' further study relates to their ALU degree.">
              <Donut data={d.relevance} colors={["#102C5E", "#479BD6", "#C5D2E0"]} total={TOTAL} totalLabel="Graduates" height={340} legendPercent />
            </Panel>
            <Panel title="Study Destination" subtitle="Within Africa · Europe · North America · Asia / Other"
              info="Geographic regions where graduates pursue further education.">
              <Donut data={d.region} colors={["#102C5E", "#479BD6", "#D45F2C", "#A81B2D"]} total={TOTAL} totalLabel="Graduates" height={340} legendPercent />
            </Panel>
          </div>
        </section>
        )}

        <FeaturedImpactStory footer />
      </div>
    </div>
  );
}
