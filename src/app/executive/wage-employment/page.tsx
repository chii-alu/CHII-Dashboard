"use client";
import { FilterSelect } from "@/components/ui/executive";
import { ChartTip } from "@/components/ui/executive";
import { useState, useMemo } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList,
} from "recharts";
import {
  Users, Info, Briefcase, Cpu, ShieldCheck,
  ArrowUpRight, Clock, SlidersHorizontal, X,
} from "lucide-react";
import {
  WORKERS, GENDERS, EMPLOYMENT_TYPES, ROLE_LEVELS, ARRANGEMENTS, ORG_TYPES,
  SECTORS, COUNTRIES, YEARS, COHORTS, PROGRAMS, PROGRAM_NAMES,
  type Gender, type Worker, type ParticipantType,
} from "@/data/executive/wage-employment";
import FeaturedImpactStory from "@/components/layout/featured-impact-story";
import HeaderDesign from "@/components/layout/header-design";
import StatsKpiCard from "@/components/ui/stat-kpi-card";
import { DonutRing as Donut } from "@/components/charts/donut-chart";

const NAVY = "var(--brand-secondary)";
const BAND = "var(--brand-secondary)";
const TICK = "#D17A86";
const C_TOTAL = "#102C5E";
const C_FEMALE = "#479BD6";

const GENDER_COLOR: Record<Gender, string> = { Female: "#102C5E", Male: "#479BD6", "Non-binary": "#D45F2C" };
const EMP_COLOR: Record<string, string> = {
  "Full-time": "#102C5E", "Part-time": "#479BD6", "Seasonal": "#E0A458",
};
const ARR_COLOR: Record<string, string> = { Remote: "#102C5E", "On-site": "#479BD6", Hybrid: "#D45F2C" };

const share = (c: number, t: number) => (t ? Math.round((c / t) * 100) : 0);
const fmt = (n: number) => Math.round(n).toLocaleString();
const usd = (n: number) => `$${Math.round(n).toLocaleString()}`;
const median = (arr: number[]) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

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

function Panel({ title, subtitle, info, children }: { title: string; subtitle: string; info?: string; children: React.ReactNode }) {
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
                <span style={{ position: "relative", display: "flex", cursor: "pointer" }} onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}>
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

function ChartTip2({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: "#042C53", color: "white", padding: "6px 10px", borderRadius: 6, fontSize: 11, boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}>
      <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ margin: "2px 0", fontSize: 10, color: p.color || "white" }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

const WE_SECTIONS: { n: number; label: string }[] = [
  { n: 1, label: "Workforce Profile" },
  { n: 2, label: "Employment Trends" },
  { n: 3, label: "Program Outcomes" },
  { n: 4, label: "Quality & Impact" },
];

