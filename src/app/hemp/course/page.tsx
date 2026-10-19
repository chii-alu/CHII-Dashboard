"use client";
import { ChartWithPlaceholder } from "@/components/ChartWithPlaceholder";
import { ChartTip, HeaderStatsPanel, FilterButton, FilterDropdown } from "@/components/ui/hemp";
import { useDataSource, useSyncedAt } from "@/hooks/useDataSource";
import PortalNav from "@/components/layout/portal-nav";
import FeaturedImpactStory from "@/components/layout/featured-impact-story";
import HeaderDesign from "@/components/layout/header-design";
import { getGHCohortsFromSupabase } from "@/lib/dashboardDataMapper";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer, LabelList,
} from "recharts";
import { Briefcase, Target, TrendingUp, Users, Info, type LucideIcon, ChevronDown } from "lucide-react";

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

const HERO = "#102C5E";
const BRAND = "#14306B";
const BRAND_DK = "#0C447C";
const LIGHT_BORDER = "rgba(16, 44, 94, 0.12)";
const LIGHT_BG = "#F8F9FA";

function Panel({ title, subtitle, info, children, filterOptions, filterValue, onFilterChange }: { title: string; subtitle: string; info?: string; children: React.ReactNode; filterOptions?: string[]; filterValue?: string; onFilterChange?: (v: string) => void }) {
  const [tip, setTip] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  return (
    <div style={{ backgroundColor: "white", borderRadius: 10, border: `1px solid ${LIGHT_BORDER}`, overflow: "hidden" }}>
      <div style={{ backgroundColor: BRAND, padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 2.5, minWidth: 0, flex: 1 }}>
          <div style={{ width: 3, height: 15, borderRadius: 999, backgroundColor: "#479BD6", flexShrink: 0 }} />
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

export default function HEMPCourses() {
  const dataSource = useDataSource("HEMP");
  const syncedAt = useSyncedAt("HEMP");
  const categories = ["Enrolment & Outcomes", "Academic Performance", "Outcomes"];
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterYear, setFilterYear] = useState("All Years");

  // Fetch data from Supabase
  const { data: ghCohorts, loading, error } = useDashboardData(() => getGHCohortsFromSupabase(), []);
  const hasData = (ghCohorts?.length ?? 0) > 0;

  const show = (category: string) => activeCategory === category;
  const activeFilterCount = filterYear !== "All Years" ? 1 : 0;

  const years = useMemo(() =>
    ghCohorts ? Array.from(new Set(ghCohorts.map(c => c.cohortYear))).sort() : [],
    [ghCohorts]
  );

  const filteredCohorts = useMemo(() => {
    if (!ghCohorts) return [];
    return ghCohorts.filter(c => {
      if (filterYear !== "All Years" && c.cohortYear !== parseInt(filterYear)) return false;
      return true;
    });
  }, [filterYear, ghCohorts]);

  const totalEnrolled = filteredCohorts.reduce((s, c) => s + c.enrolled, 0);
  const totalCompleted = filteredCohorts.reduce((s, c) => s + c.completed, 0);
  const totalCertified = filteredCohorts.reduce((s, c) => s + c.certified, 0);
  const femaleStudents = filteredCohorts.reduce((s, c) => s + c.female, 0);
  const femalePct = hasData && totalEnrolled ? Math.round((femaleStudents / totalEnrolled) * 100) : null;
  const avgScore = hasData && filteredCohorts.length ? Math.round(filteredCohorts.reduce((s, c) => s + c.avgScore, 0) / filteredCohorts.length) : null;
  const avgSatisfaction = hasData && filteredCohorts.length ? parseFloat((filteredCohorts.reduce((s, c) => s + c.satisfaction, 0) / filteredCohorts.length).toFixed(1)) : null;
  const totalVentureProgression = filteredCohorts.reduce((s, c) => s + c.progressedToVenture, 0);

  const [filterOutcomeYear, setFilterOutcomeYear] = useState("All Years");
  const [filterProgrammeYear, setFilterProgrammeYear] = useState("All Years");
  const [filterHealthInterestYear, setFilterHealthInterestYear] = useState("All Years");

  const enrolmentFunnelData = useMemo(() => {
    if (!ghCohorts) return [];
    const outcomeCohorts = ghCohorts.filter(c => {
      if (filterOutcomeYear !== "All Years" && c.cohortYear !== parseInt(filterOutcomeYear)) return false;
      return true;
    });
    const totalEnrolled = outcomeCohorts.reduce((s, c) => s + c.enrolled, 0);
    const totalCompleted = outcomeCohorts.reduce((s, c) => s + c.completed, 0);
    const totalCertified = outcomeCohorts.reduce((s, c) => s + c.certified, 0);
    return [
      {
        name: "Enrolled",
        january: null,
        may: null,
        september: null,
      },
      {
        name: "Completed",
        january: null,
        may: null,
        september: null,
      },
      {
        name: "Graduated",
        january: null,
        may: null,
        september: null,
      },
    ];
  }, [filterOutcomeYear, ghCohorts]);

  // Derived from course data
  const msTotalEnrolled = totalEnrolled;
  const msFemaleStudents = femaleStudents;
  const msFemalePct = femalePct;
  const msCompleted = totalCompleted;
  const msCompletionRate = hasData && totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : null;
  const msEmployed: number | null = null;
  const msEmploymentRate: number | null = msEmployed !== null && msCompleted > 0 ? Math.round((msEmployed / msCompleted) * 100) : null;
  const msAvgGPA = "3.2";
  const msVenturesCreated = totalVentureProgression;

  const totalPWD: number | null = null;
  const totalRefugees: number | null = null;
  const inclusionReachTotal: number | null = totalPWD === null || totalRefugees === null ? null : totalPWD + totalRefugees;

  if (loading) {
    return (
      <div style={{ backgroundColor: LIGHT_BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 16, color: "#666" }}>Loading Courses data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: LIGHT_BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 16, color: "#d32f2f" }}>Failed to load data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: LIGHT_BG, minHeight: "100vh" }}>
      <PortalNav portal="hemp" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-2">
        <header style={{ position: "relative", overflow: "hidden", backgroundColor: HERO, borderRadius: 12, minHeight: 120, display: "flex", alignItems: "center" }}>
          <HeaderDesign />
          <div className="px-4 sm:px-6 py-6" style={{ position: "relative", zIndex: 10, width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <h1 className="text-lg font-black leading-tight" style={{ color: "white", letterSpacing: "0.01em" }}>Courses</h1>
              <p className="text-[13px] mt-2 font-medium" style={{ color: "rgba(215,225,245,0.8)" }}>
                Foundational course for healthcare professionals · enrolment, completion and career progression
              </p>
              <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[12px]" style={{ color: "rgba(215,225,245,0.5)" }}>
                <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Data source:</span> {dataSource}</span>
                <span aria-hidden="true">·</span>
                <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Period:</span> 2021–2026</span>
                <span aria-hidden="true">·</span>
                <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Last updated:</span> {syncedAt}</span>
              </div>
            </div>
          </div>
        </header>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-7">
        <HeaderStatsPanel
          title="Programme Overview"
          nowrap={false}
          cards={[
            {
              label: "Total Enrolled",
              num: totalEnrolled,
              icon: Users,
              displayFmt: (n) => n.toLocaleString(),
              sub: "In coming data",
              tip: "Total students enrolled toward 2030 target",
              pace: true,
              paceA: totalEnrolled,
              paceT: null,
            },
            {
              label: "Completion Rate",
              num: hasData && totalEnrolled ? Math.round((totalCompleted / totalEnrolled) * 100) : null,
              icon: Target,
              displayFmt: (n) => n + "%",
              sub: hasData ? `${totalCompleted} completed the course` : "In coming data",
              tip: "Percentage of enrolled students who completed the course",
              pace: true,
              paceA: hasData && totalEnrolled ? Math.round((totalCompleted / totalEnrolled) * 100) : null,
              paceT: null,
            },
            {
              label: "Graduation Rate",
              num: hasData && totalEnrolled ? Math.round((totalCertified / totalEnrolled) * 100) : null,
              icon: Briefcase,
              displayFmt: (n) => n + "%",
              sub: hasData ? `Graduated: ${totalCertified} of ${totalEnrolled} enrolled` : "In coming data",
              tip: "Percentage of enrolled students who completed all graduation requirements (Graduated Enrolment Funnel)",
              pace: true,
              paceA: hasData && totalEnrolled ? Math.round((totalCertified / totalEnrolled) * 100) : null,
              paceT: null,
            },
            {
              label: "Female Participation",
              num: femalePct,
              icon: WomanIcon,
              displayFmt: (n) => n + "%",
              sub: msFemalePct === null ? "In coming data" : `${msFemalePct}% mission students`,
              tip: "Percentage of female participants across all students and mission cohort",
              pace: true,
              paceA: femalePct,
              paceT: null,
            },
            {
              label: "Average Score",
              num: avgScore,
              icon: Briefcase,
              displayFmt: (n) => n + "%",
              sub: `Assessment performance`,
              tip: "Average assessment score across cohorts",
              pace: true,
              paceA: avgScore,
              paceT: null,
            },
            {
              label: "Inclusion Reach",
              num: null,
              icon: Users,
              displayFmt: (n) => n + "%",
              sub: totalPWD === null ? "In coming data" : `PWD: ${totalPWD} | Refugee: ${totalRefugees}`,
              tip: "Percentage of participants with disabilities and refugee background",
              pace: true,
              paceA: null,
              paceT: null,
            },
          ]}
        />

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
              }}
            >
              {[
                { label: "Year", value: filterYear, setValue: setFilterYear, options: ["All Years", ...years.map(String)] },
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

        {show("Enrolment & Outcomes") && (
          <section style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ width: 3, height: 16, borderRadius: 999, backgroundColor: BRAND, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: BRAND_DK, lineHeight: 1.2, margin: 0 }}>
                    Enrolment & Outcomes
                  </p>
                  <p style={{ fontSize: 11, color: "#6B7280", marginTop: 3, margin: 0 }}>Student participation and completion trends</p>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 24 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
<Panel title="Enrolment Funnel" subtitle="Applied to completion journey" info="The progression from enrolment through to certification, with breakdown by cohort month" filterOptions={["All Years", ...years.map(String)]} filterValue={filterOutcomeYear} onFilterChange={setFilterOutcomeYear}>
                <ChartWithPlaceholder data={hasData ? true : null} height={270}><ResponsiveContainer width="100%" height={270}>
                  <BarChart data={enrolmentFunnelData} margin={{ top: 26, right: 12, bottom: 0, left: -12 }} barCategoryGap="40%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                    <Bar dataKey="january" stackId="cohort" fill="#102C5E" barSize={46} name="January" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="may" stackId="cohort" fill="#479BD6" barSize={46} name="May" />
                    <Bar dataKey="september" stackId="cohort" fill="#D17A86" barSize={46} name="September" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer></ChartWithPlaceholder>
                <div className="flex flex-wrap justify-center gap-4 text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: "#102C5E" }} /> January</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: "#479BD6" }} /> May</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: "#D17A86" }} /> September</span>
                </div>
              </Panel>
              <Panel title="Inclusion Reach" subtitle="Students with disabilities, refugee background, and female participation" info="Breakdown of inclusion reach across participant groups" filterOptions={["All Years", ...years.map(String)]} filterValue={filterOutcomeYear} onFilterChange={setFilterOutcomeYear}>
                <ChartWithPlaceholder data={hasData ? true : null} height={250}><ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { name: "Female", value: femaleStudents },
                    { name: "PWD", value: totalPWD },
                    { name: "Refugee", value: totalRefugees },
                  ]} margin={{ top: 6, right: 10, bottom: 0, left: -16 }} barCategoryGap="28%">
                    <CartesianGrid vertical={false} stroke={LIGHT_BORDER} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(16, 44, 94, 0.04)" }} />
                    <Bar dataKey="value" fill="#479BD6" barSize={46} radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="value" position="top" fontSize={11} fill={BRAND_DK} fontWeight={700} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer></ChartWithPlaceholder>
                <div className="flex items-center justify-center gap-5 text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: "#479BD6" }} /> Count</span>
                </div>
              </Panel>
            </div>
          </section>
        )}

        {show("Academic Performance") && (
          <section style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ width: 3, height: 16, borderRadius: 999, backgroundColor: BRAND, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: BRAND_DK, lineHeight: 1.2, margin: 0 }}>
                    Academic Performance
                  </p>
                  <p style={{ fontSize: 11, color: "#6B7280", marginTop: 3, margin: 0 }}>Assessment scores and module completion rates</p>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 24 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              <Panel title="Average Score Trend" subtitle="Assessment performance over time" info="Average assessment score by cohort" filterOptions={["All Years", ...years.map(String)]} filterValue={filterProgrammeYear} onFilterChange={setFilterProgrammeYear}>
                <ChartWithPlaceholder data={hasData ? true : null} height={250}><ResponsiveContainer width="100%" height={250}>
                  <LineChart data={filteredCohorts.map(c => ({ year: String(c.cohortYear), score: c.avgScore }))} margin={{ top: 6, right: 14, bottom: 0, left: -12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={LIGHT_BORDER} />
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} domain={[0, 100]} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} />
                    <Legend wrapperStyle={{ fontSize: 10 }} iconType="plainline" />
                    <Line type="monotone" dataKey="score" stroke={BRAND} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Score %" />
                  </LineChart>
                </ResponsiveContainer></ChartWithPlaceholder>
              </Panel>
              <Panel title="Module Completion by Cohort" subtitle="Completion rates across course modules" info="Average completion rate across all modules per cohort" filterOptions={["All Years", ...years.map(String)]} filterValue={filterProgrammeYear} onFilterChange={setFilterProgrammeYear}>
                <ChartWithPlaceholder data={hasData ? true : null} height={250}><ResponsiveContainer width="100%" height={250}>
                  <BarChart data={filteredCohorts.map(c => ({
                    name: String(c.cohortYear),
                    modules: c.moduleCompletion && Object.values(c.moduleCompletion).length ? Math.round(Object.values(c.moduleCompletion).reduce((a, b) => a + b, 0) / Object.values(c.moduleCompletion).length) : 0,
                  }))} margin={{ top: 6, right: 10, bottom: 0, left: -16 }} barCategoryGap="28%">
                    <CartesianGrid vertical={false} stroke={LIGHT_BORDER} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} domain={[0, 100]} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(16, 44, 94, 0.04)" }} />
                    <Bar dataKey="modules" fill="#479BD6" barSize={46} radius={[4, 4, 0, 0]} name="Avg Completion %">
                      <LabelList dataKey="modules" position="top" fontSize={11} fill={BRAND_DK} fontWeight={700} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer></ChartWithPlaceholder>
                <div className="flex items-center justify-center gap-5 text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: "#479BD6" }} /> Avg Completion %</span>
                </div>
              </Panel>
            </div>
          </section>
        )}

        {show("Outcomes") && (
          <section style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ width: 3, height: 16, borderRadius: 999, backgroundColor: BRAND, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: BRAND_DK, lineHeight: 1.2, margin: 0 }}>
                    Outcomes
                  </p>
                  <p style={{ fontSize: 11, color: "#6B7280", marginTop: 3, margin: 0 }}>Programme quality, satisfaction, learning outcomes and career progression</p>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 24 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              <Panel title="Learning Outcomes & Relevance" subtitle="Course impact and quality metrics (1-5)" info="Average relevance, quality and satisfaction ratings" filterOptions={["All Years", ...years.map(String)]} filterValue={filterProgrammeYear} onFilterChange={setFilterProgrammeYear}>
                <ChartWithPlaceholder data={hasData ? true : null} height={250}><ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[]} margin={{ top: 6, right: 10, bottom: 0, left: -16 }} barCategoryGap="28%">
                    <CartesianGrid vertical={false} stroke={LIGHT_BORDER} />
                    <XAxis dataKey="metric" tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} domain={[0, 5]} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(16, 44, 94, 0.04)" }} />
                    <Bar dataKey="value" fill="#479BD6" barSize={46} radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="value" position="top" fontSize={11} fill={BRAND_DK} fontWeight={700} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer></ChartWithPlaceholder>
                <div className="flex items-center justify-center gap-5 text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: "#479BD6" }} /> Average Score</span>
                </div>
              </Panel>
              <Panel title="Overall Progression" subtitle="Students advancing to next steps" info="Total students progressing to ventures, research, and internships" filterOptions={["All Years", ...years.map(String)]} filterValue={filterProgrammeYear} onFilterChange={setFilterProgrammeYear}>
                <ChartWithPlaceholder data={hasData ? true : null} height={250}><ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[]} margin={{ top: 6, right: 10, bottom: 0, left: -16 }} barCategoryGap="28%">
                    <CartesianGrid vertical={false} stroke={LIGHT_BORDER} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(16, 44, 94, 0.04)" }} />
                    <Bar dataKey="value" fill="#479BD6" barSize={46} radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="value" position="top" fontSize={11} fill={BRAND_DK} fontWeight={700} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer></ChartWithPlaceholder>
                <div className="flex items-center justify-center gap-5 text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: "#479BD6" }} /> Count</span>
                </div>
              </Panel>
            </div>
          </section>
        )}


      </div>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-4 pb-10">
        <FeaturedImpactStory footer dataSynced={syncedAt} dataSource={dataSource} />
      </div>

    </div>
  );
}
