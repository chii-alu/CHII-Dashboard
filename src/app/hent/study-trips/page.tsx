"use client";
import { useProgress } from "@/hooks/useProgress";
import { useDashboardData } from "@/hooks/useDashboardData";
import { ChartWithPlaceholder } from "@/components/ChartWithPlaceholder";
import { HeaderStatsPanel, FilterButton, FilterDropdown } from "@/components/ui/hent";
import { useDataSource, useSyncedAt } from "@/hooks/useDataSource";
import { ChartCard, SectionHeader, ChartTip, BarList, useCountUp } from "@/components/ui/hent";
import { benchColor } from "@/theme/tokens";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Star, MapPin, Users, Handshake, Zap, Briefcase, Building2, TrendingUp, CheckCircle2 } from "lucide-react";
import PortalNav from "@/components/layout/portal-nav";
import { CHART } from "@/theme/tokens";
import PortalFooter from "@/components/layout/portal-footer";
import SectionPills from "@/components/filters/section-pills";
import OutreachFilters, { FilterSelect as OFilterSelect } from "@/components/filters/filter-popover";
import { DonutRing } from "@/components/charts/donut-chart";

// HENT sample datasets are removed. Until HENT rows load, these lists are empty and the values show "In coming data".
type Row = Record<string, any>;


// HENT sample datasets are removed; the lists below stay empty until HENT rows load.
type TripType = string;
type TripRegion = string;
const studyTrips: any[] = [];
const TRIP_TYPES: string[] = [];
const TRIP_CRITERIA: string[] = [];
const TRIP_REGIONS: string[] = [];
// True once any sample list has rows. Charts show "In coming data" until then.
const hasHentData = [studyTrips].some(list => list.length > 0);

// â”€â”€â”€ palette (green family, distinct by hue) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const NAVY    = "#0F4C3A"; // footer bg only (brand green)
const ACCENT  = "#A6C13C"; // page identity — study trips = lime
const SKY     = "#1F9E9E"; // teal
const VIOLET  = "#6B8E5B"; // moss
const TEAL    = "#2D8A8A"; // deep teal
const EMERALD = "#40916C"; // sea green
const INDIGO  = "#2D6A4F"; // forest
const AMBER   = "#A6C13C"; // lime
const ROSE    = "#94A93B"; // olive
const PRIMARY = "#2D8A8A"; // deep teal

const BAR_COLORS = ["#1B4332", "#1F9E9E", "#A6C13C", "#6B8E5B", "#40916C"];

const RATING_COLORS: Record<string, string> = {
  "Very High": "#1B4332", High: "#40916C", Moderate: "#A6C13C", Low: "#C44536",
};
const RANK_BG = ["#C9A227", "#9CA3AF", "#CD7F32"];

function ratingLabel(s: number): string {
  return s >= 4.5 ? "Very High" : s >= 3.8 ? "High" : s >= 3.0 ? "Moderate" : "Low";
}

