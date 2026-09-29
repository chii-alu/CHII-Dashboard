"use client";
import { FilterSelect } from "@/components/ui/executive";

import { useState, useMemo } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList,
} from "recharts";
import {
  Users, Briefcase, Accessibility, Shield, ShieldCheck, Layers,
  Info, Hammer, GraduationCap, Rocket, Globe, SlidersHorizontal, X,
} from "lucide-react";
import {
  YOUTH, VENTURES, PATHWAYS, PROGRAMS, PARTICIPANT_TYPES, GENDERS, COUNTRIES, SECTORS,
  EMPLOYER_TYPES, WORK_CATEGORIES, YEARS, COHORTS, EMPLOYED_PATHWAYS, VENTURE_PATHWAYS,
  type Pathway, type Program, type ParticipantType, type Gender, type Youth,
} from "@/data/executive/youth-in-work";
import FeaturedImpactStory from "@/components/layout/featured-impact-story";
import HeaderDesign from "@/components/layout/header-design";
import StatsKpiCard from "@/components/ui/stat-kpi-card";
import { DonutRing as Donut } from "@/components/charts/donut-chart";

/* ── palette ──────────────────────────────────────────── */
const NAVY = "var(--brand-secondary)";
const BAND = "var(--brand-secondary)";
const TICK = "#D17A86";
const C_BLUE = "#102C5E";
const C_GREEN = "#479BD6";
const C_VIOLET = "#D45F2C";
const C_AMBER = "#A81B2D";

const PROGRAM_COLOR: Record<Program, string> = { HEMP: "#102C5E", HENT: "#A81B2D", HECO: "#D45F2C" };
const GENDER_COLOR: Record<Gender, string> = { Female: "#102C5E", Male: "#479BD6", "Non-binary": "#D45F2C" };
/* gender splits report Female / Male only */
const GENDER_2: Gender[] = ["Female", "Male"];
const PATHWAY_COLOR: Record<string, string> = {
  "Wage Employment": "#102C5E", "Enterprise": "#479BD6", "Freelance": "#D17A86",
};
const OUTCOME_COLOR: Record<string, string> = { Employment: "#102C5E", Internships: "#479BD6", Ventures: "#D17A86" };
const WORKCAT_COLOR: Record<string, string> = {
  "Full-time": "#102C5E", "Part-time": "#479BD6", "Contract": "#D45F2C",
  "Internship": "#E0A458", "Self-employed": "#D17A86", "Enterprise": "#A81B2D",
  "Permanent": "#102C5E", "Freelance": "#479BD6", "Seasonal": "#E0A458",
};
const JOBCAT_COLOR: Record<string, string> = { New: "#102C5E", Additional: "#479BD6", Improved: "#A81B2D" };
/* trend reporting window: 2022 → 2026 */
const TREND_YEARS = [2022, 2023, 2024, 2025, 2026];
const EMPLOYER_PALETTE = ["#102C5E", "#479BD6", "#D17A86", "#E0A458", "#A81B2D"];

/* ── helpers ─────────────────────────────────────────── */
const share = (c: number, t: number) => (t ? Math.round((c / t) * 100) : 0);
const fmt = (n: number) => Math.round(n).toLocaleString();

const isEmployed = (y: Youth) => EMPLOYED_PATHWAYS.includes(y.pathway) || y.participantType === "Venture Employee";
const isInternship = (y: Youth) => y.pathway === "Internship";
const isVenture = (y: Youth) => VENTURE_PATHWAYS.includes(y.pathway);

/* derived work category (jobs-by-category view) */
function workCategory(y: Youth): string | null {
  if (isVenture(y)) return "Enterprise";
  if (isInternship(y)) return "Internship";
  if (y.participantType === "Venture Employee" || isEmployed(y)) {
    if (y.employmentType === "Part-time") return "Part-time";
    if (y.employmentType === "Contract") return "Contract";
    return "Full-time";
  }
  return null;
}
/* derived employment type (quality view) */
function qualityType(y: Youth): string | null {
  if (isVenture(y)) return "Enterprise";
  if (isInternship(y)) return "Internship";
  if (y.participantType === "Venture Employee" || isEmployed(y)) {
    if (y.employmentType === "Part-time") return "Freelance";
    if (y.employmentType === "Contract") return "Contract";
    return y.permanent ? "Permanent" : "Contract";
  }
  return null;
}
const QUALITY_TYPES = ["Permanent", "Contract", "Internship", "Freelance", "Enterprise"];

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

