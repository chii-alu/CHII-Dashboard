"use client";
import { FILTER_YEARS } from "@/lib/filter-years";
import { ChartWithPlaceholder } from "@/components/ChartWithPlaceholder";
import { ChartTip, HeaderStatsPanel, FilterButton, FilterDropdown } from "@/components/ui/hemp";
import { useDataSource, useSyncedAt } from "@/hooks/useDataSource";
import FeaturedImpactStory from "@/components/layout/featured-impact-story";
import HeaderDesign from "@/components/layout/header-design";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useProgress } from "@/hooks/useProgress";
import { useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer, LabelList,
} from "recharts";
import { Cell } from "recharts";
import { hostNameList, hostBars, hostColor, hasMetric, topWithOther, departmentBars, type HostMetrics } from "@/lib/hostChart";
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

export default function ProgrammeTemplate({ dashboard, intervention, title, subtitle }: { dashboard: "HEMP" | "HECO"; intervention: string; title: string; subtitle: string }) {
  const progressRows = useProgress(dashboard, intervention);
  const { data: interventionData } = useDashboardData(
    () => fetch(`/api/dashboard-intervention?dashboard=${dashboard}&intervention=${encodeURIComponent(intervention)}`).then(r => r.json()),
    [dashboard, intervention]
  );
  // Participants by academic programme, from the Internships breakdown rows (all years).
  const academicProgrammeRows: { programme: string; count: number }[] | null =
    interventionData?.breakdowns?.["Participants By Academic Programmes"]?.map((r: any) => ({ programme: r.name, count: r.count })) ?? null;
  // Inclusion Reach counts by segment (all years), from the Internships segment rows.
  const inclusionSegments = (interventionData?.segments ?? []).filter((r: any) => r.metric === "Inclusion Reach" && r.year == null);
  const segmentValue = (segment: string): number | null => inclusionSegments.find((r: any) => r.segment === segment)?.value ?? null;
  const inclusionBars = inclusionSegments.length > 0
    ? [
        { name: "Female", value: segmentValue("female") },
        { name: "PWD", value: segmentValue("pwd") },
        { name: "Refugee/IDP", value: segmentValue("refugee_idp") },
      ]
    : null;
  const actualOf = (metric: string): number | null => interventionData?.headlines?.find((h: any) => h.metric === metric)?.value ?? null;
  const pctOf = (v: number | null) => (v === null ? null : Math.round(v * 10) / 10);
  const dataSource = useDataSource(dashboard);
  const syncedAt = useSyncedAt(dashboard);
  const categories = ["Reach & Engagement", "Partner Organizations", "Employer Feedback", "Student Feedback"];
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterYear, setFilterYear] = useState("All Years");
  const [filterOrganization, setFilterOrganization] = useState("All");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [filterCohort, setFilterCohort] = useState("All");
  const [filterFemale, setFilterFemale] = useState("All");
  const [filterIDP, setFilterIDP] = useState("All");
  const [filterPLWD, setFilterPLWD] = useState("All");
  const [filterOutcomeYear, setFilterOutcomeYear] = useState("All Years");
  // Participant Trend: one point per year in the database (Internships section), narrowed by the year filter.
  const participantTrendRows = (interventionData?.segments ?? []).filter((r: any) => r.metric === "Participant Trend" && r.segment === "all" && r.year != null);
  const participantTrendData = participantTrendRows.length > 0
    ? participantTrendRows
        .filter((r: any) => filterOutcomeYear === "All Years" || r.year === Number(filterOutcomeYear))
        .sort((a: any, b: any) => a.year - b.year)
        .map((r: any) => ({ year: String(r.year), students: r.value }))
    : null;
  const [filterSectorYear, setFilterSectorYear] = useState("All Years");
  // Host organisations and their per-host rows, read from the database (see /api/internships-hosts).
  const { data: hostData } = useDashboardData<{ hosts: string[]; metrics: HostMetrics }>(
    () => fetch(`/api/programme-hosts?dashboard=${dashboard}&intervention=${encodeURIComponent(intervention)}`).then(r => r.json()),
    [dashboard, intervention]
  );
  const hostMetrics: HostMetrics = hostData?.metrics ?? {};
  const hosts = hostNameList(hostData?.hosts ?? [], hostMetrics);
  const yearOf = (filter: string) => (filter === "All Years" ? null : Number(filter));
  const hostYear = yearOf(filterSectorYear);
  const placementBars = topWithOther(hostBars(hostMetrics, { Placements: "Placement By Organization" }, hostYear, hosts), "Placements", 8);
  const departmentData = departmentBars(hostMetrics, "Departments By Organization", hostYear, hosts);
  const overallBars = hostBars(hostMetrics, { "Overall Rating": "Overall Employer Rating" }, hostYear, hosts);
  const skillsBars = hostBars(hostMetrics, { "Skills Rating": "Workplace Skills" }, hostYear, hosts);
  const healthBars = hostBars(hostMetrics, { "Systems Understanding": "Health Sector Readiness" }, hostYear, hosts);
  const recommendBars = hostBars(hostMetrics, { "Recommend ALU": "Employer Recommendation & Hiring" }, hostYear, hosts);
  const placementAfterBars = hostBars(hostMetrics, { Placements: "Placement After Internship" }, hostYear, hosts);
  const learningBars = hostBars(hostMetrics, { "Real-World Application": "Learning & Skill Application" }, hostYear, hosts);
  const internRecBars = hostBars(hostMetrics, { Recommendation: "Intern Recommendation" }, hostYear, hosts);
  const [filterHealthInterestYear, setFilterHealthInterestYear] = useState("All Years");

  const show = (category: string) => activeCategory === category;
  const activeFilterCount = [filterYear !== "All Years", filterOrganization !== "All", filterDepartment !== "All", filterCohort !== "All", filterFemale !== "All", filterIDP !== "All", filterPLWD !== "All"].filter(Boolean).length;

  // Fetch data from Supabase
  const { data: internships, loading, error } = useDashboardData(() => Promise.resolve([] as any[]), []);

  const years = FILTER_YEARS;
  const cohorts = internships ? Array.from(new Set(internships.map(i => {
    const cohortNum = parseInt(i.id.substring(1));
    return Math.ceil(cohortNum / 5);
  }))).sort((a, b) => a - b) : [];

  const filteredInternships = useMemo(() => {
    if (!internships) return [];
    return internships.filter(i => {
      if (filterYear !== "All Years" && i.year !== parseInt(filterYear)) return false;
      if (filterOrganization !== "All" && i.organization !== filterOrganization) return false;
      if (filterDepartment !== "All" && i.department !== filterDepartment) return false;
      if (filterCohort !== "All") {
        const cohortNum = Math.ceil(parseInt(i.id.substring(1)) / 5);
        if (cohortNum !== parseInt(filterCohort)) return false;
      }
      if (filterFemale === "Yes" && i.femaleStudents === 0) return false;
      if (filterIDP === "Yes" && i.idpParticipants === 0) return false;
      if (filterPLWD === "Yes" && i.plwdParticipants === 0) return false;
      return true;
    });
  }, [filterYear, filterOrganization, filterDepartment, filterCohort, filterFemale, filterIDP, filterPLWD, internships]);

  const hasData = (internships?.length ?? 0) > 0;
  const totalStudents = filteredInternships.reduce((s, i) => s + i.students, 0);
  const femaleStudents = filteredInternships.reduce((s, i) => s + i.femaleStudents, 0);
  const femalePct: number | null = hasData && totalStudents ? Math.round((femaleStudents / totalStudents) * 100) : null;
  const avgSatisfaction = filteredInternships.length ? parseFloat((filteredInternships.reduce((s, i) => s + i.satisfactionScore, 0) / filteredInternships.length).toFixed(1)) : 0;
  const totalConversions = filteredInternships.reduce((s, i) => s + i.employmentConversions, 0);
  const conversionRate: number | null = hasData && totalStudents ? Math.round((totalConversions / totalStudents) * 100) : null;
  const mentorshipCount = filteredInternships.filter(i => i.hasMentor).length;
  const avgDuration = filteredInternships.length ? Math.round(filteredInternships.reduce((s, i) => s + i.durationWeeks, 0) / filteredInternships.length) : 0;

  const filteredInternshipsForHealthInterest = useMemo(() => {
    if (!internships) return [];
    return internships.filter(i => {
      if (filterHealthInterestYear !== "All Years" && i.year !== parseInt(filterHealthInterestYear)) return false;
      return true;
    });
  }, [filterHealthInterestYear, internships]);

  const totalApplicants: number | null = null;
  const placementsSecured: number | null = hasData ? filteredInternships.length : null;
  const uniquePartners = hosts.length;
  const avgEmployerRating: number | null = hasData && filteredInternships.length ? parseFloat(((filteredInternships.reduce((s, i) => s + i.recommendationScore + i.likelyToHire * 2 + i.healthSystemsUnderstanding + i.appliesToHealthProblems, 0) / (filteredInternships.length * 6)) * 2).toFixed(1)) : null;

  // Fallback values for Mission Students (will be replaced with Supabase data)
  const msTotalEnrolled = null;
  const msFemaleStudents = null;
  const msFemalePct = null;
  const msCompleted = null;
  const msCompletionRate = null;
  const msEmployed = null;
  const msEmploymentRate = null;
  const msAvgGPA: string | null = null;
  const msVenturesCreated = null;

  if (loading) {
    return (
      <div style={{ backgroundColor: LIGHT_BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 16, color: "#666" }}>Loading programme data…</p>
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

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-2">
        <header style={{ position: "relative", overflow: "hidden", backgroundColor: HERO, borderRadius: 12, minHeight: 120, display: "flex", alignItems: "center" }}>
          <HeaderDesign />
          <div className="px-4 sm:px-6 py-6" style={{ position: "relative", zIndex: 10, width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <h1 className="text-lg font-black leading-tight" style={{ color: "white", letterSpacing: "0.01em" }}>{title}</h1>
              <p className="text-[13px] mt-2 font-medium" style={{ color: "rgba(215,225,245,0.8)" }}>
                {subtitle}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[12px]" style={{ color: "rgba(215,225,245,0.5)" }}>
                <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Data source:</span> {dataSource}</span>
                <span aria-hidden="true">·</span>
                <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Period:</span> 2024–2030</span>
                <span aria-hidden="true">·</span>
                <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Last updated:</span> {syncedAt}</span>
              </div>
            </div>
          </div>
        </header>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-7">
<HeaderStatsPanel
        progressRows={progressRows}
        columns={6}
          title="Programme Overview"
          nowrap={false}
          cards={[
            {
              label: "Total Applicants",
              num: actualOf("Total Applicants"),
              icon: Users,
              displayFmt: (n) => n.toLocaleString(),
              sub: placementsSecured === null ? "In coming data" : `Application volume | ${placementsSecured} placements secured`,
              tip: "Total students who applied for internships",
            },
            {
              label: "Placements Secured",
              num: actualOf("Placements Secured"),
              icon: Briefcase,
              displayFmt: (n) => n.toLocaleString(),
              sub: msTotalEnrolled === null ? "In coming data" : `${msTotalEnrolled} mission students`,
              tip: "Total internship placements secured",
            },
            {
              label: "Female Participation",
              num: pctOf(actualOf("Female Participation")),
              icon: WomanIcon,
              displayFmt: (n) => n + "%",
              sub: msFemalePct === null ? "In coming data" : `${msFemalePct}% mission students`,
              tip: "Percentage of female participants",
            },
            {
              label: "Inclusion Reach",
              num: pctOf(actualOf("Inclusion Reach")),
              icon: Users,
              displayFmt: (n) => n + "%",
              sub: "In coming data",
              tip: "Percentage of students with disabilities and refugee background",
            },
            {
              label: "Employer Rating",
              num: actualOf("Employer Rating"),
              icon: TrendingUp,
              displayFmt: (n) => n.toFixed(1),
              sub: `Out of 10 | Based on employer feedback`,
              tip: "Average employer satisfaction rating",
            },
            {
              label: "Student Intern Rating",
              num: actualOf("Student Intern Rating"),
              icon: TrendingUp,
              displayFmt: (n) => n.toFixed(1),
              sub: ``,
              tip: "Average rating given by students who completed an internship",
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
                setFilterOrganization("All");
                setFilterDepartment("All");
                setFilterCohort("All");
                setFilterFemale("All");
                setFilterIDP("All");
                setFilterPLWD("All");
              }}
            >
              {[
                { label: "Year", value: filterYear, setValue: setFilterYear, options: ["All Years", ...years.map(String)] },
                { label: "Organization", value: filterOrganization, setValue: setFilterOrganization, options: ["All", ...hosts] },
                { label: "Department", value: filterDepartment, setValue: setFilterDepartment, options: ["All", ...departmentData.departments] },
                { label: "Cohort", value: filterCohort, setValue: setFilterCohort, options: ["All", ...cohorts.map(c => `Cohort ${c}`)] },
                { label: "Female", value: filterFemale, setValue: setFilterFemale, options: ["All", "Yes"] },
                { label: "IDP", value: filterIDP, setValue: setFilterIDP, options: ["All", "Yes"] },
                { label: "PLWD", value: filterPLWD, setValue: setFilterPLWD, options: ["All", "Yes"] },
              ].map(filter => (
                <div key={filter.label} style={{ marginBottom: 12, minWidth: 140 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: BRAND_DK, margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                    {filter.label}
                  </p>
                  <select
                    value={filter.value}
                    onChange={(e) => filter.setValue(e.target.value)}
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "6px 8px",
                      borderRadius: 6,
                      border: `1px solid ${LIGHT_BORDER}`,
                      backgroundColor: "white",
                      color: BRAND_DK,
                      cursor: "pointer",
                      width: "100%",
                      fontFamily: "inherit",
                    }}
                  >
                    {filter.options.map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </FilterDropdown>
          </div>
        </div>

        {show("Reach & Engagement") && (
          <section style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ width: 3, height: 16, borderRadius: 999, backgroundColor: BRAND, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: BRAND_DK, lineHeight: 1.2, margin: 0 }}>
                    Reach & Engagement
                  </p>
                  <p style={{ fontSize: 11, color: "#6B7280", marginTop: 3, margin: 0 }}>Student participation and engagement outcomes</p>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 24 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              <Panel title="Participants by Academic Programmes" subtitle="Participant distribution across programmes" info="Internship participants by primary academic programme" filterOptions={["All Years", ...FILTER_YEARS.map(String)]} filterValue={filterOutcomeYear} onFilterChange={setFilterOutcomeYear}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <ChartWithPlaceholder data={academicProgrammeRows} height={300}><ResponsiveContainer width="100%" height={300}>
                    <BarChart data={academicProgrammeRows ?? []} layout="vertical" margin={{ top: 6, right: 50, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={LIGHT_BORDER} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="programme" type="category" tick={{ fontSize: 10, fill: "#374151", fontWeight: 500 }} axisLine={false} tickLine={false} width={210} />
                      <Tooltip content={<ChartTip />} />
                      <Bar dataKey="count" fill="#479BD6" radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="count" position="right" fontSize={10} fill={BRAND_DK} fontWeight={700} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer></ChartWithPlaceholder>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", paddingTop: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 12, height: 12, backgroundColor: "#479BD6", borderRadius: 2 }} />
                      <span style={{ fontSize: 10, color: "#6B7280" }}>Participant Count</span>
                    </div>
                  </div>
                </div>
              </Panel>
              <Panel title="Participants by Health Interest Area" subtitle="Distribution across health specializations" info="Internship participants by health interest" filterOptions={["All Years", ...years.map(String)]} filterValue={filterOutcomeYear} onFilterChange={setFilterOutcomeYear}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <ChartWithPlaceholder data={hasData ? true : null} height={300}><ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[]} layout="vertical" margin={{ top: 6, right: 50, bottom: 0, left: 180 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={LIGHT_BORDER} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="area" type="category" tick={{ fontSize: 10, fill: "#374151", fontWeight: 500 }} axisLine={false} tickLine={false} width={170} />
                      <Tooltip content={<ChartTip />} />
                      <Bar dataKey="count" fill="#479BD6" radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="count" position="right" fontSize={10} fill={BRAND_DK} fontWeight={700} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer></ChartWithPlaceholder>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", paddingTop: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 12, height: 12, backgroundColor: "#479BD6", borderRadius: 2 }} />
                      <span style={{ fontSize: 10, color: "#6B7280" }}>Participant Count</span>
                    </div>
                  </div>
                </div>
              </Panel>
              <Panel title="Participant Trend" subtitle="Participation growth over time" info="Annual trend of students placed in internships" filterOptions={["All Years", ...years.map(String)]} filterValue={filterOutcomeYear} onFilterChange={setFilterOutcomeYear}>
                <ChartWithPlaceholder data={participantTrendData} height={250}><ResponsiveContainer width="100%" height={250}>
                  <LineChart data={participantTrendData ?? []} margin={{ top: 6, right: 14, bottom: 0, left: -12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={LIGHT_BORDER} />
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} />
                    <Legend wrapperStyle={{ fontSize: 10 }} iconType="plainline" />
                    <Line type="monotone" dataKey="students" stroke={BRAND} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Participants" />
                  </LineChart>
                </ResponsiveContainer></ChartWithPlaceholder>
              </Panel>
              <Panel title="Inclusion Reach" subtitle="Participant diversity" info="Breakdown across disability and refugee status" filterOptions={["All Years", ...FILTER_YEARS.map(String)]} filterValue={filterOutcomeYear} onFilterChange={setFilterOutcomeYear}>
                <ChartWithPlaceholder data={inclusionBars} height={250}><ResponsiveContainer width="100%" height={250}>
                  <BarChart data={inclusionBars ?? []} margin={{ top: 6, right: 10, bottom: 0, left: -16 }} barCategoryGap="28%">
                    <CartesianGrid vertical={false} stroke={LIGHT_BORDER} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(16, 44, 94, 0.04)" }} />
                    <Bar dataKey="value" fill={BRAND} barSize={46} radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="value" position="top" fontSize={11} fill={BRAND_DK} fontWeight={700} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer></ChartWithPlaceholder>
                <div className="flex items-center justify-center gap-5 text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: BRAND }} /> Count</span>
                </div>
              </Panel>
            </div>
          </section>
        )}

        {show("Partner Organizations") && (
          <section style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ width: 3, height: 16, borderRadius: 999, backgroundColor: BRAND, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: BRAND_DK, lineHeight: 1.2, margin: 0 }}>
                    Partner Organizations
                  </p>
                  <p style={{ fontSize: 11, color: "#6B7280", marginTop: 3, margin: 0 }}>Internship partner distribution and engagement</p>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 24 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              <Panel title="Placements by Organization" subtitle="Distribution across partner organizations" info="Number of placements across different organizations" filterOptions={["All Years", ...years.map(String)]} filterValue={filterSectorYear} onFilterChange={setFilterSectorYear}>
                <ChartWithPlaceholder data={placementBars} height={300}><ResponsiveContainer width="100%" height={300}>
                  <BarChart data={placementBars} layout="vertical" margin={{ top: 6, right: 50, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={LIGHT_BORDER} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#374151", fontWeight: 500 }} axisLine={false} tickLine={false} width={170} />
                                        <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(16, 44, 94, 0.04)" }} />
                    <Bar dataKey="Placements" fill="#479BD6" radius={[0, 4, 4, 0]}>
                      {placementBars.map((d, i) => <Cell key={d.name} fill={hostColor(i)} />)}
                      <LabelList dataKey="Placements" position="right" fontSize={10} fill={BRAND_DK} fontWeight={700} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer></ChartWithPlaceholder>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", paddingTop: 4 }}>
                  {placementBars.map((d, i) => (
                    <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 12, height: 12, backgroundColor: hostColor(i), borderRadius: 2 }} />
                      <span style={{ fontSize: 10, color: "#6B7280" }}>{d.name}</span>
                    </div>
                  ))}
                </div>
              </Panel>
              <Panel title="Departments by Organization" subtitle="Department distribution across partner organizations" info="Number of internship placements by department within each organization" filterOptions={["All Years", ...FILTER_YEARS.map(String)]} filterValue={filterSectorYear} onFilterChange={setFilterSectorYear}>
                <ChartWithPlaceholder data={departmentData.data} height={280}><ResponsiveContainer width="100%" height={280}>
                  <BarChart data={departmentData.data} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 120 }} barCategoryGap="12%">
                    <CartesianGrid horizontal={false} stroke={LIGHT_BORDER} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <YAxis dataKey="organization" type="category" tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip content={<ChartTip hideLabel />} cursor={{ fill: "rgba(20, 48, 107, 0.04)" }} />
                    {departmentData.departments.map((dept, idx) => (
                      <Bar key={dept} dataKey={dept} stackId="a" fill={BRAND_DK} opacity={0.6 + (idx * 0.05)} radius={idx === departmentData.departments.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer></ChartWithPlaceholder>
                <div className="flex items-center justify-center gap-5 text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: BRAND_DK }} /> Departments</span>
                </div>
              </Panel>
            </div>
          </section>
        )}

{show("Employer Feedback") && (
          <section style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ width: 3, height: 16, borderRadius: 999, backgroundColor: BRAND, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: BRAND_DK, lineHeight: 1.2, margin: 0 }}>
                    Employer Feedback
                  </p>
                  <p style={{ fontSize: 11, color: "#6B7280", marginTop: 3, margin: 0 }}>Programme quality and employer assessment</p>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 32 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              <Panel title="Overall Employer Rating" subtitle="Composite employer satisfaction score" info="Average rating across all employer assessment dimensions (0-10 scale)" filterOptions={["All Years", ...FILTER_YEARS.map(String)]} filterValue={filterSectorYear} onFilterChange={setFilterSectorYear}>
                <ChartWithPlaceholder data={overallBars} height={280}><ResponsiveContainer width="100%" height={280}>
                  <BarChart data={overallBars} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 120 }} barCategoryGap="12%">
                    <CartesianGrid horizontal={false} stroke={LIGHT_BORDER} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} domain={[0, 10]} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip content={<ChartTip hideLabel />} cursor={{ fill: "rgba(16, 44, 94, 0.04)" }} />
                    <Bar dataKey="Overall Rating" fill="#479BD6" radius={[0, 4, 4, 0]}>
                      {overallBars.map((d, i) => <Cell key={d.name} fill={hostColor(i)} />)}
                      <LabelList dataKey="Overall Rating" position="right" fontSize={10} fill={BRAND_DK} fontWeight={700} offset={5} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer></ChartWithPlaceholder>
                <div className="flex items-center justify-center gap-5 text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: "#479BD6" }} /> Score (0-10)</span>
                </div>
              </Panel>
              <Panel title="Workplace Skills" subtitle="Employer assessment of core competencies" info="Average employer ratings for student workplace skills (1=Never, 5=Consistently)" filterOptions={["All Years", ...FILTER_YEARS.map(String)]} filterValue={filterSectorYear} onFilterChange={setFilterSectorYear}>
                <ChartWithPlaceholder data={skillsBars} height={280}><ResponsiveContainer width="100%" height={280}>
                  <BarChart data={skillsBars} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 120 }} barCategoryGap="12%">
                    <CartesianGrid horizontal={false} stroke={LIGHT_BORDER} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} domain={[0, 10]} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip content={<ChartTip hideLabel />} cursor={{ fill: "rgba(16, 44, 94, 0.04)" }} />
                    <Bar dataKey="Skills Rating" fill="#14306B" radius={[0, 4, 4, 0]}>
                      {skillsBars.map((d, i) => <Cell key={d.name} fill={hostColor(i)} />)}
                      <LabelList dataKey="Skills Rating" position="right" fontSize={10} fill={BRAND_DK} fontWeight={700} offset={5} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer></ChartWithPlaceholder>
                <div className="flex items-center justify-center gap-5 text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: "#14306B" }} /> Score (0-10)</span>
                </div>
              </Panel>
              <Panel title="Health Sector Readiness" subtitle="Understanding and application of health context" info="Average employer ratings on health systems understanding and practical application (1=Not at all, 5=Extremely)" filterOptions={["All Years", ...FILTER_YEARS.map(String)]} filterValue={filterSectorYear} onFilterChange={setFilterSectorYear}>
                <ChartWithPlaceholder data={healthBars} height={280}><ResponsiveContainer width="100%" height={280}>
                  <BarChart data={healthBars} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 120 }} barCategoryGap="12%" barGap={2}>
                    <CartesianGrid horizontal={false} stroke={LIGHT_BORDER} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} domain={[0, 5]} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip content={<ChartTip hideLabel />} cursor={{ fill: "rgba(16, 44, 94, 0.04)" }} />
                    <Legend wrapperStyle={{ fontSize: 9, paddingTop: 12 }} />
                    <Bar dataKey="Systems Understanding" fill="#0F6E56" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Practical Application" fill="#6BBE9C" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer></ChartWithPlaceholder>
              </Panel>
              <Panel title="Employer Recommendation & Hiring" subtitle="Likelihood to recommend ALU and hire graduates" info="Employer likelihood to recommend ALU students (0-10 scale) and hire graduates" filterOptions={["All Years", ...FILTER_YEARS.map(String)]} filterValue={filterSectorYear} onFilterChange={setFilterSectorYear}>
                <ChartWithPlaceholder data={recommendBars} height={280}><ResponsiveContainer width="100%" height={280}>
                  <BarChart data={recommendBars} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 120 }} barCategoryGap="12%" barGap={2}>
                    <CartesianGrid horizontal={false} stroke={LIGHT_BORDER} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} domain={[0, 10]} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip content={<ChartTip hideLabel />} cursor={{ fill: "rgba(16, 44, 94, 0.04)" }} />
                    <Legend wrapperStyle={{ fontSize: 9, paddingTop: 12 }} />
                    <Bar dataKey="Recommend ALU" fill="#D45F2C" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Likely to Hire" fill="#F5A76D" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer></ChartWithPlaceholder>
              </Panel>
            </div>
          </section>
        )}

        {show("Student Feedback") && (
          <section style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ width: 3, height: 16, borderRadius: 999, backgroundColor: BRAND, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: BRAND_DK, lineHeight: 1.2, margin: 0 }}>
                    Student Feedback
                  </p>
                  <p style={{ fontSize: 11, color: "#6B7280", marginTop: 3, margin: 0 }}>Student perception and placement outcomes</p>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 32 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              <Panel title="Internship Quality & Relevance" subtitle="Student perception of internship experience" info="Average student ratings for quality, relevance, clarity, support, and usefulness (1-5 scale)" filterOptions={["All Years", ...FILTER_YEARS.map(String)]} filterValue={filterSectorYear} onFilterChange={setFilterSectorYear}>
                <ChartWithPlaceholder data={hasData ? true : null} height={240}><ResponsiveContainer width="100%" height={240}>
                  <BarChart data={[]} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 190 }} barCategoryGap="12%">
                    <CartesianGrid horizontal={false} stroke={LIGHT_BORDER} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} domain={[0, 5]} axisLine={false} tickLine={false} />
                    <YAxis dataKey="dimension" type="category" tick={{ fontSize: 10, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} width={180} />
                    <Tooltip content={<ChartTip hideLabel />} cursor={{ fill: "rgba(16, 44, 94, 0.04)" }} />
                    <Bar dataKey="score" fill="#7FA5D6" radius={[0, 4, 4, 0]}>
                      <LabelList dataKey="score" position="right" fontSize={10} fill={BRAND_DK} fontWeight={700} offset={5} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer></ChartWithPlaceholder>
                <div className="flex items-center justify-center gap-5 text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: "#7FA5D6" }} /> Score</span>
                </div>
              </Panel>
              <Panel title="Placement After Internship" subtitle="Job placement outcomes by organization" info="Number of interns who secured positions following internship completion" filterOptions={["All Years", ...FILTER_YEARS.map(String)]} filterValue={filterSectorYear} onFilterChange={setFilterSectorYear}>
                <ChartWithPlaceholder data={placementAfterBars} height={280}><ResponsiveContainer width="100%" height={280}>
                  <BarChart data={placementAfterBars} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 120 }} barCategoryGap="12%" barGap={2}>
                    <CartesianGrid horizontal={false} stroke={LIGHT_BORDER} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip content={<ChartTip hideLabel />} cursor={{ fill: "rgba(16, 44, 94, 0.04)" }} />
                    <Legend wrapperStyle={{ fontSize: 9, paddingTop: 12 }} />
                    <Bar dataKey="Placements" fill="#10B981" radius={[0, 4, 4, 0]}>
                      <LabelList dataKey="Placements" position="right" fontSize={9} fill={BRAND_DK} fontWeight={700} offset={5} />
                    </Bar>
                    <Bar dataKey="Placement %" fill="#6EE7B7" radius={[0, 4, 4, 0]}>
                      <LabelList dataKey="Placement %" position="right" fontSize={9} fill={BRAND_DK} fontWeight={700} offset={5} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer></ChartWithPlaceholder>
              </Panel>
              <Panel title="Learning & Skill Application" subtitle="Student-perceived capability growth" info="Average student rating of ability to apply skills to real-world health challenges (1-5 scale)" filterOptions={["All Years", ...FILTER_YEARS.map(String)]} filterValue={filterSectorYear} onFilterChange={setFilterSectorYear}>
                <ChartWithPlaceholder data={learningBars} height={200}><ResponsiveContainer width="100%" height={200}>
                  <BarChart data={learningBars} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 120 }} barCategoryGap="12%">
                    <CartesianGrid horizontal={false} stroke={LIGHT_BORDER} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} domain={[0, 5]} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip content={<ChartTip hideLabel />} cursor={{ fill: "rgba(16, 44, 94, 0.04)" }} />
                    <Bar dataKey="Real-World Application" fill="#1D9E75" radius={[0, 4, 4, 0]}>
                      {learningBars.map((d, i) => <Cell key={d.name} fill={hostColor(i)} />)}
                      <LabelList dataKey="Real-World Application" position="right" fontSize={10} fill={BRAND_DK} fontWeight={700} offset={5} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer></ChartWithPlaceholder>
                <div className="flex items-center justify-center gap-5 text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: "#1D9E75" }} /> Real-World Application</span>
                </div>
              </Panel>
              <Panel title="Intern Recommendation" subtitle="Student recommendation likelihood" info="Average student recommendation score (0-10 scale)" filterOptions={["All Years", ...FILTER_YEARS.map(String)]} filterValue={filterSectorYear} onFilterChange={setFilterSectorYear}>
                <ChartWithPlaceholder data={internRecBars} height={280}><ResponsiveContainer width="100%" height={280}>
                  <BarChart data={internRecBars} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 120 }} barCategoryGap="12%">
                    <CartesianGrid horizontal={false} stroke={LIGHT_BORDER} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} domain={[0, 10]} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip content={<ChartTip hideLabel />} cursor={{ fill: "rgba(16, 44, 94, 0.04)" }} />
                    <Bar dataKey="Recommendation" fill="#479BD6" radius={[0, 4, 4, 0]}>
                      {internRecBars.map((d, i) => <Cell key={d.name} fill={hostColor(i)} />)}
                      <LabelList dataKey="Recommendation" position="right" fontSize={10} fill={BRAND_DK} fontWeight={700} offset={5} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer></ChartWithPlaceholder>
                <div className="flex items-center justify-center gap-5 text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: "#479BD6" }} /> Score (0-10)</span>
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
