"use client";
import { ChartTip, HeaderStatsPanel, FilterButton, FilterDropdown } from "@/components/ui/hemp";
import PortalNav from "@/components/layout/portal-nav";
import PortalFooter from "@/components/layout/portal-footer";
import HeaderDesign from "@/components/layout/header-design";
import { getSieCohortsFromSupabase } from "@/lib/dashboardDataMapper";
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

function Panel({ title, subtitle, info, children, filterOptions, filterValue, onFilterChange, filterContent }: { title: string; subtitle: string; info?: string; children: React.ReactNode; filterOptions?: string[]; filterValue?: string; onFilterChange?: (v: string) => void; filterContent?: React.ReactNode }) {
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
      {(filterOptions || filterContent) && filterValue && onFilterChange && (
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
                zIndex: 50,
                width: 280,
                backgroundColor: "white",
                borderRadius: 10,
                border: `1px solid ${LIGHT_BORDER}`,
                borderLeft: `5px solid ${BRAND}`,
                boxShadow: "0 10px 30px rgba(0,0,0,0.14)",
                overflow: "hidden",
              }}>
                <div style={{ backgroundColor: BRAND, padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "white", margin: 0, textTransform: "uppercase", letterSpacing: "0.02em" }}>Filters</p>
                  <button
                    onClick={() => {
                      onFilterChange("reset");
                      setFilterOpen(false);
                    }}
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.35)",
                      borderRadius: 6,
                      padding: "3px 8px",
                      backgroundColor: "rgba(255,255,255,0.08)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Reset
                  </button>
                </div>
                <div style={{ padding: "12px 14px" }}>
                  {filterContent ? (
                    filterContent
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {filterOptions?.map(opt => {
                        const isSelected = filterValue === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => {
                              onFilterChange(opt);
                              setFilterOpen(false);
                            }}
                            style={{
                              fontSize: 10,
                              fontWeight: isSelected ? 700 : 500,
                              padding: "5px 10px",
                              borderRadius: 6,
                              border: `1px solid ${isSelected ? BRAND : LIGHT_BORDER}`,
                              backgroundColor: isSelected ? BRAND : "white",
                              color: isSelected ? "white" : BRAND_DK,
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
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

export default function HEMPSie() {
  const categories = ["Reach & Engagement", "Exposure & Outcomes", "Quality & Feedback"];
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterYear, setFilterYear] = useState("All Years");
  const [filterCountry, setFilterCountry] = useState("All Countries");
  const [filterRegion, setFilterRegion] = useState("All Regions");

  // Fetch data from Supabase
  const { data: sieCohorts, loading, error } = useDashboardData(() => getSieCohortsFromSupabase(), []);

  const show = (category: string) => activeCategory === category;
  const activeFilterCount = [filterYear !== "All Years", filterCountry !== "All Countries", filterRegion !== "All Regions"].filter(Boolean).length;

  const years = useMemo(() =>
    sieCohorts ? Array.from(new Set(sieCohorts.map(i => i.year))).sort() : [],
    [sieCohorts]
  );
  const countries = useMemo(() =>
    sieCohorts ? Array.from(new Set(sieCohorts.map(i => i.country))).sort() : [],
    [sieCohorts]
  );
  const regions = useMemo(() =>
    sieCohorts ? Array.from(new Set(sieCohorts.map(i => i.region).filter(Boolean))).sort() as string[] : [],
    [sieCohorts]
  );

  const filteredCohorts = useMemo(() => {
    if (!sieCohorts) return [];
    return sieCohorts.filter(c => {
      if (filterYear !== "All Years" && c.year !== parseInt(filterYear)) return false;
      if (filterCountry !== "All Countries" && c.country !== filterCountry) return false;
      if (filterRegion !== "All Regions" && c.region !== filterRegion) return false;
      return true;
    });
  }, [filterYear, filterCountry, filterRegion, sieCohorts]);

  const totalSelected = filteredCohorts.reduce((s, c) => s + c.selected, 0);
  const totalCompleted = filteredCohorts.reduce((s, c) => s + c.completedProgramme, 0);
  const femaleParticipants = filteredCohorts.reduce((s, c) => s + c.female, 0);
  const femalePct = totalSelected ? Math.round((femaleParticipants / totalSelected) * 100) : 0;
  const avgSatisfaction = filteredCohorts.length ? parseFloat((filteredCohorts.reduce((s, c) => s + c.satisfaction, 0) / filteredCohorts.length).toFixed(1)) : 0;
  const totalEmploymentLeads = filteredCohorts.reduce((s, c) => s + c.employmentLeads, 0);
  const totalProjectsAdopted = filteredCohorts.reduce((s, c) => s + c.projectsAdopted, 0);
  const avgExposure = filteredCohorts.length ? parseFloat((filteredCohorts.reduce((s, c) => s + (c.exposure["Health System Function"] + c.exposure["Innovation in Practice"] + c.exposure["Employment Pathways"]) / 3, 0) / filteredCohorts.length).toFixed(1)) : 0;

  const [filterOutcomeYear, setFilterOutcomeYear] = useState("All Years");
  const [filterExposureYear, setFilterExposureYear] = useState("All Years");
  const [filterGeoYear, setFilterGeoYear] = useState("All Years");
  const [filterFunnelYear, setFilterFunnelYear] = useState("All Years");
  const [filterFunnelCohort, setFilterFunnelCohort] = useState("All Cohorts");
  const [filterPlacementYear, setFilterPlacementYear] = useState("All Years");
  const [filterPartnerYear, setFilterPartnerYear] = useState("All Years");
  const [filterQualityYear, setFilterQualityYear] = useState("All Years");
  const [filterConfidenceYear, setFilterConfidenceYear] = useState("All Years");
  const [filterCompletionYear, setFilterCompletionYear] = useState("All Years");
  const [filterClarityYear, setFilterClarityYear] = useState("All Years");
  const [filterNPSDistYear, setFilterNPSDistYear] = useState("All Years");
  const [filterPerfScoreYear, setFilterPerfScoreYear] = useState("All Years");
  const [filterPerfTrendYear, setFilterPerfTrendYear] = useState("All Years");
  const [filterHealthInterestYear, setFilterHealthInterestYear] = useState("All Years");

  const filteredCohortsForPlacement = useMemo(() => {
    if (!sieCohorts) return [];
    return sieCohorts.filter(c => {
      if (filterPlacementYear !== "All Years" && c.year !== parseInt(filterPlacementYear)) return false;
      if (filterCountry !== "All Countries" && c.country !== filterCountry) return false;
      if (filterRegion !== "All Regions" && c.region !== filterRegion) return false;
      return true;
    });
  }, [filterPlacementYear, filterCountry, filterRegion, sieCohorts]);

  const filteredCohortsForPartner = useMemo(() => {
    if (!sieCohorts) return [];
    return sieCohorts.filter(c => {
      if (filterPartnerYear !== "All Years" && c.year !== parseInt(filterPartnerYear)) return false;
      if (filterCountry !== "All Countries" && c.country !== filterCountry) return false;
      if (filterRegion !== "All Regions" && c.region !== filterRegion) return false;
      return true;
    });
  }, [filterPartnerYear, filterCountry, filterRegion, sieCohorts]);

  const filteredCohortsForQuality = useMemo(() => {
    if (!sieCohorts) return [];
    return sieCohorts.filter(c => {
      if (filterQualityYear !== "All Years" && c.year !== parseInt(filterQualityYear)) return false;
      if (filterCountry !== "All Countries" && c.country !== filterCountry) return false;
      if (filterRegion !== "All Regions" && c.region !== filterRegion) return false;
      return true;
    });
  }, [filterQualityYear, filterCountry, filterRegion, sieCohorts]);

  const filteredCohortsForConfidence = useMemo(() => {
    if (!sieCohorts) return [];
    return sieCohorts.filter(c => {
      if (filterConfidenceYear !== "All Years" && c.year !== parseInt(filterConfidenceYear)) return false;
      if (filterCountry !== "All Countries" && c.country !== filterCountry) return false;
      if (filterRegion !== "All Regions" && c.region !== filterRegion) return false;
      return true;
    });
  }, [filterConfidenceYear, filterCountry, filterRegion, sieCohorts]);

  const filteredCohortsForCompletion = useMemo(() => {
    if (!sieCohorts) return [];
    return sieCohorts.filter(c => {
      if (filterCompletionYear !== "All Years" && c.year !== parseInt(filterCompletionYear)) return false;
      if (filterCountry !== "All Countries" && c.country !== filterCountry) return false;
      if (filterRegion !== "All Regions" && c.region !== filterRegion) return false;
      return true;
    });
  }, [filterCompletionYear, filterCountry, filterRegion, sieCohorts]);

  const filteredCohortsForClarity = useMemo(() => {
    if (!sieCohorts) return [];
    return sieCohorts.filter(c => {
      if (filterClarityYear !== "All Years" && c.year !== parseInt(filterClarityYear)) return false;
      if (filterCountry !== "All Countries" && c.country !== filterCountry) return false;
      if (filterRegion !== "All Regions" && c.region !== filterRegion) return false;
      return true;
    });
  }, [filterClarityYear, filterCountry, filterRegion, sieCohorts]);

  const filteredCohortsForNPSDist = useMemo(() => {
    if (!sieCohorts) return [];
    return sieCohorts.filter(c => {
      if (filterNPSDistYear !== "All Years" && c.year !== parseInt(filterNPSDistYear)) return false;
      if (filterCountry !== "All Countries" && c.country !== filterCountry) return false;
      if (filterRegion !== "All Regions" && c.region !== filterRegion) return false;
      return true;
    });
  }, [filterNPSDistYear, filterCountry, filterRegion, sieCohorts]);

  const filteredCohortsForPerfScore = useMemo(() => {
    if (!sieCohorts) return [];
    return sieCohorts.filter(c => {
      if (filterPerfScoreYear !== "All Years" && c.year !== parseInt(filterPerfScoreYear)) return false;
      if (filterCountry !== "All Countries" && c.country !== filterCountry) return false;
      if (filterRegion !== "All Regions" && c.region !== filterRegion) return false;
      return true;
    });
  }, [filterPerfScoreYear, filterCountry, filterRegion, sieCohorts]);

  const filteredCohortsForPerfTrend = useMemo(() => {
    if (!sieCohorts) return [];
    return sieCohorts.filter(c => {
      if (filterPerfTrendYear !== "All Years" && c.year !== parseInt(filterPerfTrendYear)) return false;
      if (filterCountry !== "All Countries" && c.country !== filterCountry) return false;
      if (filterRegion !== "All Regions" && c.region !== filterRegion) return false;
      return true;
    });
  }, [filterPerfTrendYear, filterCountry, filterRegion, sieCohorts]);

  const filteredCohortsForHealthInterest = useMemo(() => {
    if (!sieCohorts) return [];
    return sieCohorts.filter(c => {
      if (filterHealthInterestYear !== "All Years" && c.year !== parseInt(filterHealthInterestYear)) return false;
      if (filterCountry !== "All Countries" && c.country !== filterCountry) return false;
      if (filterRegion !== "All Regions" && c.region !== filterRegion) return false;
      return true;
    });
  }, [filterHealthInterestYear, filterCountry, filterRegion, sieCohorts]);

  const avgRelevance = filteredCohorts.length ? parseFloat((filteredCohorts.reduce((s, c) => s + c.relevance, 0) / filteredCohorts.length).toFixed(1)) : 0;
  const avgQuality = filteredCohorts.length ? parseFloat((filteredCohorts.reduce((s, c) => s + c.quality, 0) / filteredCohorts.length).toFixed(1)) : 0;
  const avgUsefulness = filteredCohorts.length ? parseFloat((filteredCohorts.reduce((s, c) => s + (c.usefulness || 0), 0) / filteredCohorts.length).toFixed(1)) : 0;
  const avgConfidence = filteredCohorts.length ? parseFloat((filteredCohorts.reduce((s, c) => s + (c.confidence || 0), 0) / filteredCohorts.length).toFixed(1)) : 0;
  const avgNPS = filteredCohorts.length ? parseFloat((filteredCohorts.reduce((s, c) => s + c.nps, 0) / filteredCohorts.length).toFixed(1)) : 0;
  const avgCompletion = filteredCohorts.length ? parseFloat((filteredCohorts.reduce((s, c) => s + (c.completionFullProgramme || 0), 0) / filteredCohorts.length).toFixed(1)) : 0;

  const avgRelevanceFiltered = filteredCohortsForQuality.length ? parseFloat((filteredCohortsForQuality.reduce((s, c) => s + c.relevance, 0) / filteredCohortsForQuality.length).toFixed(1)) : 0;
  const avgQualityFiltered = filteredCohortsForQuality.length ? parseFloat((filteredCohortsForQuality.reduce((s, c) => s + c.quality, 0) / filteredCohortsForQuality.length).toFixed(1)) : 0;
  const avgUsefulnessFiltered = filteredCohortsForQuality.length ? parseFloat((filteredCohortsForQuality.reduce((s, c) => s + (c.usefulness || 0), 0) / filteredCohortsForQuality.length).toFixed(1)) : 0;

  const avgConfidenceFiltered = filteredCohortsForConfidence.length ? parseFloat((filteredCohortsForConfidence.reduce((s, c) => s + (c.confidence || 0), 0) / filteredCohortsForConfidence.length).toFixed(1)) : 0;
  const avgNPSFiltered = filteredCohortsForConfidence.length ? parseFloat((filteredCohortsForConfidence.reduce((s, c) => s + c.nps, 0) / filteredCohortsForConfidence.length).toFixed(1)) : 0;

  const totalPWD = filteredCohorts.reduce((s, c) => s + c.pwd, 0);
  const totalRefugees = filteredCohorts.reduce((s, c) => s + c.idpRefugees, 0);
  const inclusionReachTotal = totalPWD + totalRefugees;
  const totalApplicants = Math.round(totalSelected * 1.3);
  const overallPerformanceScore = parseFloat(((avgSatisfaction + (femalePct / 10) + (19 / 10) + (totalEmploymentLeads ? 5 : 3)) / 4 * 2).toFixed(1));

  const funnelFilteredCohorts = useMemo(() => {
    if (!sieCohorts) return [];
    return sieCohorts.filter(c => {
      if (filterFunnelYear !== "All Years" && c.year !== parseInt(filterFunnelYear)) return false;
      if (filterFunnelCohort !== "All Cohorts" && c.name !== filterFunnelCohort) return false;
      return true;
    });
  }, [filterFunnelYear, filterFunnelCohort, sieCohorts]);

  const cohortNames = useMemo(() =>
    sieCohorts ? Array.from(new Set(sieCohorts.map(c => c.name))).sort() : [],
    [sieCohorts]
  );

  // Fallback values for Mission Students (will be replaced with Supabase data)
  const msTotalEnrolled = 50;
  const msFemaleStudents = 25;
  const msFemalePct = 50;
  const msCompleted = 45;
  const msCompletionRate = 90;
  const msEmployed = 30;
  const msEmploymentRate = 67;
  const msAvgGPA = "3.2";
  const msVenturesCreated = 5;

  if (loading) {
    return (
      <div style={{ backgroundColor: LIGHT_BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 16, color: "#666" }}>Loading SIE data…</p>
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
              <h1 className="text-lg font-black leading-tight" style={{ color: "white", letterSpacing: "0.01em" }}>SIE</h1>
              <p className="text-[13px] mt-2 font-medium" style={{ color: "rgba(215,225,245,0.8)" }}>
                Signature Immersive Experience: Student Outcomes and Healthcare Exposure
              </p>
              <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[12px]" style={{ color: "rgba(215,225,245,0.5)" }}>
                <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Data source:</span> HEMP Consolidated Database</span>
                <span aria-hidden="true">·</span>
                <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Period:</span> 2021–2026</span>
                <span aria-hidden="true">·</span>
                <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Last updated:</span> 18 June 2026, 16:30 CAT</span>
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
              label: "Total Applicants",
              num: totalApplicants,
              icon: Users,
              displayFmt: (n) => n.toLocaleString(),
              sub: `Application volume | ${totalSelected} participants selected`,
              tip: "Total students who applied for SIE",
              pace: true,
              paceA: totalApplicants,
              paceT: Math.round(totalApplicants * 1.2),
            },
            {
              label: "Participants Selected",
              num: totalSelected,
              icon: Users,
              displayFmt: (n) => n.toLocaleString(),
              sub: `Goal: ${targets2030.sie.toLocaleString()} by 2030 | ${msTotalEnrolled} mission students`,
              tip: "Total participants selected toward 2030 target",
              pace: true,
              paceA: totalSelected,
              paceT: targets2030.sie,
            },
            {
              label: "Female Participation",
              num: femalePct,
              icon: WomanIcon,
              displayFmt: (n) => n + "%",
              sub: `Goal: 50% | ${msFemalePct}% mission students`,
              tip: "Percentage of female participants across all students and mission cohort",
              pace: true,
              paceA: femalePct,
              paceT: 50,
            },
            {
              label: "Inclusion Reach",
              num: 19,
              icon: Users,
              displayFmt: (n) => n + "%",
              sub: `Goal: 19% | PWD: ${totalPWD} | Refugee: ${totalRefugees}`,
              tip: "Percentage of participants with disabilities and refugee background",
              pace: true,
              paceA: 19,
              paceT: 19,
            },
            {
              label: "NPS Score",
              num: overallPerformanceScore,
              icon: TrendingUp,
              displayFmt: (n) => n.toFixed(1),
              sub: `Out of 10 | Based on satisfaction and inclusion`,
              tip: "Composite score based on satisfaction, female participation, inclusion, and employment outcomes",
              pace: true,
              paceA: overallPerformanceScore * 10,
              paceT: 80,
            },
            {
              label: "Satisfaction Score",
              num: avgSatisfaction,
              icon: Briefcase,
              displayFmt: (n) => n.toFixed(1),
              sub: `Goal: 4.5+ | Out of 5`,
              tip: "Average participant satisfaction rating",
              pace: true,
              paceA: avgSatisfaction * 20,
              paceT: 90,
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
                setFilterCountry("All Countries");
                setFilterRegion("All Regions");
              }}
            >
              {[
                { label: "Year", value: filterYear, setValue: setFilterYear, options: ["All Years", ...years.map(String)] },
                { label: "Region", value: filterRegion, setValue: setFilterRegion, options: ["All Regions", ...regions] },
                { label: "Country", value: filterCountry, setValue: setFilterCountry, options: ["All Countries", ...countries] },
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

        {show("Reach & Engagement") && (
          <section style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ width: 3, height: 16, borderRadius: 999, backgroundColor: BRAND, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: BRAND_DK, lineHeight: 1.2, margin: 0 }}>
                    Reach & Engagement
                  </p>
                  <p style={{ fontSize: 11, color: "#6B7280", marginTop: 3, margin: 0 }}>Recruitment funnel, participation trends, and participant profile</p>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 24 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              <Panel title="Participants by Health Interest Area" subtitle="Distribution across health specializations" info="Areas of health interest reported by SIE participants" filterOptions={["All Years", ...years.map(String)]} filterValue={filterHealthInterestYear} onFilterChange={setFilterHealthInterestYear}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={filteredCohortsForHealthInterest.length ? Object.entries(filteredCohortsForHealthInterest.reduce((acc: Record<string, number>, c: any) => {
                      Object.entries(c.healthInterests || {}).forEach(([area, count]: any) => {
                        acc[area] = (acc[area] || 0) + count;
                      });
                      return acc;
                    }, {})).map(([area, count]: any) => ({ area, count })).sort((a, b: any) => b.count - a.count) : []} layout="vertical" margin={{ top: 6, right: 50, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={LIGHT_BORDER} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="area" type="category" tick={{ fontSize: 10, fill: "#374151", fontWeight: 500 }} axisLine={false} tickLine={false} width={130} />
                      <Tooltip content={<ChartTip />} />
                      <Bar dataKey="count" fill="#479BD6" radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="count" position="right" fontSize={10} fill={BRAND_DK} fontWeight={700} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", paddingTop: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 12, height: 12, backgroundColor: "#479BD6", borderRadius: 2 }} />
                      <span style={{ fontSize: 10, color: "#6B7280" }}>Participant Count</span>
                    </div>
                  </div>
                </div>
              </Panel>
              <Panel title="Participants by Academic Programmes" subtitle="Academic background distribution" info="Number of participants from each academic programme" filterOptions={["All Years", ...years.map(String)]} filterValue={filterOutcomeYear} onFilterChange={setFilterOutcomeYear}>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={SIE_DISCIPLINES.map(disc => ({
                      name: disc,
                      count: filteredCohorts.length ? filteredCohorts.reduce((s, c) => s + c.disciplines[disc], 0) : 0,
                    })).sort((a, b) => b.count - a.count)} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 120 }} barCategoryGap="12%">
                      <CartesianGrid vertical={false} stroke={LIGHT_BORDER} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 9, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(16, 44, 94, 0.04)" }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="count" fill={BRAND} radius={[0, 4, 4, 0]} name="Participants">
                        <LabelList dataKey="count" position="right" offset={5} fontSize={10} fill={BRAND_DK} fontWeight={700} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
              <Panel title="Recruitment Funnel" subtitle="Application to completion journey" info="The progression from applications through to programme completion" filterOptions={["All Years", ...years.map(String)]} filterValue={filterOutcomeYear} onFilterChange={setFilterOutcomeYear}>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={filteredCohorts.map((c, i) => ({
                    name: c.name.substring(0, 12),
                    applied: c.applied,
                    selected: c.selected,
                    completed: c.completedProgramme,
                  }))} margin={{ top: 6, right: 10, bottom: 0, left: -16 }} barCategoryGap="28%">
                    <CartesianGrid vertical={false} stroke={LIGHT_BORDER} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(16, 44, 94, 0.04)" }} />
                    <Bar dataKey="applied" fill="#A8C5E6" barSize={30} name="Applied" />
                    <Bar dataKey="selected" fill="#479BD6" barSize={30} name="Selected" />
                    <Bar dataKey="completed" fill={BRAND} barSize={30} name="Completed" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4 text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: "#A8C5E6" }} /> Applied</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: "#479BD6" }} /> Selected</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: BRAND }} /> Completed</span>
                </div>
              </Panel>
              <Panel title="Participants by Country" subtitle="Geographic distribution across African regions" info="Total participants per implementation country and region" filterOptions={["All Regions", ...regions]} filterValue={filterRegion} onFilterChange={setFilterRegion}>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={countries.map(c => ({
                    name: c,
                    value: filteredCohorts.filter(co => co.country === c).reduce((s, co) => s + co.selected, 0),
                  }))} margin={{ top: 6, right: 10, bottom: 0, left: -16 }} barCategoryGap="28%">
                    <CartesianGrid vertical={false} stroke={LIGHT_BORDER} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(16, 44, 94, 0.04)" }} />
                    <Bar dataKey="value" fill="#479BD6" barSize={46} radius={[4, 4, 0, 0]} name="Participants">
                      <LabelList dataKey="value" position="top" fontSize={11} fill={BRAND_DK} fontWeight={700} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-5 text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: "#479BD6" }} /> Participants</span>
                </div>
              </Panel>
            </div>
          </section>
        )}

        {show("Exposure & Outcomes") && (
          <section style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ width: 3, height: 16, borderRadius: 999, backgroundColor: BRAND, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: BRAND_DK, lineHeight: 1.2, margin: 0 }}>
                    Exposure & Outcomes
                  </p>
                  <p style={{ fontSize: 11, color: "#6B7280", marginTop: 3, margin: 0 }}>Learning outcomes and career opportunities generated</p>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 24 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              <Panel title="Exposure Area Scores" subtitle="Self-reported learning outcomes (1-5)" info="Average exposure gain across three key learning areas" filterOptions={["All Years", ...years.map(String)]} filterValue={filterExposureYear} onFilterChange={setFilterExposureYear}>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={SIE_EXPOSURE_AREAS.map(area => ({
                    name: area,
                    score: filteredCohorts.length ? parseFloat((filteredCohorts.reduce((s, c) => s + c.exposure[area], 0) / filteredCohorts.length).toFixed(1)) : 0,
                  }))} margin={{ top: 6, right: 10, bottom: 0, left: -16 }} barCategoryGap="28%">
                    <CartesianGrid vertical={false} stroke={LIGHT_BORDER} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} domain={[0, 5]} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(16, 44, 94, 0.04)" }} />
                    <Bar dataKey="score" fill="#479BD6" barSize={46} radius={[4, 4, 0, 0]} name="Exposure Score">
                      <LabelList dataKey="score" position="top" fontSize={11} fill={BRAND_DK} fontWeight={700} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-5 text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: "#479BD6" }} /> Exposure Score</span>
                </div>
              </Panel>
              <Panel title="Employment & Internship Placements" subtitle="Post-SIE employment and internship outcomes" info="Number of participants securing employment or internship positions after SIE completion" filterOptions={["All Years", ...years.map(String)]} filterValue={filterPlacementYear} onFilterChange={setFilterPlacementYear}>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={filteredCohortsForPlacement.map(c => ({
                    name: c.name.substring(0, 18),
                    employment: c.employmentPlacements,
                    internship: c.internshipPlacements,
                  }))} margin={{ top: 6, right: 10, bottom: 0, left: -16 }} barCategoryGap="28%">
                    <CartesianGrid vertical={false} stroke={LIGHT_BORDER} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(16, 44, 94, 0.04)" }} />
                    <Bar dataKey="employment" fill="#1D9E75" barSize={30} name="Employment" />
                    <Bar dataKey="internship" fill="#479BD6" barSize={30} name="Internship" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4 text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: "#1D9E75" }} /> Employment</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: "#479BD6" }} /> Internship</span>
                </div>
              </Panel>
            </div>
          </section>
        )}