/* ♀ woman / female symbol icon (lucide has no female glyph in this version) */
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

/* white KPI card: blue border, consistent icon, info tooltip */
function WhiteKpi({ Icon, label, value, tooltip }: {
  Icon: React.ComponentType<any>; label: string; value: string; tooltip: string;
}) {
  const [tip, setTip] = useState(false);
  const ACCENT = "#102C5E";
  return (
    <div style={{ backgroundColor: "white", borderRadius: 10, border: `1px solid ${ACCENT}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ width: 38, height: 38, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={21} color={ACCENT} />
      </span>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 22, fontWeight: 800, color: NAVY, lineHeight: 1.05 }}>{value}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
          <span style={{ position: "relative", cursor: "pointer", display: "flex", flexShrink: 0 }}
            onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}>
            <Info size={10} color="var(--text-muted)" />
            {tip && (
              <span style={{ position: "absolute", top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", backgroundColor: "white", color: "var(--brand-secondary)", fontSize: 10, fontWeight: 400, textTransform: "none", letterSpacing: 0, lineHeight: 1.5, padding: "7px 10px", borderRadius: 6, width: 180, boxShadow: "0 4px 12px rgba(0,0,0,0.12)", border: "1px solid #E0ECFF", zIndex: 100, textAlign: "left", pointerEvents: "none" }}>
                {tooltip}
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

/* light section KPI strip card */
function MiniKpi({ Icon, label, value, center }: { Icon: React.ComponentType<any>; label: string; value: string; center?: boolean }) {
  return (
    <div style={{ backgroundColor: "white", borderRadius: 10, border: `1px solid ${C_BLUE}`, padding: "13px 15px", display: "flex",
      flexDirection: center ? "column" : "row", alignItems: "center", justifyContent: "center", gap: center ? 6 : 11, textAlign: center ? "center" : "left" }}>
      <span style={{ width: 36, height: 36, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={20} color={C_BLUE} />
      </span>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 21, fontWeight: 800, color: NAVY, lineHeight: 1.05 }}>{value}</p>
        <p style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 2 }}>{label}</p>
      </div>
    </div>
  );
}

function ChartTip({ active, payload, label, pct }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: "white", border: "1px solid rgba(0,33,71,0.1)", borderRadius: 6, padding: "8px 11px", fontSize: 11, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      {label != null && <p style={{ fontWeight: 700, color: NAVY, marginBottom: 4 }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: "#6B7280", display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: p.color || p.fill, display: "inline-block" }} />
          {p.name}: <b style={{ color: NAVY }}>{fmt(p.value)}{pct ? "%" : ""}</b>
        </p>
      ))}
    </div>
  );
}
const PctTip = (props: any) => <ChartTip {...props} pct />;

/* tooltip for single-series coloured bars: header + coloured swatch + bar name */
function NamedBarTip({ active, payload, header, colorMap }: any) {
  if (!active || !payload?.length) return null;
  const name = payload[0]?.payload?.name;
  const value = payload[0]?.value;
  const color = (colorMap && colorMap[name]) || payload[0]?.color || payload[0]?.fill || "var(--chart-axis)";
  return (
    <div style={{ backgroundColor: "white", border: "1px solid rgba(0,33,71,0.1)", borderRadius: 6, padding: "8px 11px", fontSize: 11, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <p style={{ fontWeight: 700, color: NAVY, marginBottom: 4 }}>{header}</p>
      <p style={{ color: "#6B7280", display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: color, display: "inline-block" }} />
        {name}: <b style={{ color: NAVY }}>{fmt(value)}</b>
      </p>
    </div>
  );
}

const YIW_SECTIONS: { n: number; label: string }[] = [
  { n: 1, label: "Work Pathways" },
  { n: 2, label: "Jobs Created" },
  { n: 3, label: "Inclusion" },
  { n: 4, label: "Quality of Work" },
];

/* ════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════ */
export default function YouthInWorkPage() {
  const [year, setYear] = useState<"all" | number>("all");
  const [program, setProgram] = useState<"all" | Program>("all");
  const [ptype, setPtype] = useState<"all" | ParticipantType>("all");
  const [gender, setGender] = useState<"all" | Gender>("all");
  const [country, setCountry] = useState<string>("all");
  const [cohort, setCohort] = useState<"all" | number>("all");
  const [pathway, setPathway] = useState<"all" | Pathway>("all");
  const [activeSection, setActiveSection] = useState<number>(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const show = (n: number) => activeSection === n;

  const scope = useMemo(() =>
    YOUTH.filter(y => {
      if (year !== "all" && y.year !== year) return false;
      if (program !== "all" && y.program !== program) return false;
      if (ptype !== "all" && y.participantType !== ptype) return false;
      if (gender !== "all" && y.gender !== gender) return false;
      if (country !== "all" && y.country !== country) return false;
      if (cohort !== "all" && y.cohort !== cohort) return false;
      if (pathway !== "all" && y.pathway !== pathway) return false;
      return true;
    }),
  [year, program, ptype, gender, country, cohort, pathway]);

  /* ── Executive snapshot KPIs ───────────────────────── */
  const kpis = useMemo(() => {
    const total = scope.length;
    const employed = scope.filter(isEmployed).length;
    const interns = scope.filter(isInternship).length;
    const founders = scope.filter(isVenture).length;
    const jobsCreated = scope.reduce((s, y) => s + y.jobsCreated, 0);
    return {
      total, employed, interns, founders, jobsCreated,
      femalePct: share(scope.filter(y => y.gender === "Female").length, total),
      africaPct: share(scope.filter(y => y.basedInAfrica).length, total),
    };
  }, [scope]);

  /* ── Section 1: work pathways ──────────────────────── */
  const pathwayDist = useMemo(() => {
    const enterprise = scope.filter(y => isVenture(y)).length;
    const freelance = scope.filter(y => !isVenture(y) && y.employmentType === "Contract").length;
    const wage = scope.filter(y => !isVenture(y) && y.employmentType !== "Contract" && isEmployed(y)).length;
    return [
      { name: "Wage Employment", value: wage },
      { name: "Enterprise", value: enterprise },
      { name: "Freelance", value: freelance },
    ].filter(d => d.value > 0);
  }, [scope]);

  const byProgram = useMemo(() =>
    PROGRAMS.map(p => {
      const rows = scope.filter(y => y.program === p);
      const Employment = rows.filter(isEmployed).length;
      const Internships = rows.filter(isInternship).length;
      const Ventures = rows.filter(isVenture).length;
      return { program: p, Employment, Internships, Ventures, Total: Employment + Internships + Ventures };
    }),
  [scope]);

  const pathwayTrend = useMemo(() =>
    TREND_YEARS.map(yr => {
      const rows = scope.filter(y => y.year === yr);
      return {
        year: yr,
        Employment: rows.filter(isEmployed).length,
        Internships: rows.filter(isInternship).length,
        Ventures: rows.filter(isVenture).length,
        "Further Ed.": rows.filter(y => y.pathway === "Further Education").length,
      };
    }),
  [scope]);

  /* ── Section 2: jobs created ───────────────────────── */
  const jobs = useMemo(() => {
    const primary = scope.filter(y => y.primaryJob).length;
    const secondary = scope.filter(y => y.secondaryJob).length;
    const jobsCreated = scope.reduce((s, y) => s + y.jobsCreated, 0);
    const scopedVentures = program === "all" ? VENTURES : VENTURES.filter(v => v.program === program);
    const youthEmployed = scopedVentures.reduce((s, v) => s + v.studentEmployees + v.alumniEmployees, 0);
    const primaryFemale = scope.filter(y => y.primaryJob && y.gender === "Female").length;
    const secondaryFemale = scope.filter(y => y.secondaryJob && y.gender === "Female").length;
    const primarySecondary = [
      { name: "Primary Jobs", Total: primary, Female: primaryFemale },
      { name: "Secondary Jobs", Total: secondary, Female: secondaryFemale },
    ];
    const byCategory = WORK_CATEGORIES.map(c => ({ name: c, value: scope.filter(y => workCategory(y) === c).length })).filter(d => d.value > 0);
    const createdByProgram = PROGRAMS.map(p => ({ program: p, jobs: scope.filter(y => y.program === p).reduce((s, y) => s + y.jobsCreated, 0) }));

    // SM 5.1 work-change categories (illustrative split of youth in work)
    const inWorkN = scope.filter(y => y.primaryJob || y.secondaryJob).length;
    const newN = Math.round(inWorkN * 0.46);
    const addN = Math.round(inWorkN * 0.30);
    const jobCategories = [
      { name: "New", value: newN },
      { name: "Additional", value: addN },
      { name: "Improved", value: inWorkN - newN - addN },
    ];

    // trends
    const youthTrend = TREND_YEARS.map(yr => {
      const inw = scope.filter(y => y.year === yr && (y.primaryJob || y.secondaryJob));
      return {
        year: yr,
        Total: inw.length,
        Female: inw.filter(y => y.gender === "Female").length,
        PWD: inw.filter(y => y.pwd).length,
        Refugee: inw.filter(y => y.refugee).length,
      };
    });
    const psTrend = TREND_YEARS.map(yr => {
      const rows = scope.filter(y => y.year === yr);
      return { year: yr, Primary: rows.filter(y => y.primaryJob).length, Secondary: rows.filter(y => y.secondaryJob).length };
    });

    return {
      primary, secondary, jobsCreated, youthEmployed, primaryFemale, secondaryFemale,
      primarySecondary, byCategory, createdByProgram, jobCategories, youthTrend, psTrend,
    };
  }, [scope, program]);

  /* ── Section 3: inclusion ──────────────────────────── */
  const inclusion = useMemo(() => {
    const t = scope.length;
    const cards = {
      female: share(scope.filter(y => y.gender === "Female").length, t),
      refugee: share(scope.filter(y => y.refugee).length, t),
      pwd: share(scope.filter(y => y.pwd).length, t),
      scholar: share(scope.filter(y => y.scholar).length, t),
      africa: share(scope.filter(y => y.basedInAfrica).length, t),
    };
    const employed = scope.filter(isEmployed);
    const priorityGroups = [
      { name: "Women", value: employed.filter(y => y.gender === "Female").length },
      { name: "Refugees / IDPs", value: employed.filter(y => y.refugee).length },
      { name: "Persons w/ disability", value: employed.filter(y => y.pwd).length },
    ].sort((a, b) => b.value - a.value);
    const genderByPathway = [
      { name: "Employment", rows: employed },
      { name: "Internships", rows: scope.filter(isInternship) },
      { name: "Enterprise", rows: scope.filter(isVenture) },
    ].map(g => {
      const rec: Record<string, number | string> = { pathway: g.name };
      GENDER_2.forEach(gd => { rec[gd] = share(g.rows.filter(y => y.gender === gd).length, g.rows.length); });
      return rec;
    });
    const africaSplit = [
      { name: "Based in Africa", value: scope.filter(y => y.basedInAfrica).length },
      { name: "Outside Africa", value: scope.filter(y => !y.basedInAfrica).length },
    ];
    const topCountries = COUNTRIES.map(c => {
      const rows = scope.filter(y => y.country === c);
      return {
        name: c === "Diaspora" ? "Diaspora / Outside" : c,
        Female: rows.filter(y => y.gender === "Female").length,
        Male: rows.filter(y => y.gender === "Male").length,
      };
    }).filter(d => d.Female + d.Male > 0).sort((a, b) => (b.Female + b.Male) - (a.Female + a.Male));
    // primary-job holders by priority group
    const primaryRows = scope.filter(y => y.primaryJob);
    const secondaryRows = scope.filter(y => y.secondaryJob);
    const primaryByGroup = [
      { name: "Women", Primary: primaryRows.filter(y => y.gender === "Female").length, Secondary: secondaryRows.filter(y => y.gender === "Female").length },
      { name: "Refugees / displaced", Primary: primaryRows.filter(y => y.refugee).length, Secondary: secondaryRows.filter(y => y.refugee).length },
      { name: "Persons w/ disability", Primary: primaryRows.filter(y => y.pwd).length, Secondary: secondaryRows.filter(y => y.pwd).length },
    ].sort((a, b) => (b.Primary + b.Secondary) - (a.Primary + a.Secondary));
    const femaleShare = [
      { name: "Primary", value: share(primaryRows.filter(y => y.gender === "Female").length, primaryRows.length) },
      { name: "Secondary", value: share(secondaryRows.filter(y => y.gender === "Female").length, secondaryRows.length) },
    ];
    const byProgram = PROGRAMS.map(p => {
      const rows = scope.filter(y => y.program === p);
      return {
        program: p,
        Female: share(rows.filter(y => y.gender === "Female").length, rows.length),
        "Refugee / IDP": share(rows.filter(y => y.refugee).length, rows.length),
        PwD: share(rows.filter(y => y.pwd).length, rows.length),
      };
    });
    const outcomesByPriorityGroup = [
      {
        name: "Women",
        Employment: employed.filter(y => y.gender === "Female").length,
        Internships: scope.filter(y => y.gender === "Female" && isInternship(y)).length,
        Enterprise: scope.filter(y => y.gender === "Female" && isVenture(y)).length,
      },
      {
        name: "Refugees / IDPs",
        Employment: employed.filter(y => y.refugee).length,
        Internships: scope.filter(y => y.refugee && isInternship(y)).length,
        Enterprise: scope.filter(y => y.refugee && isVenture(y)).length,
      },
      {
        name: "Persons w/ disability",
        Employment: employed.filter(y => y.pwd).length,
        Internships: scope.filter(y => y.pwd && isInternship(y)).length,
        Enterprise: scope.filter(y => y.pwd && isVenture(y)).length,
      },
    ];
    return { cards, priorityGroups, genderByPathway, africaSplit, topCountries, byProgram, primaryByGroup, femaleShare, outcomesByPriorityGroup };
  }, [scope]);

  /* ── Section 4: quality of work ────────────────────── */
  const quality = useMemo(() => {
    const working = scope.filter(y => qualityType(y) !== null);
    const empType = QUALITY_TYPES.map(c => ({ name: c, value: scope.filter(y => qualityType(y) === c).length })).filter(d => d.value > 0);
    // dignified-work indicators — same four as the overview's Dignified Work chart.
    const indicators = [
      { name: "Reliable Income", Score: 71 },
      { name: "Sense of Purpose", Score: 88 },
      { name: "Reputation", Score: 84 },
      { name: "Respect in the Workplace", Score: 90 },
    ];
    const accessing = scope.filter(y => y.decentWork).length;
    const dignified = [
      { name: "Accessing dignified work", value: accessing },
      { name: "Progressing toward it", value: working.length - accessing },
    ];
    const beforeAfter = [
      { metric: "Employed", Before: 28, After: share(scope.filter(isEmployed).length, scope.length) },
      { metric: "Decent work", Before: 19, After: share(accessing, working.length) },
      { metric: "Leadership", Before: 8, After: share(working.filter(y => y.leadership).length, working.length) },
    ];
    const sectors = SECTORS.map(s => ({ name: s, value: scope.filter(y => y.primaryJob && y.sector === s).length })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);
    const employers = EMPLOYER_TYPES.map(e => ({ name: e, value: scope.filter(y => y.primaryJob && y.employerType === e).length })).filter(d => d.value > 0);
    return { empType, indicators, dignified, dignifiedTotal: working.length, beforeAfter, sectors, employers };
  }, [scope]);

  const activeCount = [program, ptype, gender, country, cohort, pathway].filter(v => v !== "all").length;
  const reset = () => { setYear("all"); setProgram("all"); setPtype("all"); setGender("all"); setCountry("all"); setCohort("all"); setPathway("all"); };

  return (
    <div style={{ backgroundColor: "var(--bg-page)", minHeight: "100vh" }}>

      {/* ── Header ─────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-2">
      <header style={{ position: "relative", overflow: "hidden", backgroundColor: "var(--brand-primary)", borderRadius: 12, minHeight: 120, display: "flex", alignItems: "center" }}>
        <HeaderDesign />
        <div className="px-4 sm:px-6 py-6" style={{ position: "relative", zIndex: 10, width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <h1 className="text-lg font-black leading-tight" style={{ color: "white", letterSpacing: "0.01em" }}>Youth in Work</h1>
            </div>
            <p className="text-[13px] sm:text-sm mt-2 font-medium" style={{ color: "#85B7EB" }}>How are CHII participants accessing and creating meaningful work?</p>
            <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[12px] sm:text-[13px]" style={{ color: "rgba(181,212,244,0.5)" }}>
              <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Data source:</span> CHII MELA Consolidated Database</span>
              <span aria-hidden="true">·</span>
              <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Period:</span> 2022–2026</span>
              <span aria-hidden="true">·</span>
              <span>{YOUTH.length} youth tracked</span>
              <span aria-hidden="true">·</span>
              <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Last updated:</span> 18 June 2026, 16:30 CAT</span>
            </div>
          </div>
        </div>
      </header>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-7 space-y-10">

        {/* ════ EXECUTIVE SNAPSHOT ════ */}
        <section className="space-y-4">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))", gap: 12 }}>
            <StatsKpiCard label="Participants" num={kpis.total} sub="students + alumni" Icon={Users}
              tooltip="Total youth tracked across the CHII ecosystem." />
            <StatsKpiCard label="In Employment" num={kpis.employed} sub="primary employment" Icon={Briefcase}
              tooltip="Youth in wage employment, including those at supported enterprises." />
            <StatsKpiCard label="In Internships" num={kpis.interns} sub="active internships" Icon={GraduationCap}
              tooltip="Youth currently in internship placements." />
            <StatsKpiCard label="Enterprise" num={kpis.founders} sub="running enterprises" Icon={Rocket}
              tooltip="Participants founding or co-running an enterprise." />
            <StatsKpiCard label="Jobs Created" num={kpis.jobsCreated} sub="by supported enterprises" Icon={Hammer}
              tooltip="Positions created by enterprises CHII participants founded." />
            <StatsKpiCard label="Female" num={kpis.femalePct} displayFmt={(n) => `${Math.round(n)}%`} sub="of participants" Icon={WomanIcon}
              tooltip="Share of female participants." />
            <StatsKpiCard label="Based in Africa" num={kpis.africaPct} displayFmt={(n) => `${Math.round(n)}%`} sub="on the continent" Icon={Globe}
              tooltip="Share of youth currently based in Africa." />
          </div>

          {/* Section pills (left) + compact filters dropdown (right) */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {YIW_SECTIONS.map(({ n, label }) => {
                const on = activeSection === n;
                return (
                  <button key={n} onClick={() => setActiveSection(n)}
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
                  <span style={{ fontSize: 9.5, fontWeight: 800, color: "white", backgroundColor: filtersOpen ? "rgba(255,255,255,0.25)" : C_BLUE, borderRadius: 999, minWidth: 16, height: 16, padding: "0 4px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{activeCount}</span>
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
        </section>

        {/* ════ SECTION 1 — WORK PATHWAYS ════ */}
        {show(1) && (
        <section className="space-y-4">
          <SectionHeader title="Work Pathways" blurb="How are participants progressing into work?" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
            <Panel title="Work Pathway Distribution" subtitle="Where are our youth today?"
              info="The mix of pathways youth follow: wage employment, internships, enterprises, further education, and more.">
              <Donut data={pathwayDist} colors={PATHWAY_COLOR} total={kpis.total} totalLabel="Youth" height={300} legendPercent />
            </Panel>
            <Panel title="Employment Outcomes by Program" subtitle="Employment · Internships · Enterprise across HEMP · HENT · HECO"
              info="Participant counts for each work outcome, stacked within each program.">
              <ResponsiveContainer width="100%" height={270}>
                <BarChart data={byProgram} margin={{ top: 26, right: 12, bottom: 0, left: -12 }} barCategoryGap="40%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" vertical={false} />
                  <XAxis dataKey="program" tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--chart-axis)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {(["Employment", "Internships", "Ventures"] as const).map((k, i) => (
                    <Bar key={k} dataKey={k} name={k === "Ventures" ? "Enterprise" : k} stackId="o" fill={OUTCOME_COLOR[k]} barSize={46} radius={i === 2 ? [4, 4, 0, 0] : undefined}>
                      {i === 2 && <LabelList dataKey="Total" position="top" fontSize={11} fill={NAVY} fontWeight={700} />}
                    </Bar>
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </Panel>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
          <Panel title="Employment Pathway Trend" subtitle="How work pathways change over time"
            info="Annual trajectory of each pathway, by recorded year.">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={pathwayTrend} margin={{ top: 10, right: 16, bottom: 0, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#374151" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--chart-axis)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="Employment" stroke="#102C5E" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Internships" stroke="#479BD6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Ventures" name="Enterprise" stroke="#D17A86" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Further Ed." stroke="#E0A458" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>
          </div>
        </section>
        )}

        {/* ════ SECTION 2 — JOBS CREATED ════ */}
        {show(2) && (
        <section className="space-y-4">
          <SectionHeader title="Jobs Created" blurb="How many work opportunities are being created across the ecosystem, and how is it trending?" />

          {/* Primary & secondary jobs + job categories */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
          <Panel title="Primary &amp; Secondary Jobs" subtitle="Participants by job type"
            info="Participants holding a primary (main) or secondary (additional) job.">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={jobs.primarySecondary} margin={{ top: 18, right: 12, bottom: 0, left: -8 }} barGap={6} barCategoryGap="36%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--chart-axis)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="Total" fill={C_BLUE} barSize={46} radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="Total" position="top" fontSize={10.5} fill={NAVY} fontWeight={700} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Panel>
          <Panel title="Job Categories" subtitle="New · Additional · Improved"
            info="New: first job or re-entry after a break. Additional: a second income source alongside existing work. Improved: better pay, conditions, or advancement.">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={jobs.jobCategories} margin={{ top: 18, right: 12, bottom: 0, left: -10 }} barCategoryGap="34%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--chart-axis)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<NamedBarTip header="Jobs" colorMap={JOBCAT_COLOR} />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                <Bar dataKey="value" name="Youth" barSize={56} radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="value" position="top" fontSize={11} fill={NAVY} fontWeight={700} />
                  {jobs.jobCategories.map(d => <Cell key={d.name} fill={JOBCAT_COLOR[d.name]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 8, justifyContent: "center" }}>
              {jobs.jobCategories.map(d => (
                <span key={d.name} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, color: "#6B7280" }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: JOBCAT_COLOR[d.name] }} />{d.name}
                </span>
              ))}
            </div>
          </Panel>
          </div>

          {/* Trends */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
            <Panel title="Primary & Secondary Jobs Trend" subtitle="Primary vs secondary roles, by year"
              info="How primary and secondary job-holding changes over time.">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={jobs.psTrend} margin={{ top: 10, right: 16, bottom: 0, left: -8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#374151" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--chart-axis)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="Primary" stroke={C_BLUE} strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Secondary" stroke={C_GREEN} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </Panel>
            <Panel title="Youth in Work Trend" subtitle="Participants in work, by year"
              info="Youth holding a primary or secondary job each year, including total, female, PWD, and refugee participants.">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={jobs.youthTrend} margin={{ top: 10, right: 16, bottom: 0, left: -8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#374151" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--chart-axis)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="Total" stroke="#102C5E" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Female" stroke="#479BD6" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="PWD" stroke="#E0A458" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Refugee" stroke="#D45F2C" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </Panel>
          </div>

          {/* Jobs by category + jobs created by program (with legends) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
            <Panel title="Jobs by Category" subtitle="Full-time · Part-time · Seasonal"
              info="Distribution of jobs by employment category type.">
              <Donut data={jobs.byCategory.filter(d => ["Full-time", "Part-time", "Seasonal"].includes(d.name))} colors={WORKCAT_COLOR} total={jobs.byCategory.filter(d => ["Full-time", "Part-time", "Seasonal"].includes(d.name)).reduce((sum, d) => sum + d.value, 0)} totalLabel="Jobs" height={300} legendPercent />
            </Panel>
            <Panel title="Jobs Created by Pillar" subtitle="Positions attributable to each program's enterprises"
              info="Total jobs created by enterprises, grouped by the founder's program.">
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={jobs.createdByProgram} margin={{ top: 16, right: 10, bottom: 0, left: -16 }} barCategoryGap="38%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" vertical={false} />
                  <XAxis dataKey="program" tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--chart-axis)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                  <Bar dataKey="jobs" name="Jobs created" barSize={48} radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="jobs" position="top" fontSize={10.5} fill={NAVY} fontWeight={700} />
                    {jobs.createdByProgram.map(d => <Cell key={d.program} fill={PROGRAM_COLOR[d.program as Program]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 8, justifyContent: "center" }}>
                {PROGRAMS.map(p => (
                  <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, color: "#6B7280" }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: PROGRAM_COLOR[p] }} />{p}
                  </span>
                ))}
              </div>
            </Panel>
          </div>
        </section>
        )}

        {/* ════ SECTION 3 — INCLUSION ════ */}
        {show(3) && (
        <section className="space-y-4">
          <SectionHeader title="Inclusion Reach" blurb="Who is accessing work opportunities?" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
            <Panel title="Work Outcomes by Priority Group" subtitle="Employment · Internships · Enterprise"
              info="Participants in each work outcome by priority group.">
              <ResponsiveContainer width="100%" height={230}>
                <BarChart layout="vertical" data={inclusion.outcomesByPriorityGroup} margin={{ top: 4, right: 40, bottom: 0, left: 8 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: "var(--chart-axis)" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10.5, fill: "#374151" }} width={140} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="Employment" name="Employment" stackId="o" fill={OUTCOME_COLOR.Employment} barSize={20} />
                  <Bar dataKey="Internships" name="Internships" stackId="o" fill={OUTCOME_COLOR.Internships} barSize={20} />
                  <Bar dataKey="Enterprise" name="Enterprise" stackId="o" fill={OUTCOME_COLOR.Ventures} radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </Panel>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
            <Panel title="Primary & Secondary Jobs by Priority Group" subtitle="Women · Refugees / displaced · Persons w/ disability"
              info="Primary and secondary job holders who belong to each priority group.">
              <ResponsiveContainer width="100%" height={230}>
                <BarChart layout="vertical" data={inclusion.primaryByGroup} margin={{ top: 4, right: 40, bottom: 0, left: 8 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: "var(--chart-axis)" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10.5, fill: "#374151" }} width={150} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="Primary" name="Primary jobs" fill={C_BLUE} radius={[0, 4, 4, 0]} barSize={20} />
                  <Bar dataKey="Secondary" name="Secondary jobs" fill={C_GREEN} radius={[0, 4, 4, 0]} barSize={20}>
                    <LabelList dataKey="Secondary" position="right" fontSize={10} fill="#374151" fontWeight={700} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Panel>
            <Panel title="Geographic Distribution" subtitle="Africa vs outside Africa"
              info="Share of participants based in Africa versus the diaspora.">
              <Donut data={inclusion.africaSplit} colors={[C_GREEN, "#C5D2E0"]} total={kpis.total} totalLabel="Youth" height={300} legendPercent />
            </Panel>
          </div>
        </section>
        )}

        {/* ════ SECTION 4 — QUALITY OF WORK ════ */}
        {show(4) && (
        <section className="space-y-4">
          <SectionHeader title="Quality of Work" blurb="Are participants accessing meaningful and sustainable work?" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            <Panel title="Decent Work Indicators" subtitle="Average score out of 100"
              info="How working participants score on each dignified-work indicator — reliable income, sense of purpose, reputation, and respect in the workplace.">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart layout="vertical" data={quality.indicators} margin={{ top: 4, right: 40, bottom: 0, left: 8 }} barCategoryGap="28%">
                  <CartesianGrid horizontal={false} stroke="rgba(0,33,71,0.06)" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--chart-axis)" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#374151" }} width={150} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                  <Bar dataKey="Score" radius={[0, 4, 4, 0]} barSize={20}>
                    <LabelList dataKey="Score" position="right" fontSize={10} fill="#374151" fontWeight={700} />
                    {quality.indicators.map((d, i) => (
                      <Cell key={d.name} fill={["#102C5E", "#479BD6", "#E0A458", "#D45F2C"][i % 4]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 8, justifyContent: "center" }}>
                {quality.indicators.map((d, i) => (
                  <span key={d.name} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, color: "#6B7280" }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: ["#102C5E", "#479BD6", "#E0A458", "#D45F2C"][i % 4] }} />{d.name}
                  </span>
                ))}
              </div>
            </Panel>
            <Panel title="Dignified Work Status" subtitle="Accessing vs progressing"
              info="Working participants accessing dignified work versus those still progressing toward it.">
              <Donut data={quality.dignified} colors={[C_BLUE, "#C5D2E0"]} total={quality.dignifiedTotal} totalLabel="Working" height={340} legendPercent />
            </Panel>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            <Panel title="Employment Sector" subtitle="Where working participants are placed"
              info="Distribution of primary jobs across sectors, sorted from most to least.">
              <ResponsiveContainer width="100%" height={Math.max(260, quality.sectors.length * 30)}>
                <BarChart layout="vertical" data={quality.sectors} margin={{ top: 4, right: 40, bottom: 0, left: 8 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: "var(--chart-axis)" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#374151" }} width={200} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="value" name="Youth in primary jobs" fill={BAND} radius={[0, 4, 4, 0]} barSize={16}>
                    <LabelList dataKey="value" position="right" fontSize={10} fill="#374151" fontWeight={700} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Panel>
            <Panel title="Employer Type" subtitle="Startup · Corporate · Public · NGO · Self-employed"
              info="Type of employer for working participants.">
              <Donut data={quality.employers} colors={EMPLOYER_PALETTE} total={quality.employers.reduce((s, d) => s + d.value, 0)} totalLabel="Working" height={340} legendPercent />
            </Panel>
          </div>
        </section>
        )}

        <FeaturedImpactStory footer />
      </div>

      <style>{`
        @media (max-width: 860px) {
          .yiw-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
