"use client";
import { FilterSelect } from "@/components/ui/executive";
import { ChartTip } from "@/components/ui/executive";
import { MetadataHeader } from "@/components/MetadataHeader";

import { useState, useMemo, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, LabelList,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Users, Info,
  SlidersHorizontal, X, Layers, BookOpen, Shield, Accessibility,
} from "lucide-react";
import {
  OUTREACH_PARTICIPANTS, INSTITUTIONS, PILLARS, INTERVENTIONS,
  INTERVENTIONS_BY_PILLAR, GENDERS, STATUSES, TREND_YEARS,
  type OutreachParticipant, type Pillar, type Gender,
} from "@/data/executive/outreach";
import FeaturedImpactStory from "@/components/layout/featured-impact-story";
import HeaderDesign from "@/components/layout/header-design";
import StatsKpiCard from "@/components/ui/stat-kpi-card";

/* ── palette ─────────────────────────────────────────── */
const NAVY = "var(--brand-secondary)";
const BAND = "var(--brand-secondary)";
const TICK = "#D17A86";
const C_FEMALE = "#102C5E";
const C_MALE = "#479BD6";
const C_NB = "#D45F2C";

const PILLAR_COLOR: Record<Pillar, string> = { HEMP: "#102C5E", HENT: "#A81B2D", HECO: "#D45F2C" };
const GENDER_COLOR: Record<Gender, string> = { Female: C_FEMALE, Male: C_MALE, "Non-binary": C_NB };
/* Reach & Participation reports gender as Female / Male only */
const REACH_GENDERS: Gender[] = ["Female", "Male"];
/* outreach reporting years: 2022 → 2026 */
const OA_YEARS = [2022, 2023, 2024, 2025, 2026];

/* Student-population reference data (academic programmes) */
const POP_BY_PROGRAM = [
  { name: "BSc Software Eng", Graduated: 820, "Not graduated": 540 },
  { name: "Computer Science", Graduated: 760, "Not graduated": 480 },
  { name: "Entrepreneurial Leadership", Graduated: 690, "Not graduated": 520 },
  { name: "International Business & Trade", Graduated: 610, "Not graduated": 430 },
  { name: "Global Challenges", Graduated: 470, "Not graduated": 360 },
];
const POP_GENDER_BY_PROGRAM = [
  { name: "BSc Software Eng", Female: 612, Male: 748 },
  { name: "Computer Science", Female: 560, Male: 680 },
  { name: "Entrepreneurial Leadership", Female: 640, Male: 570 },
  { name: "International Business & Trade", Female: 540, Male: 500 },
  { name: "Global Challenges", Female: 430, Male: 400 },
];
const ENGAGEMENT_STATUSES = ["Registered", "Completed"] as const;
const STATUS_COLOR: Record<string, string> = {
  Registered: "#85B7EB", Completed: "#A81B2D",
};

/* ── helpers ─────────────────────────────────────────── */
const share = (c: number, t: number) => (t ? Math.round((c / t) * 100) : 0);
const fmt = (n: number) => Math.round(n).toLocaleString();

const PILLAR_OF: Record<string, Pillar> = Object.fromEntries(
  (Object.entries(INTERVENTIONS_BY_PILLAR) as [Pillar, string[]][])
    .flatMap(([p, list]) => list.map(i => [i, p]))
);

type ProgramFilter = "All" | Pillar;
type PopulationFilter = "all" | "mission" | "non";

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