export default function WageEmploymentPage() {
  const [year, setYear] = useState<"all" | number>("all");
  const [activeSection, setActiveSection] = useState<number>(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const show = (n: number) => activeSection === n;

  const scope = useMemo(
    () => WORKERS.filter((w) => (year !== "all" ? w.year === year : true)),
    [year]
  );

  const total = scope.length;

  const kpis = useMemo(() => {
    const female = scope.filter((w) => w.gender === "Female").length;
    const decent = scope.filter((w) => w.decentWork).length;
    const tech = scope.filter((w) => w.inTech).length;
    const medMonths = median(scope.map((w) => w.timeToEmployment));
    const medSalary = scope.length > 0 ? Math.round(median(scope.map((w) => w.salaryUSD))) : 0;
    return {
      female,
      femalePct: share(female, total),
      decentPct: share(decent, total),
      techPct: share(tech, total),
      medMonths: Math.round(medMonths),
      medSalary,
    };
  }, [scope, total]);

  const genderData = useMemo(
    () => (["Female", "Male"] as Gender[]).map((g) => ({ name: g, value: scope.filter((w) => w.gender === g).length })).filter((d) => d.value > 0),
    [scope]
  );

  const empTypeData = useMemo(
    () => EMPLOYMENT_TYPES.map((e) => ({ name: e, value: scope.filter((w) => w.employmentType === e).length })).filter((d) => d.value > 0),
    [scope]
  );

  const orgByArr = useMemo(() => {
    return ORG_TYPES.map((o) => {
      const rows = scope.filter((w) => w.orgType === o);
      const rec: Record<string, number | string> = { name: o, total: rows.length };
      ARRANGEMENTS.forEach((a) => {
        rec[a] = rows.filter((w) => w.arrangement === a).length;
      });
      return rec;
    }).filter((d) => (d.total as number) > 0).sort((a, b) => (b.total as number) - (a.total as number));
  }, [scope]);

  const trends = useMemo(() => {
    const TREND_YEARS = [2025, 2026, 2027, 2028, 2029, 2030];
    return TREND_YEARS.map((yr) => {
      const rows = scope.filter((w) => w.year === yr);
      const fem = rows.filter((w) => w.gender === "Female");
      const pwd = rows.filter((w) => w.pwd);
      const refugee = rows.filter((w) => w.refugee);
      const placed = rows.filter((w) => w.timeToEmployment <= 12);
      const placedFem = fem.filter((w) => w.timeToEmployment <= 12);
      return {
        year: yr,
        Total: rows.length,
        Female: fem.length,
        PWD: pwd.length,
        "Refugee/IDP": refugee.length,
        "12mo%": share(placed.length, rows.length),
      };
    });
  }, [scope]);

  const sectorData = useMemo(
    () => SECTORS.map((s) => ({ name: s, value: scope.filter((w) => w.sector === s).length })).filter((d) => d.value > 0).sort((a, b) => b.value - a.value),
    [scope]
  );

  const programOutcomes = useMemo(() => {
    const rows = PROGRAMS.map((meta) => {
      const ps = scope.filter((w) => w.program === meta.name);
      return {
        name: meta.name,
        employmentRate: meta.employmentRate,
        decent: share(ps.filter((w) => w.decentWork).length, ps.length),
        placement: share(ps.filter((w) => w.timeToEmployment <= 12).length, ps.length),
        avgIncome: ps.length ? Math.round(ps.reduce((s, w) => s + w.salaryUSD, 0) / ps.length) : 0,
        typeMix: Object.fromEntries(EMPLOYMENT_TYPES.map((t) => [t, ps.filter((w) => w.employmentType === t).length])),
      };
    });
    const rateData = [...rows].map((p) => ({ name: p.name, value: p.employmentRate }));
    const typeData = [...rows].map((p) => ({ name: p.name, ...p.typeMix }));
    return { rateData, typeData, count: rows.length };
  }, [scope]);

  const quality = useMemo(() => {
    const indicators = [
      { name: "Reliable income", value: 71 },
      { name: "Good reputation", value: 89 },
      { name: "Respected at work", value: 91 },
      { name: "Sense of purpose", value: 90 },
    ];
    const accessing = scope.filter((w) => w.decentWork).length;
    const household = [
      { name: "Financial stability", value: 184 },
      { name: "Family education", value: 156 },
      { name: "Healthcare access", value: 131 },
      { name: "Household well-being", value: 118 },
      { name: "Support to extended family", value: 94 },
    ].sort((a, b) => b.value - a.value);
    const contribution = [
      { name: "Strongly agree", value: 148 },
      { name: "Agree", value: 172 },
      { name: "Neutral", value: 61 },
      { name: "Disagree", value: 24 },
      { name: "Strongly disagree", value: 9 },
    ];
    return { indicators, accessing, household, contribution };
  }, [scope]);

  const activeCount = year !== "all" ? 1 : 0;
  const reset = () => setYear("all");

  return (
    <div style={{ backgroundColor: "var(--bg-page)", minHeight: "100vh" }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-2">
        <header style={{ position: "relative", overflow: "hidden", backgroundColor: "var(--brand-primary)", borderRadius: 12, minHeight: 120, display: "flex", alignItems: "center" }}>
          <HeaderDesign />
          <div className="px-4 sm:px-6 py-6" style={{ position: "relative", zIndex: 10, width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <h1 className="text-lg font-black leading-tight" style={{ color: "white", letterSpacing: "0.01em" }}>Wage Employment</h1>
              </div>
              <p className="text-[13px] sm:text-sm mt-2 font-medium" style={{ color: "#85B7EB" }}>CHII Employment Outcomes, Trends, Performance, and Work Quality</p>
              <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[12px] sm:text-[13px]" style={{ color: "rgba(181,212,244,0.5)" }}>
                <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Data source:</span> CHII MELA Consolidated Database</span>
                <span aria-hidden="true">·</span>
                <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Period:</span> 2025-2030</span>
                <span aria-hidden="true">·</span>
                <span>{WORKERS.length} placements tracked</span>
              </div>
            </div>
          </div>
        </header>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-7 space-y-10">
        <section className="space-y-4">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: 12 }}>
            <StatsKpiCard label="Wage Employed" num={total} sub="participants in work" Icon={Briefcase}
              tooltip="Total CHII participants currently in wage employment within the active filters." />
            <StatsKpiCard label="Female Wage Employed" num={kpis.female} sub={`${kpis.femalePct}% of employed`} Icon={WomanIcon}
              tooltip="Number and share of female participants in wage employment." />
            <StatsKpiCard label="Median Salary" num={kpis.medSalary} displayFmt={(n) => `$${(n / 1000).toFixed(1)}k`} sub="monthly" Icon={ArrowUpRight}
              tooltip="Median monthly salary of wage-employed participants." />
            <StatsKpiCard label="Decent Work Rate" num={kpis.decentPct} displayFmt={(n) => `${Math.round(n)}%`} sub="of employed" Icon={ShieldCheck}
              tooltip="Share of employed participants in roles meeting decent-work criteria." />
            <StatsKpiCard label="Non-clinical Roles" num={kpis.techPct} displayFmt={(n) => `${Math.round(n)}%`} sub="of employed" Icon={Cpu}
              tooltip="Share of employed participants working in non-clinical roles." />
            <StatsKpiCard label="Median Time to Job" num={kpis.medMonths} displayFmt={(n) => `${Math.round(n)} mo`} sub="to first job" Icon={Clock}
              tooltip="Median number of months from completing a program to first wage employment." />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {WE_SECTIONS.map(({ n, label }) => (
                <button key={n} onClick={() => setActiveSection(n)}
                  style={{ fontSize: 11.5, fontWeight: 700, padding: "7px 13px", borderRadius: 999, cursor: "pointer",
                    border: `1px solid ${activeSection === n ? NAVY : "rgba(0,33,71,0.15)"}`,
                    backgroundColor: activeSection === n ? NAVY : "white", color: activeSection === n ? "white" : "#6B7280" }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ position: "relative", flexShrink: 0 }}>
              <button onClick={() => setFiltersOpen((o) => !o)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, padding: "7px 13px", borderRadius: 999, cursor: "pointer",
                  border: `1px solid ${activeCount || filtersOpen ? NAVY : "rgba(0,33,71,0.15)"}`,
                  backgroundColor: filtersOpen ? NAVY : "white", color: filtersOpen ? "white" : "#374151" }}>
                <SlidersHorizontal size={13} />
                Filters
                {activeCount > 0 && (
                  <span style={{ fontSize: 9.5, fontWeight: 800, color: "white", backgroundColor: filtersOpen ? "rgba(255,255,255,0.25)" : C_TOTAL, borderRadius: 999, minWidth: 16, height: 16, padding: "0 4px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{activeCount}</span>
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
                      options={[{ value: "all" as const, label: "All Years" }, ...YEARS.map((y) => ({ value: y, label: String(y) }))]} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {show(1) && (
          <section className="space-y-4">
            <SectionHeader title="Workforce Profile" blurb="Who is employed?" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }} className="we-two">
              <style>{`@media (max-width: 720px){ .we-two{ grid-template-columns: 1fr !important; } }`}</style>
              <Panel title="Gender Distribution" subtitle="Female · Male · Non-binary"
                info="Distribution of employed participants by gender.">
                <Donut data={genderData} colors={GENDER_COLOR} total={total} totalLabel="Employed" height={340} legendPercent />
              </Panel>
              <Panel title="Contract Type" subtitle="Full-time · Part-time · Seasonal"
                info="Contract-type split across the employed population.">
                <Donut data={empTypeData} colors={EMP_COLOR} total={total} totalLabel="Employed" height={340} legendPercent />
              </Panel>
              <Panel title="Employer Type & Working Arrangement" subtitle="Employer type, broken down by on-site · hybrid · remote"
                info="Each employer type split by working arrangement.">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart layout="vertical" data={orgByArr} margin={{ top: 4, right: 16, bottom: 0, left: 8 }}>
                    <CartesianGrid horizontal={false} stroke="rgba(0,33,71,0.06)" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#374151" }} width={110} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    {ARRANGEMENTS.map((a, i) => (
                      <Bar key={a} dataKey={a} stackId="ar" fill={ARR_COLOR[a]} barSize={18}
                        radius={i === ARRANGEMENTS.length - 1 ? [0, 4, 4, 0] : undefined} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </Panel>
              <Panel title="Time to Employment after Graduation" subtitle="When graduates found employment"
                info="Distribution of time between graduation and first employment.">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={[
                    { name: "Before Graduation", value: 45 },
                    { name: "Less than 3 months", value: 78 },
                    { name: "3-6 months", value: 62 },
                    { name: "6-12 months", value: 38 },
                    { name: "12+ months", value: 25 },
                  ]} margin={{ top: 16, right: 10, bottom: 0, left: -16 }} barCategoryGap="26%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10.5, fill: "#374151" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="value" name="Graduates" fill={C_TOTAL} radius={[4, 4, 0, 0]} barSize={48}>
                      <LabelList dataKey="value" position="top" fontSize={10.5} fill={NAVY} fontWeight={700} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Panel>
            </div>
          </section>
        )}

        {show(2) && (
          <section className="space-y-4">
            <SectionHeader title="Employment Trends" blurb="How is employment evolving over time?" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }} className="we-two">
              <Panel title="Yearly Wage Jobs Trend" subtitle="Total · Female · PWD · Refugee/IDP"
                info="Employment numbers across demographic groups over time.">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={trends} margin={{ top: 16, right: 10, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#374151" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 10 }} />
                    <Line type="monotone" dataKey="Female" stroke="#479BD6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="PWD" stroke="#102C5E" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Refugee/IDP" stroke="#E0A458" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Panel>
              <Panel title="12-Month Placement Rate" subtitle="% employed within 12 months of graduation"
                info="Trend in quick employment placement outcomes.">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={trends} margin={{ top: 16, right: 10, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#374151" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                    <Line type="monotone" dataKey="12mo%" stroke={C_TOTAL} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Panel>
            </div>
          </section>
        )}

        {show(3) && (
          <section className="space-y-4">
            <SectionHeader title="Program Outcomes" blurb="Which programs drive employment?" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }} className="we-two">
              <Panel title="Employment Rate by Program" subtitle="Program employment rates"
                info="Employment rate for each program.">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={programOutcomes.rateData} margin={{ top: 16, right: 10, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 9.5, fill: "#374151" }} axisLine={false} tickLine={false} interval={0} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                    <Bar dataKey="value" name="Employment Rate %" fill={C_TOTAL} radius={[4, 4, 0, 0]} barSize={40}>
                      <LabelList dataKey="value" position="top" fontSize={10} fill="var(--chart-label)" fontWeight={700} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Panel>
              <Panel title="Employment Type by Program" subtitle="Contract type distribution per program"
                info="How employment types vary across programs.">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={programOutcomes.typeData} margin={{ top: 16, right: 10, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 9.5, fill: "#374151" }} axisLine={false} tickLine={false} interval={0} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    {EMPLOYMENT_TYPES.map((t) => (
                      <Bar key={t} dataKey={t} stackId="type" fill={EMP_COLOR[t]} barSize={40} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </Panel>
            </div>
          </section>
        )}

        {show(4) && (
          <section className="space-y-4">
            <SectionHeader title="Quality & Impact" blurb="Is the work dignified, and is it improving lives?" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }} className="we-two">
              <Panel title="Household Impact" subtitle="Reported impact areas, ranked"
                info="How wage employment improved participants' households, sorted from most to least reported.">
                <ResponsiveContainer width="100%" height={Math.max(220, quality.household.length * 40)}>
                  <BarChart layout="vertical" data={quality.household} margin={{ top: 4, right: 40, bottom: 0, left: 8 }}>
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10.5, fill: "#374151" }} width={200} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="value" name="Respondents" fill={BAND} radius={[0, 4, 4, 0]} barSize={20}>
                      <LabelList dataKey="value" position="right" fontSize={10} fill="var(--chart-label)" fontWeight={700} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Panel>
              <Panel title="CHII Support Assessment" subtitle="Agreement with: CHII's support contributed to my employment"
                info="How participants rate CHII's contribution to their employment outcomes.">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={quality.contribution} margin={{ top: 16, right: 10, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 9.5, fill: "#374151" }} axisLine={false} tickLine={false} interval={0} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="value" name="Respondents" fill={C_FEMALE} radius={[4, 4, 0, 0]} barSize={40}>
                      <LabelList dataKey="value" position="top" fontSize={10} fill="var(--chart-label)" fontWeight={700} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Panel>
            </div>
          </section>
        )}

        <FeaturedImpactStory footer />
      </div>
    </div>
  );
}