// â”€â”€â”€ shared components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const DISTINCT = ["#2E7D5B","#E76F51","#2A6F97","#E9C46A","#6A4C93","#E63946","#43AA8B","#F4A261","#577590","#9B5DE5","#00BBF9","#BC6C25","#8AB17D","#D62828","#3D405B"];
function CustomDonut({ data, className = "" }: {
  data: { name: string; value: number }[];
  colors?: string[];
  label?: string;
  valueFormatter?: (v: number) => string;
  className?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return null;
  const height = className.includes("h-52") ? 300 : 260;
  return <DonutRing data={data} colors={DISTINCT} total={total} totalLabel="Total" height={height} legendPercent />;
}

function ColorBarList({ data, colors }: { data: { name: string; value: number }[]; colors: string[] }) {
  const max = data[0]?.value ?? 1;
  return (
    <div className="space-y-2">
      {data.map((row, i) => {
        const col = colors[i % colors.length];
        return (
          <div key={row.name} className="flex items-center gap-2.5">
            <div className="w-[88px] text-[11px] text-gray-600 text-right flex-shrink-0 leading-tight truncate">{row.name}</div>
            <div className="flex-1 h-[18px] rounded-sm overflow-hidden" style={{ backgroundColor: col + "1A" }}>
              <div className="h-full" style={{ width: `${(row.value / max) * 100}%`, backgroundColor: col }} />
            </div>
            <div className="text-[11px] font-bold w-6 flex-shrink-0 tabular-nums text-right" style={{ color: col }}>{row.value}</div>
          </div>
        );
      })}
    </div>
  );
}

function ProfileCard({ label, value, pct, total: tot, color }: {
  label: string; value: number | null; pct: number | null; total: number | null; color: string;
}) {
  return (
    <div className="rounded-[10px]" style={{ backgroundColor: "#ffffff", border: "1px solid #2D6A4F", padding: "14px 16px" }}>
      <p className="tabular-nums" style={{ fontSize: pct === null ? 14 : 30, fontWeight: 800, color: pct === null ? "#9CA3AF" : "#2D6A4F", lineHeight: 1.05 }}>{pct === null ? "In coming data" : `${pct}%`}</p>
      <p style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 4 }}>{label}</p>
      <p className="tabular-nums" style={{ fontSize: 9, fontWeight: 500, color: "#9CA3AF", marginTop: 2 }}>{value === null || tot === null ? "In coming data" : `${value.toLocaleString()} / ${tot.toLocaleString()}`}</p>
      <div className="rounded-sm mt-3 overflow-hidden" style={{ height: 6, backgroundColor: color + "20" }}>
        <div className="h-full" style={{ width: `${Math.min(pct ?? 0, 100)}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function RatingBar({ label, visits, criterion }: {
  label: string; visits: typeof studyTrips; criterion: typeof TRIP_CRITERIA[number];
}) {
  const avg = visits.length
    ? (visits.reduce((s, v) => s + v.scores[criterion], 0) / visits.length).toFixed(1) : " - ";
  return (
    <div className="flex items-center gap-4 mb-3 last:mb-0">
      <div className="w-40 text-[12px] font-bold text-gray-900 text-right flex-shrink-0">{label}</div>
      <div className="flex-1 h-8 bg-gray-100 rounded overflow-hidden" style={{ backgroundColor: "#0E4633" }}>
      </div>
      <div className="w-10 text-[13px] font-black text-right flex-shrink-0 tabular-nums text-gray-900">{avg}/5</div>
    </div>
  );
}

function GenderRatingBar({ label, fVisits, mVisits, criterion }: {
  label: string; fVisits: typeof studyTrips; mVisits: typeof studyTrips;
  criterion: typeof TRIP_CRITERIA[number];
}) {
  const fAvg = fVisits.length ? fVisits.reduce((s, v) => s + v.scores[criterion], 0) / fVisits.length : 0;
  const mAvg = mVisits.length ? mVisits.reduce((s, v) => s + v.scores[criterion], 0) / mVisits.length : 0;
  return (
    <div className="space-y-2 mb-3 last:mb-0">
      <div className="flex items-center gap-4">
        <div className="w-40 text-[12px] font-bold text-gray-900 text-right flex-shrink-0">
          {label} <span className="text-[11px] text-gray-500">(F)</span>
        </div>
        <div className="flex-1 h-8 rounded overflow-hidden" style={{ backgroundColor: VIOLET }}>
        </div>
        <span className="w-10 text-[13px] font-black text-right flex-shrink-0 text-gray-900">{fAvg.toFixed(1)}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-40 text-[12px] font-bold text-gray-900 text-right flex-shrink-0">
          <span className="text-[11px] text-gray-500">(M)</span>
        </div>
        <div className="flex-1 h-8 rounded overflow-hidden" style={{ backgroundColor: SKY }}>
        </div>
        <span className="w-10 text-[13px] font-black text-right flex-shrink-0 text-gray-900">{mAvg.toFixed(1)}</span>
      </div>
    </div>
  );
}

function Stars({ score }: { score: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={10}
          className={i <= Math.floor(score) ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
      ))}
      <span className="text-[10px] text-gray-500 ml-1">{score.toFixed(1)}</span>
    </span>
  );
}


// â”€â”€â”€ KPI tile map (7 metrics) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const KPI_TILES = [
  { label: "Total Study Trips",      clr: "#065F46" },  // emerald   -  page identity
  { label: "Total Participants",      clr: "#1E3A8A" },  // deep blue
  { label: "Ventures Participating",  clr: "#6D28D9" },  // violet
  { label: "Organisations Visited",   clr: "#0E7490" },  // cyan
  { label: "Avg Attendance / Visit",  clr: "#C2410C" },  // orange
  { label: "Avg Completion Rate",     clr: "#3730A3" },  // indigo
] as const;

// Youth-in-Work-style filter select (green theme)
// â”€â”€â”€ page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function sum(a: number[]) { return a.reduce((x, y) => x + y, 0); }
const BRAND    = "#2D6A4F";
const BRAND_DK = "#0E4633";
const LIGHT_BORDER = "rgba(14, 70, 51, 0.12)";

// Section title row, laid out like the HEMP section headers.
function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ width: 3, height: 16, borderRadius: 999, backgroundColor: BRAND, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: BRAND_DK, lineHeight: 1.2, margin: 0 }}>{title}</p>
          <p style={{ fontSize: 11, color: "#6B7280", marginTop: 3, margin: 0 }}>{sub}</p>
        </div>
      </div>
    </div>
  );
}

export default function FieldVisitsPage() {
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
  const [yearFilter,   setYearFilter]   = useState<"All"|"2022"|"2023"|"2024"|"2025"|"2026">("All");
  const [typeFilter,   setTypeFilter]   = useState<"All"|TripType>("All");
  const [regionFilter, setRegionFilter] = useState<"All"|TripRegion>("All");
  const [genderView,   setGenderView]   = useState<"All"|"Female"|"Male">("All");
  const [activeSection, setActiveSection] = useState<number>(1);
  const show = (n: number) => activeSection === n;
  // Chart data the database does not provide yet: empty until those rows exist, so each chart shows "In coming data".
  const tripsByYear: { Year: string; Trips: number; Participants: number }[] = [];
  const attendanceByTrip: { name: string; Attendance: number; Target: number }[] = [];
  const participantsByCountry: { name: string; value: number }[] = [];
  const participantProfile: { name: string; data: { name: string; value: number }[] }[] = [];
  const learningByTrip: { name: string; value: number }[] = [];
  const ratingBreakdown: { name: string; value: number }[] = [];
  const tripHighlights: { trip: string; quote: string; rating: number }[] = [];
  const followUpsByYear: { Year: string; Meetings: number; Pilots: number; Mentorships: number; Partnerships: number }[] = [];
  const impactfulVisits: { host: string; followUps: number }[] = [];
  const partnershipsBySector: { name: string; value: number }[] = [];
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersActive = (yearFilter !== "All" ? 1 : 0) + (typeFilter !== "All" ? 1 : 0) + (regionFilter !== "All" ? 1 : 0) + (genderView !== "All" ? 1 : 0);

  const filtered = useMemo(() => studyTrips.filter(v => {
    if (yearFilter   !== "All" && v.year   !== Number(yearFilter)) return false;
    if (typeFilter   !== "All" && v.type   !== typeFilter)         return false;
    if (regionFilter !== "All" && v.region !== regionFilter)       return false;
    if (genderView === "Female" && v.femaleParticipants <= v.participants / 2) return false;
    if (genderView === "Male"   && v.femaleParticipants >  v.participants / 2) return false;
    return true;
  }), [yearFilter, typeFilter, regionFilter, genderView]);

  const tot = {
    visits:       filtered.length,
    participants: filtered.reduce((s, v) => s + v.participants,        0),
    female:       filtered.reduce((s, v) => s + v.femaleParticipants,  0),
    students:     filtered.reduce((s, v) => s + v.studentParticipants, 0),
    ventures:     filtered.reduce((s, v) => s + v.venturesRepresented, 0),
    orgs:         Array.from(new Set(filtered.map(v => v.organization))).length,
    partnerships: filtered.reduce((s, v) => s + v.partnerships,        0),
    completion:   filtered.length
      ? Math.round(filtered.reduce((s, v) => s + v.completionRate, 0) / filtered.length) : 0,
  };
  const avgAtt      = filtered.length ? Math.round(tot.participants / filtered.length) : 0;
  const femalePct   = tot.participants ? Math.round((tot.female   / tot.participants) * 100) : 0;
  const studentPct  = tot.participants ? Math.round((tot.students / tot.participants) * 100) : 0;
  const alumniTotal = tot.participants - tot.students;

  const fVisits = filtered.filter(v => v.femaleParticipants >  v.participants / 2);
  const mVisits = filtered.filter(v => v.femaleParticipants <= v.participants / 2);

  const byAge    = { "18-25": 0, "26-35": 0, "36-45": 0, "46+": 0 };
  const byStage  = { Expose: 0, Build: 0, Scale: 0 };
  const bySocial = { PWD: 0, "Refugee-Displaced": 0 };
  filtered.forEach(v => {
    (Object.keys(v.byAge)    as (keyof typeof byAge)[]).forEach(k    => { byAge[k]    += v.byAge[k]; });
    (Object.keys(v.byStage)  as (keyof typeof byStage)[]).forEach(k  => { byStage[k]  += v.byStage[k]; });
    (Object.keys(v.bySocial) as (keyof typeof bySocial)[]).forEach(k => { bySocial[k] += v.bySocial[k]; });
  });
  const ageData    = Object.entries(byAge).map(([name, value]) => ({ name, value }));
  const stageData  = Object.entries(byStage).map(([name, value]) => ({ name, value }));
  const socialData = Object.entries(bySocial).map(([name, value]) => ({ name, value }));
  const SOCIAL_COLORS = [ACCENT, EMERALD, AMBER];

  const regionCounts: Record<string, { visits: number; participants: number }> = {};
  filtered.forEach(v => {
    if (!regionCounts[v.region]) regionCounts[v.region] = { visits: 0, participants: 0 };
    regionCounts[v.region].visits++;
    regionCounts[v.region].participants += v.participants;
  });
  const REGION_COLORS = [TEAL, EMERALD, SKY, ACCENT];

  const countryCounts: Record<string, number> = {};
  filtered.forEach(v => { countryCounts[v.country] = (countryCounts[v.country] || 0) + 1; });
  const countryData = Object.entries(countryCounts)
    .map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const typeCount: Record<string, number> = {};
  filtered.forEach(v => { typeCount[v.type] = (typeCount[v.type] || 0) + 1; });
  const typeData = Object.entries(typeCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const TYPE_COLORS = [SKY, EMERALD, VIOLET, AMBER, ROSE, TEAL, PRIMARY];

  const attendanceTrend = [...filtered].sort((a, b) => a.date.localeCompare(b.date))
    .map(v => ({ Visit: `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][v.month - 1]} '${String(v.year).slice(2)}`, Participants: v.participants }));

  let cum = 0;
  const growthData = [...filtered].sort((a, b) => a.date.localeCompare(b.date))
    .map(v => { cum += v.participants; return { Period: `${v.year}-${String(v.month).padStart(2, "0")}`, "Cumulative Participants": cum }; });

  const YEARS = [2022, 2023, 2024, 2025, 2026];
  const genderTrend = YEARS.map(yr => {
    const yv = filtered.filter(v => v.year === yr);
    return {
      Year: String(yr),
      Female: yv.reduce((s, v) => s + v.femaleParticipants, 0),
      Male:   yv.reduce((s, v) => s + (v.participants - v.femaleParticipants), 0),
    };
  });

  const topVisits = [...filtered]
    .map(v => ({ ...v, avgScore: TRIP_CRITERIA.reduce((s, c) => s + v.scores[c], 0) / TRIP_CRITERIA.length }))
    .sort((a, b) => b.avgScore - a.avgScore).slice(0, 3);

  const orgFreq: Record<string, { type: string; count: number; participants: number; avgScore: number; location: string }> = {};
  filtered.forEach(v => {
    const base = v.organization.replace(/  -  .*/, "");
    if (!orgFreq[base]) orgFreq[base] = { type: v.type, count: 0, participants: 0, avgScore: 0, location: `${v.city}, ${v.country}` };
    orgFreq[base].count++;
    orgFreq[base].participants += v.participants;
    orgFreq[base].avgScore += TRIP_CRITERIA.reduce((s, c) => s + v.scores[c], 0) / TRIP_CRITERIA.length;
  });
  const frequentOrgs = Object.entries(orgFreq)
    .map(([name, d]) => ({ name, ...d, avgScore: d.avgScore / d.count }))
    .sort((a, b) => b.count - a.count || b.participants - a.participants).slice(0, 3);

  const partnershipsTrend = YEARS.map(yr => ({
    Year: String(yr),
    Partnerships: filtered.filter(v => v.year === yr).reduce((s, v) => s + v.partnerships, 0),
  }));

  const BASE = "?auto=format&fit=crop&w=600&h=360&q=80";
  const FV_IMAGES: Record<string, string> = {
    FV01: `https://images.unsplash.com/photo-1576091160399-112ba8d25d1d${BASE}`,  // hospital corridor / clinical staff
    FV02: `https://images.unsplash.com/photo-1551076805-e1869033e919${BASE}`,      // medical device / health tech
    FV03: `https://images.unsplash.com/photo-1524758631624-e2822132a628${BASE}`,   // modern innovation workspace
    FV04: `https://images.unsplash.com/photo-1559757148-5c350d0d3c56${BASE}`,      // hospital exterior / facility
    FV05: `https://images.unsplash.com/photo-1584308666744-24d5c474f2ae${BASE}`,   // pharmacy / medicine dispensing
    FV06: `https://images.unsplash.com/photo-1583947215259-5d1d7b14df19${BASE}`,   // medical team / institutional
    FV07: `https://images.unsplash.com/photo-1579684385127-1571b5f1cc84${BASE}`,   // doctor consultation / private hospital
    FV08: `https://images.unsplash.com/photo-1532187863486-abf9dbad1b69${BASE}`,   // research lab / NGO health
    FV09: `https://images.unsplash.com/photo-1516549655669-df28c2a37e48${BASE}`,   // digital health / data lab
    FV10: `https://images.unsplash.com/photo-1576091160399-112ba8d25d1d${BASE}`,   // EHR / health startup
    FV11: `https://images.unsplash.com/photo-1538108149393-dbada5a3f2ba${BASE}`,   // public health / government lab
    FV12: `https://images.unsplash.com/photo-1532187863486-abf9dbad1b69${BASE}`,   // Africa health research lab
    FV13: `https://images.unsplash.com/photo-1551076805-e1869033e919${BASE}`,      // health startup / delivery tech
    FV14: `https://images.unsplash.com/photo-1516549655669-df28c2a37e48${BASE}`,   // iHub / health innovation hub
    FV15: `https://images.unsplash.com/photo-1584308666744-24d5c474f2ae${BASE}`,   // pharmaceutical / access to medicine
    FV16: `https://images.unsplash.com/photo-1559757148-5c350d0d3c56${BASE}`,      // innovation city / modern facility
  };

  const kpiValues = [
    { sub: "Excursions conducted",   num: tot.visits,        fmt: (n: number) => String(Math.round(n)) },
    { sub: "Across all visits",      num: tot.participants,   fmt: (n: number) => Math.round(n).toLocaleString() },
    { sub: "Unique ventures",        num: tot.ventures,       fmt: (n: number) => Math.round(n).toLocaleString() },
    { sub: "Distinct host sites",    num: tot.orgs,           fmt: (n: number) => String(Math.round(n)) },
    { sub: "Per excursion",          num: avgAtt,             fmt: (n: number) => String(Math.round(n)) },
    { sub: "Participants completing", num: tot.completion,    fmt: (n: number) => `${Math.round(n)}%` },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      <PortalNav portal="hent" />

      {/* â”€â”€ HEADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-2">
      <header style={{ position: "relative", overflow: "hidden", backgroundColor: "#2D6A4F", borderRadius: 12, minHeight: 120, display: "flex", alignItems: "center" }}>

        {/* Faint triangle pattern across the whole header */}
        <div style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", backgroundImage: "url('/images/Pat.png')", backgroundSize: "auto 100%", backgroundRepeat: "repeat", backgroundPosition: "center", opacity: 0.05 }} />

        {/* Full design elements anchored to the left & right edges */}
        <img src="/images/design1.png" alt="" aria-hidden="true"
          style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", height: "100%", width: "auto", zIndex: 1, pointerEvents: "none", userSelect: "none" }} />
        <img src="/images/design1.png" alt="" aria-hidden="true"
          style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%) scaleX(-1)", height: "100%", width: "auto", zIndex: 1, pointerEvents: "none", userSelect: "none" }} />

        {/* Center overlay */}
        <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", background: "linear-gradient(90deg, rgba(14,70,51,0) 0%, #2D6A4F 34%, #2D6A4F 66%, rgba(14,70,51,0) 100%)" }} />

        {/* Content */}
        <div className="px-4 sm:px-6 py-6" style={{ position: "relative", zIndex: 10, width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <h1 className="text-lg font-black leading-tight" style={{ color: "white", letterSpacing: "0.01em" }}>Study Trips</h1>
            <p className="text-[11px] mt-1.5 font-medium" style={{ color: "rgba(181,212,244,0.78)" }}>Industry excursions, participation and learning experience</p>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10px]" style={{ color: "rgba(181,212,244,0.5)" }}>
              <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Data source:</span> {dataSource}</span>
              <span aria-hidden="true">·</span>
              <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Period:</span> 2022–2026</span>
              <span aria-hidden="true">·</span>
              <span>{hasHentData ? `${studyTrips.length} visits tracked` : "In coming data"}</span>
              <span aria-hidden="true">·</span>
              <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Last updated:</span> {syncedAt}</span>
            </div>
          </div>
        </div>
      </header>
      </div>

      {/* â”€â”€ MAIN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="max-w-[1440px] mx-auto px-6 py-7 space-y-8">

        {/* KPI strip */}
        <HeaderStatsPanel
        progressRows={progressRows}
          title="Study Trips Metrics"
          cards={[
            { label: "Study Trips Held", num: headline("Total Study Trips"), displayFmt: (n) => String(Math.round(n)), icon: MapPin, tip: "Industry visits delivered to date." },
            { label: "Founders Reached", num: headline("Founders Reached"), displayFmt: (n) => `${Math.round(n)}%`, icon: Users, tip: "Share of portfolio founders who joined at least one study trip." },
            { label: "Ventures Participating", num: headline("Ventures Participating"), displayFmt: (n) => Math.round(n).toLocaleString(), icon: Briefcase, tip: "Ventures with at least one founder or team member on a trip." },
            { label: "Attendance Rate", num: headline("Attendance Rate"), displayFmt: (n) => `${Math.round(n)}%`, icon: CheckCircle2, tip: "Share of registered participants who attended." },
            { label: "Learning Rating", num: headline("Learning Rating"), displayFmt: (n) => `${n.toFixed(1)}/5`, icon: Star, tip: "How participants rate what they learned, out of 5." },
            { label: "Host Follow-Ups", num: headline("Host Follow-Ups"), displayFmt: (n) => Math.round(n).toLocaleString(), icon: Handshake, tip: "Visits that led to a meeting, pilot, mentorship or partnership with the host." },
          ]}
        />


        {/* RATINGS */}
        {/* Section pills (left) + outreach-style filters popover (right) */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <SectionPills
            accent="#0E4633"
            value={String(activeSection)}
            onChange={(v) => setActiveSection(Number(v))}
            options={[
              { label: "Reach and Participation", value: "1" },
              { label: "Learning Experience", value: "2" },
              { label: "Outcomes and Partnerships", value: "3" },
            ]}
          />

          <div style={{ position: "relative" }}>
            <FilterButton
              activeFilterCount={filtersActive}
              isOpen={filtersOpen}
              onClick={() => setFiltersOpen(!filtersOpen)}
            />
            <FilterDropdown
              isOpen={filtersOpen}
              onResetFilters={() => { setYearFilter("All"); setTypeFilter("All"); setRegionFilter("All"); setGenderView("All"); }}
            >
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#0E4633", margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                  Year
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(["All", "2022", "2023", "2024", "2025", "2026"] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => setYearFilter(opt as "All"|"2022"|"2023"|"2024"|"2025"|"2026")}
                      style={{
                        fontSize: 10,
                        fontWeight: yearFilter === opt ? 700 : 500,
                        padding: "5px 10px",
                        borderRadius: 6,
                        border: `1px solid ${yearFilter === opt ? "#2D6A4F" : "rgba(14,70,51,0.12)"}`,
                        backgroundColor: yearFilter === opt ? "#2D6A4F" : "white",
                        color: yearFilter === opt ? "white" : "#0E4633",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#0E4633", margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                  Type
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(["All", ...TRIP_TYPES] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => setTypeFilter(opt as "All"|TripType)}
                      style={{
                        fontSize: 10,
                        fontWeight: typeFilter === opt ? 700 : 500,
                        padding: "5px 10px",
                        borderRadius: 6,
                        border: `1px solid ${typeFilter === opt ? "#2D6A4F" : "rgba(14,70,51,0.12)"}`,
                        backgroundColor: typeFilter === opt ? "#2D6A4F" : "white",
                        color: typeFilter === opt ? "white" : "#0E4633",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#0E4633", margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                  Region
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(["All", ...TRIP_REGIONS] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => setRegionFilter(opt as "All"|TripRegion)}
                      style={{
                        fontSize: 10,
                        fontWeight: regionFilter === opt ? 700 : 500,
                        padding: "5px 10px",
                        borderRadius: 6,
                        border: `1px solid ${regionFilter === opt ? "#2D6A4F" : "rgba(14,70,51,0.12)"}`,
                        backgroundColor: regionFilter === opt ? "#2D6A4F" : "white",
                        color: regionFilter === opt ? "white" : "#0E4633",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#0E4633", margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                  Gender
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(["All", "Female", "Male"] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => setGenderView(opt as "All"|"Female"|"Male")}
                      style={{
                        fontSize: 10,
                        fontWeight: genderView === opt ? 700 : 500,
                        padding: "5px 10px",
                        borderRadius: 6,
                        border: `1px solid ${genderView === opt ? "#2D6A4F" : "rgba(14,70,51,0.12)"}`,
                        backgroundColor: genderView === opt ? "#2D6A4F" : "white",
                        color: genderView === opt ? "white" : "#0E4633",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </FilterDropdown>
          </div>
        </div>

        {/* ── SECTION 1: Reach and Participation ─── */}
        <section style={{ display: show(1) ? undefined : "none" }}>
          <SectionTitle title="Reach and Participation" sub="Who joined, where they came from, and whether they showed up." />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Trips and Participants per Year" sub="Trips held (bars) and participants (line), 2022–2026"
              info="Trips held each year (bars) and the participants who joined them (line).">
              <ChartWithPlaceholder data={hasHentData ? tripsByYear : null} height={240}>
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={tripsByYear} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" vertical={false} />
                  <XAxis dataKey="Year" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="trips" allowDecimals={false} tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={32} />
                  <YAxis yAxisId="participants" orientation="right" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={44} />
                  <Tooltip cursor={{ fill: "rgba(0,33,71,0.04)" }} content={<ChartTip />} />
                  <Bar yAxisId="trips" dataKey="Trips" name="Trips held" fill="#1B4332" radius={[4, 4, 0, 0]} maxBarSize={38} />
                  <Line yAxisId="participants" type="monotone" dataKey="Participants" name="Participants" stroke="#1F9E9E" strokeWidth={2.5} dot={{ r: 4, fill: "#1F9E9E", strokeWidth: 0 }} />
                  <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 10 }} />
                </ComposedChart>
              </ResponsiveContainer>
              </ChartWithPlaceholder>
            </ChartCard>
            <ChartCard title="Attendance Rate by Trip" sub="Share of registered participants who attended each trip"
              info="Share of registered participants who attended each trip, against the target.">
              <ChartWithPlaceholder data={hasHentData ? attendanceByTrip : null} height={240}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={attendanceByTrip} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip cursor={{ fill: "rgba(0,33,71,0.04)" }} content={<ChartTip />} />
                  <Bar dataKey="Attendance" name="Attendance rate" fill="#1B4332" radius={[4, 4, 0, 0]} maxBarSize={38} />
                  <Line type="monotone" dataKey="Target" name="Target" stroke="#A6C13C" strokeWidth={2} dot={false} />
                  <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 10 }} />
                </BarChart>
              </ResponsiveContainer>
              </ChartWithPlaceholder>
            </ChartCard>
            <ChartCard title="Participants by Country" sub="Where participants are based"
              info="Number of participants based in each country.">
              <ChartWithPlaceholder data={hasHentData ? participantsByCountry : null} height={260}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={participantsByCountry} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barCategoryGap="22%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "rgba(0,33,71,0.04)" }} content={<ChartTip />} />
                  <Bar dataKey="value" name="Participants" fill="#1F9E9E" radius={[0, 4, 4, 0]} maxBarSize={22} />
                  <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 10 }} />
                </BarChart>
              </ResponsiveContainer>
              </ChartWithPlaceholder>
            </ChartCard>
            <ChartCard title="Participant Profile" sub="Gender, venture stage and PWD/refugee share"
              info="Gender, venture stage and PWD or refugee share of participants.">
              {hasHentData ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {participantProfile.map(group => (
                    <DonutRing key={group.name} data={group.data} colors={["#1B4332", "#1F9E9E", "#A6C13C", "#E9C46A"]} total={sum(group.data.map(d => d.value))} totalLabel={group.name} height={180} legendPercent />
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 14, color: "#9CA3AF", textAlign: "center", padding: 40 }}>In coming data</p>
              )}
            </ChartCard>
          </div>
        </section>

        {/* ── SECTION 2: Learning Experience ─── */}
        <section style={{ display: show(2) ? undefined : "none" }}>
          <SectionTitle title="Learning Experience" sub="How participants rated the trips and what stood out." />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Learning Rating by Trip" sub="Average participant rating out of 5 for each visit"
              info="Average participant rating out of 5 for each visit, highest first.">
              <ChartWithPlaceholder data={hasHentData ? learningByTrip : null} height={260}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={learningByTrip} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barCategoryGap="22%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" horizontal={false} />
                  <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "rgba(0,33,71,0.04)" }} content={<ChartTip />} />
                  <Bar dataKey="value" name="Rating (out of 5)" fill="#1B4332" radius={[0, 4, 4, 0]} maxBarSize={22} />
                  <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 10 }} />
                </BarChart>
              </ResponsiveContainer>
              </ChartWithPlaceholder>
            </ChartCard>
            <ChartCard title="Rating Breakdown" sub="Ratings for content, host engagement, relevance and logistics"
              info="Average rating for content, host engagement, relevance and logistics.">
              <ChartWithPlaceholder data={hasHentData ? ratingBreakdown : null} height={240}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={ratingBreakdown} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip cursor={{ fill: "rgba(0,33,71,0.04)" }} content={<ChartTip />} />
                  <Bar dataKey="value" name="Average rating" fill="#1F9E9E" radius={[4, 4, 0, 0]} maxBarSize={38} />
                  <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 10 }} />
                </BarChart>
              </ResponsiveContainer>
              </ChartWithPlaceholder>
            </ChartCard>
            <ChartCard title="Trip Highlights" sub="Top-rated visits with a short participant quote"
              info="The top-rated visits, with a short quote from a participant.">
              {hasHentData ? (
                <div className="space-y-3">
                  {tripHighlights.map(h => (
                    <div key={h.trip} className="pb-3 border-b border-gray-100 last:border-0">
                      <p className="text-sm font-semibold text-gray-800">{h.trip} <span className="text-[11px] font-bold" style={{ color: BRAND_DK }}>{h.rating.toFixed(1)}/5</span></p>
                      <p className="text-[11px] text-gray-500 italic mt-1">&ldquo;{h.quote}&rdquo;</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 14, color: "#9CA3AF", textAlign: "center", padding: 40 }}>In coming data</p>
              )}
            </ChartCard>
          </div>
        </section>

        {/* ── SECTION 3: Outcomes and Partnerships ─── */}
        <section style={{ display: show(3) ? undefined : "none" }}>
          <SectionTitle title="Outcomes and Partnerships" sub="What trips led to after the visit." />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Follow-Ups by Type" sub="Meetings, pilots, mentorships and partnerships that came from trips"
              info="Meetings, pilots, mentorships and partnerships that came from study trips, by year.">
              <ChartWithPlaceholder data={hasHentData ? followUpsByYear : null} height={240}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={followUpsByYear} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" vertical={false} />
                  <XAxis dataKey="Year" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip cursor={{ fill: "rgba(0,33,71,0.04)" }} content={<ChartTip />} />
                  <Bar dataKey="Meetings" name="Meetings" stackId="follow" fill="#1B4332" maxBarSize={38} />
                  <Bar dataKey="Pilots" name="Pilots" stackId="follow" fill="#1F9E9E" maxBarSize={38} />
                  <Bar dataKey="Mentorships" name="Mentorships" stackId="follow" fill="#A6C13C" maxBarSize={38} />
                  <Bar dataKey="Partnerships" name="Partnerships" stackId="follow" fill="#E9C46A" radius={[4, 4, 0, 0]} maxBarSize={38} />
                  <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 10 }} />
                </BarChart>
              </ResponsiveContainer>
              </ChartWithPlaceholder>
            </ChartCard>
            <ChartCard title="Most Impactful Visits" sub="Host organisations ranked by the follow-ups they produced"
              info="Host organisations ranked by the follow-ups they produced.">
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr>
                      <th className="text-left text-gray-400 font-bold pb-3 pr-6 uppercase tracking-wider text-[9px]">Host organisation</th>
                      <th className="text-center text-gray-400 font-bold pb-3 px-2 uppercase tracking-wider text-[9px]">Follow-ups</th>
                    </tr>
                  </thead>
                  <tbody>
                    {impactfulVisits.map(v => (
                      <tr key={v.host} style={{ borderTop: `1px solid ${LIGHT_BORDER}` }}>
                        <td className="py-2.5 pr-6 font-semibold text-gray-700">{v.host}</td>
                        <td className="py-2.5 px-2 text-center tabular-nums font-bold" style={{ color: BRAND_DK }}>{v.followUps}</td>
                      </tr>
                    ))}
                    {!impactfulVisits.length && (
                      <tr><td colSpan={2} className="text-center text-gray-400 py-6">In coming data</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ChartCard>
            <ChartCard title="Partnerships by Host Sector" sub="Partnerships formed, by the host’s sector (hospital, pharma, government, NGO, etc.)"
              info="Partnerships formed, grouped by the host organisation's sector.">
              <ChartWithPlaceholder data={hasHentData ? partnershipsBySector : null} height={240}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={partnershipsBySector} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barCategoryGap="22%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "rgba(0,33,71,0.04)" }} content={<ChartTip />} />
                  <Bar dataKey="value" name="Partnerships" fill="#2D6A4F" radius={[0, 4, 4, 0]} maxBarSize={22} />
                  <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 10 }} />
                </BarChart>
              </ResponsiveContainer>
              </ChartWithPlaceholder>
            </ChartCard>
          </div>
        </section>

        {/* FOOTER */}
        <PortalFooter source={dataSource} portal="hent" synced={syncedAt} />

      </div>
    </div>
  );
}