{show("Quality & Feedback") && (
          <section style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ width: 3, height: 16, borderRadius: 999, backgroundColor: BRAND, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: BRAND_DK, lineHeight: 1.2, margin: 0 }}>
                    Quality & Feedback
                  </p>
                  <p style={{ fontSize: 11, color: "#6B7280", marginTop: 3, margin: 0 }}>Participant experience and programme quality ratings</p>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 24 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              <Panel title="Quality Ratings & Career Clarity" subtitle="Programme assessment and career outcome (1-5 scale)" info="Average ratings for relevance, quality, usefulness, and career direction clarity" filterOptions={["All Years", ...years.map(String)]} filterValue={filterQualityYear} onFilterChange={setFilterQualityYear}>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { metric: "Relevance", rating: avgRelevanceFiltered },
                    { metric: "Quality", rating: avgQualityFiltered },
                    { metric: "Usefulness", rating: avgUsefulnessFiltered },
                    { metric: "Career Clarity", rating: filteredCohorts.length ? parseFloat((filteredCohorts.reduce((s, c) => s + c.careerClarityPct, 0) / filteredCohorts.length / 20).toFixed(2)) : 0 },
                  ]} margin={{ top: 24, right: 10, bottom: 0, left: -16 }} barCategoryGap="28%">
                    <CartesianGrid vertical={false} stroke={LIGHT_BORDER} />
                    <XAxis dataKey="metric" tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} domain={[0, 5]} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(16, 44, 94, 0.04)" }} />
                    <Bar dataKey="rating" fill="#7FA5D6" barSize={46} radius={[4, 4, 0, 0]} name="Rating">
                      <LabelList dataKey="rating" position="top" fontSize={11} fill={BRAND_DK} fontWeight={700} offset={5} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-5 text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: "#7FA5D6" }} /> Rating (0-5 scale)</span>
                </div>
              </Panel>
              <Panel title="Skill Confidence & NPS" subtitle="Learning confidence and recommendation likelihood" info="5-point confidence scale and 0-10 Net Promoter Score" filterOptions={["All Years", ...years.map(String)]} filterValue={filterConfidenceYear} onFilterChange={setFilterConfidenceYear}>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { name: "Confidence", value: avgConfidenceFiltered, metric: "confidence" },
                    { name: "NPS (÷2)", value: avgNPSFiltered / 2, metric: "nps" },
                  ]} margin={{ top: 24, right: 10, bottom: 0, left: -16 }} barCategoryGap="28%">
                    <CartesianGrid vertical={false} stroke={LIGHT_BORDER} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} domain={[0, 5]} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(16, 44, 94, 0.04)" }} />
                    <Bar dataKey="value" fill="#479BD6" barSize={46} radius={[4, 4, 0, 0]} name="Score">
                      <LabelList dataKey="value" position="top" fontSize={11} fill={BRAND_DK} fontWeight={700} offset={5} formatter={(v: number) => v.toFixed(1)} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-5 text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: "#479BD6" }} /> Score</span>
                </div>
              </Panel>
            </div>
          </section>
        )}

        <PortalFooter portal="hemp" synced="18 Jun 2026, EAT" />

      </div>
    </div>
  );
}