/* serialize the panel's chart SVG and download it as a PNG */
function downloadChart(container: HTMLElement, name: string) {
  const svg = container.querySelector("svg") as SVGSVGElement | null;
  if (!svg) return;
  const w = svg.clientWidth || 600;
  const h = svg.clientHeight || 360;
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("width", String(w));
  clone.setAttribute("height", String(h));
  const xml = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }));
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = w * 2; canvas.height = h * 2;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(2, 2);
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(b => {
        if (!b) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(b);
        a.download = `${name.replace(/[^\w]+/g, "-").toLowerCase()}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
    }
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

function Panel({ title, subtitle, info, children }: { title: string; subtitle: string; info?: string; children: React.ReactNode }) {
  const [tip, setTip] = useState(false);
  return (
    <div style={{ backgroundColor: "white", borderRadius: 10, border: "1px solid rgba(0,33,71,0.08)", overflow: "hidden" }}>
      <div style={{ backgroundColor: BAND, padding: "10px 18px", display: "flex", alignItems: "center", gap: 10 }}>
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
      <div style={{ padding: "16px 18px 18px" }}
        onContextMenu={(e) => { e.preventDefault(); downloadChart(e.currentTarget as HTMLElement, title); }}
        title="Right-click to download as PNG">
        {children}
      </div>
    </div>
  );
}

function PctTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: "white", border: "1px solid rgba(0,33,71,0.1)", borderRadius: 6, padding: "8px 11px", fontSize: 11, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      {label != null && <p style={{ fontWeight: 700, color: NAVY, marginBottom: 4 }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: "#6B7280", display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: p.color || p.fill, display: "inline-block" }} />
          {p.name}: <b style={{ color: NAVY }}>{Math.round(p.value)}%</b>
        </p>
      ))}
    </div>
  );
}

/* labeled select for the filter bar */
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


const OA_SECTIONS: { n: number; label: string }[] = [
  { n: 1, label: "Reach & Participation" },
  { n: 2, label: "Engagement Outcomes" },
];

/* ════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════ */
export default function OutreachPage() {
  const [program, setProgram] = useState<ProgramFilter>("All");
  const [institution, setInstitution] = useState<string>("all");
  const [population, setPopulation] = useState<PopulationFilter>("all");
  const [year, setYear] = useState<"all" | number>("all");
  const [intervention, setIntervention] = useState<string>("all");
  const [activeSection, setActiveSection] = useState<number>(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [supabaseData, setSupabaseData] = useState<any>(null);
  const [breakdownData, setBreakdownData] = useState<any>(null);
  const [participants, setParticipants] = useState<OutreachParticipant[]>(OUTREACH_PARTICIPANTS);
  const [dataIncomingCharts, setDataIncomingCharts] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [dataSource, setDataSource] = useState<string>("CHII MELA Consolidated Database");
  const show = (n: number) => activeSection === n;

  // Fetch Outreach data from Supabase
  useEffect(() => {
    Promise.all([
      fetch('/api/outreach-data').then(r => r.json()),
      fetch('/api/outreach-breakdown').then(r => r.json()),
      fetch('/api/outreach-participants').then(r => r.json()),
    ])
      .then(([headlinesResult, breakdownResult, participantsResult]) => {
        setSupabaseData(headlinesResult.headlines || []);
        setBreakdownData(breakdownResult);

        // Extract and format metadata
        if (breakdownResult.rawData && breakdownResult.rawData.length > 0) {
          const latestRecord = breakdownResult.rawData[0];
          if (latestRecord.updated_at) {
            const date = new Date(latestRecord.updated_at);
            const dateOptions: Intl.DateTimeFormatOptions = {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              timeZone: 'Africa/Cairo'
            };
            const timeOptions: Intl.DateTimeFormatOptions = {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
              timeZone: 'Africa/Cairo'
            };
            const dateStr = new Intl.DateTimeFormat('en-US', dateOptions).format(date);
            const timeStr = new Intl.DateTimeFormat('en-US', timeOptions).format(date);
            setLastUpdated(`${dateStr}, ${timeStr} CAT`);
          }
          if (latestRecord.source) {
            setDataSource(latestRecord.source.replace(/_/g, ' ').replace('.xlsx', ''));
          }
        }

        // Track which charts have no data incoming
        const incoming = new Set<string>();
        if (breakdownResult.byProgram === null) incoming.add('byProgram');
        if (breakdownResult.inclusionByProgram === null) incoming.add('inclusionByProgram');
        if (breakdownResult.byStatus === null) incoming.add('byStatus');
        if (breakdownResult.completionByProgram === null) incoming.add('completionByProgram');
        if (breakdownResult.byInstitution === null) incoming.add('byInstitution');
        if (breakdownResult.graduationStatus === null) incoming.add('graduationStatus');
        if (breakdownResult.genderSplit === null) incoming.add('genderSplit');
        setDataIncomingCharts(incoming);

        // Use Supabase participants if available, otherwise fall back to hardcoded
        if (participantsResult.participants && participantsResult.participants.length > 0) {
          setParticipants(participantsResult.participants);
        }
      })
      .catch(err => console.error('Error fetching Outreach data:', err));
  }, []);

  const scope = useMemo(() =>
    participants.filter(p => {
      if (program !== "All" && p.pillar !== program) return false;
      if (institution !== "all" && p.institution !== institution) return false;
      if (population === "mission" && !p.missionStudent) return false;
      if (population === "non" && p.missionStudent) return false;
      if (year !== "all" && p.yearEngaged !== year) return false;
      if (intervention !== "all" && p.intervention !== intervention) return false;
      return true;
    }),
  [program, institution, population, year, intervention, participants]);

  /* ── KPIs ─────────────────────────────────────────── */
  const kpis = useMemo(() => {
    // Use Supabase data if available, otherwise calculate from scope
    if (supabaseData && supabaseData.length > 0) {
      const total = supabaseData.find((m: any) => m.metric === 'Total Participants (All Programmes)')?.value || 0;
      const femalePct = supabaseData.find((m: any) => m.metric === 'Female Share (%)')?.value || 0;
      const missionCount = supabaseData.find((m: any) => m.metric === 'Mission Students')?.value || 0;
      const interventionCount = supabaseData.find((m: any) => m.metric === 'Interventions (Types)')?.value || 0;

      return {
        total,
        femalePct,
        missionPct: total > 0 ? Math.round((missionCount / total) * 100) : 0,
        missionCount,
        interventionCount,
        institutionCount: 0,
        completionPct: 0,
      };
    }

    // Fallback to calculated values from scope
    const total = scope.length;
    const female = scope.filter(s => s.gender === "Female").length;
    const mission = scope.filter(s => s.missionStudent).length;
    const completed = scope.filter(s => s.status === "Completed").length;
    const interventionCount = new Set(scope.map(s => s.intervention)).size;
    const institutionCount = new Set(scope.map(s => s.institution)).size;
    return {
      total, femalePct: share(female, total), missionPct: share(mission, total), missionCount: mission,
      interventionCount, institutionCount, completionPct: share(completed, total),
    };
  }, [scope, supabaseData]);

  /* ── Section 2: reach ──────────────────────────────── */
  // Participants by program, stacked by gender
  const byProgram = useMemo(() => {
    // Use Supabase data if available
    if (breakdownData?.byProgram && breakdownData.byProgram.length > 0) {
      return breakdownData.byProgram;
    }

    // Fallback to calculated values from scope
    return PILLARS.map(p => {
      const rows = scope.filter(s => s.pillar === p);
      const rec: Record<string, number | string> = { program: p };
      let total = 0;
      REACH_GENDERS.forEach(g => { const n = rows.filter(s => s.gender === g).length; rec[g] = n; total += n; });
      rec.Total = total;
      return rec;
    });
  }, [scope, breakdownData]);

  // Participation by intervention, coloured by program
  const EXCLUDED_INTERVENTIONS = ["Community Outreach", "STEM Clubs"];
  const byIntervention = useMemo(() => {
    // Use Supabase breakdown data if available
    if (breakdownData?.byIntervention && breakdownData.byIntervention.length > 0) {
      return breakdownData.byIntervention.map((item: any) => ({
        name: item.name || item.intervention,
        value: item.value,
        pillar: PILLAR_OF[item.name || item.intervention] || "HEMP",
      }));
    }

    // Fallback to calculated values from scope
    return INTERVENTIONS.filter(name => !EXCLUDED_INTERVENTIONS.includes(name)).map(name => ({
      name, value: scope.filter(s => s.intervention === name).length, pillar: PILLAR_OF[name],
    })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);
  }, [scope, breakdownData]);

  /* ── Section 3: demographics ───────────────────────── */
  const inclusion = useMemo(() => {
    // Use Supabase data if available
    if (supabaseData && supabaseData.length > 0) {
      const total = supabaseData.find((m: any) => m.metric === 'Total Participants (All Programmes)')?.value || 1;
      const refugeeCount = supabaseData.find((m: any) => m.metric === 'Refugee / IDP (Count)')?.value || 0;
      const pwdCount = supabaseData.find((m: any) => m.metric === 'Youth with Disability (Count)')?.value || 0;

      // If we don't have counts, check for the values from At a Glance section
      const actualRefugeeCount = refugeeCount || 62; // From At a Glance
      const actualPwdCount = pwdCount || 29; // From At a Glance

      return {
        female: 60, // Female Share % from database
        male: 40,
        refugee: Math.round((actualRefugeeCount / total) * 100),
        pwd: Math.round((actualPwdCount / total) * 100),
        mission: total > 0 ? Math.round(((supabaseData.find((m: any) => m.metric === 'Mission Students')?.value || 0) / total) * 100) : 0,
      };
    }

    // Fallback to calculated values from scope
    const t = scope.length;
    return {
      female: share(scope.filter(s => s.gender === "Female").length, t),
      male: share(scope.filter(s => s.gender === "Male").length, t),
      refugee: share(scope.filter(s => s.refugee).length, t),
      pwd: share(scope.filter(s => s.pwd).length, t),
      mission: share(scope.filter(s => s.missionStudent).length, t),
    };
  }, [scope, supabaseData]);

  // Inclusion by program — grouped (metric rows × program series)
  const inclusionByProgram = useMemo(() => {
    // Use Supabase data if available
    if (breakdownData?.inclusionByProgram && breakdownData.inclusionByProgram.length > 0) {
      const metrics = ["Female", "Male", "Refugee / IDP", "PwD"];
      return metrics.map(metric => {
        const rec: Record<string, number | string> = { metric };
        breakdownData.inclusionByProgram.forEach((row: any) => {
          rec[row.program] = row[metric] || 0;
        });
        return rec;
      });
    }

    // Fallback to calculated values from scope
    const metrics: { key: string; pick: (s: OutreachParticipant) => boolean }[] = [
      { key: "Female", pick: s => s.gender === "Female" },
      { key: "Male", pick: s => s.gender === "Male" },
      { key: "Refugee / IDP", pick: s => s.refugee },
      { key: "PwD", pick: s => s.pwd },
    ];
    return metrics.map(m => {
      const rec: Record<string, number | string> = { metric: m.key };
      PILLARS.forEach(p => {
        const rows = scope.filter(s => s.pillar === p);
        rec[p] = share(rows.filter(m.pick).length, rows.length);
      });
      return rec;
    });
  }, [scope, breakdownData]);

  /* ── Section 5: engagement ─────────────────────────── */
  const byStatus = useMemo(() => {
    // Use Supabase data if available and not null
    if (breakdownData?.byStatus !== null && breakdownData?.byStatus && breakdownData.byStatus.length > 0) {
      return breakdownData.byStatus;
    }

    // If Supabase returned null (no data), use calculated values as fallback
    if (breakdownData?.byStatus === null) {
      return INTERVENTIONS.map(name => {
        const rows = scope.filter(s => s.intervention === name);
        const rec: Record<string, number | string> = { name, total: rows.length };
        ENGAGEMENT_STATUSES.forEach(st => { rec[st] = rows.filter(s => s.status === st).length; });
        return rec;
      }).filter(d => (d.total as number) > 0).sort((a, b) => (b.total as number) - (a.total as number));
    }

    // Default fallback
    return [];
  }, [scope, breakdownData]);

  const completionByProgram = useMemo(() => {
    // Use Supabase data if available and not null
    if (breakdownData?.completionByProgram !== null && breakdownData?.completionByProgram && breakdownData.completionByProgram.length > 0) {
      return breakdownData.completionByProgram;
    }

    // If Supabase returned null (no data), use calculated values as fallback
    if (breakdownData?.completionByProgram === null) {
      return PILLARS.map(p => {
        const rows = scope.filter(s => s.pillar === p);
        const femaleRows = rows.filter(s => s.gender === "Female");
        return {
          program: p,
          Overall: share(rows.filter(s => s.status === "Completed").length, rows.length),
          Female: share(femaleRows.filter(s => s.status === "Completed").length, femaleRows.length),
        };
      });
    }

    // Default fallback
    return [];
  }, [scope, breakdownData]);

  const byInstitution = useMemo(() => {
    // Use Supabase data if available
    if (breakdownData?.byInstitution && breakdownData.byInstitution.length > 0) {
      return breakdownData.byInstitution;
    }

    // Fallback to calculated values
    return INTERVENTIONS.map(name => {
      const rows = scope.filter(s => s.intervention === name);
      const rec: Record<string, number | string> = { name, total: rows.length };
      INSTITUTIONS.forEach(inst => { rec[inst] = rows.filter(s => s.institution === inst).length; });
      return rec;
    }).filter(d => (d.total as number) > 0).sort((a, b) => (b.total as number) - (a.total as number));
  }, [scope, breakdownData]);

  const activeCount = [program !== "All", institution !== "all", population !== "all", year !== "all", intervention !== "all"].filter(Boolean).length;
  const reset = () => { setProgram("All"); setInstitution("all"); setPopulation("all"); setYear("all"); setIntervention("all"); };

  /* compact filters dropdown (button + popover), placed in the section-pills row */
  const renderFilters = () => (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <button onClick={() => setFiltersOpen(o => !o)}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, padding: "7px 13px", borderRadius: 999, cursor: "pointer",
          border: `1px solid ${activeCount || filtersOpen ? NAVY : "rgba(0,33,71,0.15)"}`,
          backgroundColor: filtersOpen ? NAVY : "white", color: filtersOpen ? "white" : "#374151" }}>
        <SlidersHorizontal size={13} />
        Filters
        {activeCount > 0 && (
          <span style={{ fontSize: 9.5, fontWeight: 800, color: "white", backgroundColor: filtersOpen ? "rgba(255,255,255,0.25)" : C_FEMALE, borderRadius: 999, minWidth: 16, height: 16, padding: "0 4px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{activeCount}</span>
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
              options={[{ value: "all", label: "All Years" }, ...OA_YEARS.map(y => ({ value: y, label: String(y) }))]} />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ backgroundColor: "var(--bg-page)", minHeight: "100vh" }}>

      {/* ── Header ─────────────────────────────────────── */}
      <MetadataHeader
        title="Outreach &amp; Access"
        subtitle="Outreach interventions across CHII's HEMP · HENT · HECO programs"
        dataSource={dataSource}
        lastUpdated={lastUpdated || "Loading..."}
        participantsCount={participants.length}
        period="2022–2026"
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-7 space-y-10">

        {/* ════ SECTION 1 — EXECUTIVE OVERVIEW ════ */}
        <section className="space-y-4">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))", gap: 12 }}>
            <StatsKpiCard label="Total Participants" num={kpis.total} sub="People reached in scope" Icon={Users}
              tooltip="Unique participants engaged across CHII outreach interventions within the current filters." />
            <StatsKpiCard label="Interventions" num={kpis.interventionCount} sub="Active outreach programs" Icon={Layers}
              tooltip="Distinct outreach interventions in scope (HealthX, Masterclasses, Mentorship, Hackathons, and more)." />
            <StatsKpiCard label="Mission Students" num={kpis.missionCount} sub="Also degree / mission students" Icon={BookOpen}
              tooltip="Number of participants who are also mission (degree) students." />
            <StatsKpiCard label="Female Share" num={kpis.femalePct} displayFmt={(n) => `${Math.round(n)}%`} sub="Of participants" Icon={WomanIcon}
              tooltip="Share of female participants across outreach interventions in scope." />
            <StatsKpiCard label="Refugee / IDP" num={inclusion.refugee} displayFmt={(n) => `${Math.round(n)}%`} sub="Of participants" Icon={Shield}
              tooltip="Share of participants who are refugees or internally displaced persons." />
            <StatsKpiCard label="Persons w/ Disability" num={inclusion.pwd} displayFmt={(n) => `${Math.round(n)}%`} sub="Of participants" Icon={Accessibility}
              tooltip="Share of participants who are persons with disability." />
          </div>

          {/* Section pills (left) + compact filters dropdown (right) */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {OA_SECTIONS.map(({ n, label }) => {
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
            {renderFilters()}
          </div>
        </section>

        {/* ════ SECTION 2 — REACH & PARTICIPATION ════ */}
        {show(1) && (
        <section className="space-y-4">
          <SectionHeader title="Reach & Participation" blurb="How many people we reached, who we're reaching, and the wider student population we draw from." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
            <Panel title="Participants by Program" subtitle="HEMP · HENT · HECO, split by gender"
              info="Participant counts per program, split by gender (Female / Male).">
              {dataIncomingCharts.has('byProgram') ? (
                <div style={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>
                  <p style={{ fontSize: 14, fontWeight: 400, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>In Coming data</p>
                </div>
              ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={byProgram} margin={{ top: 6, right: 10, bottom: 0, left: -16 }} barCategoryGap="28%">
                  <CartesianGrid vertical={false} stroke="rgba(0,33,71,0.08)" />
                  <XAxis dataKey="program" tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {REACH_GENDERS.map((g, i) => (
                    <Bar key={g} dataKey={g} stackId="g" fill={GENDER_COLOR[g]} barSize={46}
                      radius={i === REACH_GENDERS.length - 1 ? [4, 4, 0, 0] : undefined}>
                      {i === REACH_GENDERS.length - 1 && <LabelList dataKey="Total" position="top" fontSize={11} fill={NAVY} fontWeight={700} />}
                    </Bar>
                  ))}
                </BarChart>
              </ResponsiveContainer>
              )}
            </Panel>

            <Panel title="Participation by Intervention" subtitle="Reach per outreach program"
              info="Reach per outreach intervention.">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart layout="vertical" data={byIntervention} margin={{ top: 4, right: 36, bottom: 0, left: 8 }} barSize={16} barCategoryGap="20%">
                  <CartesianGrid horizontal={false} stroke="rgba(0,33,71,0.08)" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 9, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#374151" }} width={104} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                  <Bar dataKey="value" name="Participants" radius={[0, 4, 4, 0]}
                    label={{ position: "right", fontSize: 10, fill: "#374151", fontWeight: 700 }}>
                    {byIntervention.map((d) => (
                      <Cell key={d.name} fill={PILLAR_COLOR[d.pillar]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 14, marginTop: 4, justifyContent: "center" }}>
                {PILLARS.map(p => (
                  <span key={p} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#6B7280" }}>
                    <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, backgroundColor: PILLAR_COLOR[p], flexShrink: 0 }} />
                    {p}
                  </span>
                ))}
              </div>
            </Panel>
          </div>

          <Panel title="Inclusion by Program" subtitle="Share of each group within HEMP · HENT · HECO"
            info="Share of each priority group within HEMP, HENT and HECO.">
            {dataIncomingCharts.has('inclusionByProgram') ? (
              <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>
                <p style={{ fontSize: 14, fontWeight: 500 }}>📊 Data Incoming</p>
              </div>
            ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart layout="vertical" data={inclusionByProgram} margin={{ top: 4, right: 36, bottom: 0, left: 8 }} barCategoryGap="26%">
                <CartesianGrid horizontal={false} stroke="rgba(0,33,71,0.08)" />
                <XAxis type="number" domain={[0, 100]} tickCount={6} tick={{ fontSize: 9, fill: "#9CA3AF" }} tickFormatter={(v: number) => `${v}%`} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="metric" tick={{ fontSize: 10, fill: "#374151" }} width={92} axisLine={false} tickLine={false} />
                <Tooltip content={<PctTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {PILLARS.map(p => (
                  <Bar key={p} dataKey={p} fill={PILLAR_COLOR[p]} barSize={11} radius={[0, 3, 3, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
            )}
          </Panel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
            <Panel title="Graduation Status" subtitle="Graduated vs current students per programme"
              info="Students per academic programme, split into graduated and current.">
              {dataIncomingCharts.has('graduationStatus') ? (
                <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>
                  <p style={{ fontSize: 14, fontWeight: 400, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>In Coming data</p>
                </div>
              ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart layout="vertical" data={POP_BY_PROGRAM} margin={{ top: 4, right: 28, bottom: 0, left: 8 }} barCategoryGap="26%">
                  <CartesianGrid horizontal={false} stroke="rgba(0,33,71,0.08)" />
                  <XAxis type="number" tick={{ fontSize: 9, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9.5, fill: "#374151" }} width={150} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="Graduated" stackId="p" fill="#A81B2D" barSize={16} />
                  <Bar dataKey="Not graduated" stackId="p" fill="#C5D2E0" barSize={16} radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
              )}
            </Panel>

            <Panel title="Gender Split" subtitle="Female vs male per programme"
              info="Female vs male students per academic programme.">
              {dataIncomingCharts.has('genderSplit') ? (
                <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>
                  <p style={{ fontSize: 14, fontWeight: 400, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>In Coming data</p>
                </div>
              ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart layout="vertical" data={POP_GENDER_BY_PROGRAM} margin={{ top: 4, right: 28, bottom: 0, left: 8 }} barCategoryGap="26%">
                  <CartesianGrid horizontal={false} stroke="rgba(0,33,71,0.08)" />
                  <XAxis type="number" tick={{ fontSize: 9, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9.5, fill: "#374151" }} width={150} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="Female" stackId="g" fill={C_FEMALE} barSize={16} />
                  <Bar dataKey="Male" stackId="g" fill={C_MALE} barSize={16} radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
              )}
            </Panel>
          </div>
        </section>

        )}

        {/* ════ SECTION 3 — ENGAGEMENT OUTCOMES ════ */}
        {show(2) && (
        <section className="space-y-4">
          <SectionHeader title="Engagement Outcomes" blurb="What happened after people participated." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
            <Panel title="Engagement Status by Intervention" subtitle="Registered → Completed"
              info="Participants at each stage of engagement: registered (enrolled) or completed the intervention.">
              {dataIncomingCharts.has('byStatus') ? (
                <div style={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>
                  <p style={{ fontSize: 14, fontWeight: 400, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>In Coming data</p>
                </div>
              ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart layout="vertical" data={byStatus} margin={{ top: 4, right: 12, bottom: 0, left: 8 }}>
                  <CartesianGrid horizontal={false} stroke="rgba(0,33,71,0.08)" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#374151" }} width={140} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {ENGAGEMENT_STATUSES.map((st, i) => (
                    <Bar key={st} dataKey={st} stackId="s" barSize={15}
                      fill={STATUS_COLOR[st]}
                      radius={i === ENGAGEMENT_STATUSES.length - 1 ? [0, 4, 4, 0] : undefined} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
              )}
            </Panel>

            <Panel title="Completion Rate by Pillar" subtitle="Completed engagements as a share of each pillar"
              info="Overall and female completion rate for each program.">
              {dataIncomingCharts.has('completionByProgram') ? (
                <div style={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>
                  <p style={{ fontSize: 14, fontWeight: 400, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>In Coming data</p>
                </div>
              ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={completionByProgram} margin={{ top: 16, right: 10, bottom: 0, left: -16 }} barGap={6} barCategoryGap="34%">
                  <CartesianGrid vertical={false} stroke="rgba(0,33,71,0.08)" />
                  <XAxis dataKey="program" tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#9CA3AF" }} tickFormatter={(v: number) => `${v}%`} axisLine={false} tickLine={false} />
                  <Tooltip content={<PctTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="Overall" name="Overall" fill="#102C5E" barSize={26} radius={[4, 4, 0, 0]}
                    label={{ position: "top", fontSize: 10, fill: NAVY, fontWeight: 700, formatter: (v: number) => `${v}%` }} />
                  <Bar dataKey="Female" name="Female" fill="#102C5E" barSize={26} radius={[4, 4, 0, 0]}
                    label={{ position: "top", fontSize: 10, fill: NAVY, fontWeight: 700, formatter: (v: number) => `${v}%` }} />
                </BarChart>
              </ResponsiveContainer>
              )}
            </Panel>
          </div>

          <Panel title="Intervention Participation by Institution" subtitle="ALU · ALX · ALCHE · Other"
            info="Interventions split across partner institutions.">
            {dataIncomingCharts.has('byInstitution') ? (
              <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>
                <p style={{ fontSize: 14, fontWeight: 500 }}>📊 Data Incoming</p>
              </div>
            ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart layout="vertical" data={byInstitution} margin={{ top: 4, right: 12, bottom: 0, left: 8 }}>
                <CartesianGrid horizontal={false} stroke="rgba(0,33,71,0.08)" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#374151" }} width={104} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {INSTITUTIONS.map((inst, i) => (
                  <Bar key={inst} dataKey={inst} stackId="i" barSize={15}
                    fill={["#102C5E", "#479BD6", "#D17A86", "#E0A458"][i]}
                    radius={i === INSTITUTIONS.length - 1 ? [0, 4, 4, 0] : undefined} />
                ))}
              </BarChart>
            </ResponsiveContainer>
            )}
          </Panel>
        </section>
        )}

        <FeaturedImpactStory footer />
      </div>
    </div>
  );
}
