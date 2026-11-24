"use client";
// ALU-CHII charts. Each chart title has the form that suits its data: stages are pipelines, shares are
// donuts or pies, change over time is a line or area, and only ranked comparisons stay as bars.
// Values are dummy data (src/config/alu-chii-dummy.ts) and change with the Year filter.
import { Fragment } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, LabelList, Line, LineChart, Pie, PieChart,
  PolarAngleAxis, PolarGrid, Radar, RadarChart, ReferenceArea, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { ChartTip } from "@/components/ui/executive";
import { dummyArea, dummyAttentionCount, dummyChartRows, dummyCount, dummyKpi } from "@/config/alu-chii-dummy";
import { OVERVIEW_AREAS } from "@/config/alu-chii";

/* ── Palette: the colours the Executive charts already use ── */
const NAVY = "#102C5E";
const BLUE = "#479BD6";
const PINK = "#D17A86";
const LABEL = "#0C447C";
const PALETTE = [NAVY, BLUE, PINK, "#9FB4E0", "#E0A458", "#5B7DB8"];
const STAGE_COLOURS = [NAVY, "#1F4E8C", "#357FBC", BLUE, "#7DB9E2"];
const GRID = "rgba(16, 44, 94, 0.10)";
const AXIS = { fontSize: 10, fill: "#6B7280" };
const CATEGORY_AXIS = { fontSize: 10.5, fill: "#374151", fontWeight: 600 };
const BODY_HEIGHT = 250;

type Kind =
  | "pipeline" | "segments" | "donut" | "pie" | "line" | "area" | "stacked" | "radar" | "gauge"
  | "target-bars" | "ranked" | "columns" | "timeline" | "stories" | "heatmap";

const KINDS: Record<string, Kind> = {
  "Capability Timeline": "timeline",
  "Professional Development by Type": "area",
  "Research Staff Capacity": "radar",
  "Collaboration Outputs by Department": "ranked",
  "Partnership Funnel": "pipeline",
  "Partnerships by Category": "donut",
  "Partnerships by Project or Intervention": "pie",
  "Partner Map": "ranked",
  "SOP Compliance by Process": "target-bars",
  "Project Delivery Status": "donut",
  "Risk Heat Map": "heatmap",
  "CQI Audit Findings": "stacked",
  "Funding vs Target": "gauge",
  "Funding Progress": "gauge",
  "Funding Pipeline by Stage": "pipeline",
  "Funding by Source": "donut",
  "Funding Secured over Time": "line",
  "Quarterly Trend": "line",
  "Research Pipeline": "pipeline",
  "Research Funding by Source": "stacked",
  "Outputs by Type": "stacked",
  "Research by Health Theme": "pie",
  "Health System Changes by Type": "donut",
  "Beneficiaries by Pillar and Year": "line",
  "Reach by Country": "ranked",
  "Contribution Stories": "stories",
  "Papers by Research Topic": "ranked",
  "Grant Pipeline": "segments",
  "Masterclass Attendance per Session": "columns",
  "Visibility by Type": "stacked",
  "Delegate": "donut",
  "Audience Reached over Time": "area",
  "Advisory Roles by Level": "pie",
};

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const yearsFor = (year: string) => {
  const last = year === "all" ? 2026 : Number(year);
  return [last - 3, last - 2, last - 1, last].map(String);
};

/** The categories and series of each multi-series chart. */
const SERIES: Record<string, { x: "quarters" | "years" | string[]; series: string[]; range: [number, number] }> = {
  "Professional Development by Type": { x: "quarters", series: ["Training", "Conferences", "Certifications", "Mentoring"], range: [4, 24] },
  "CQI Audit Findings": { x: ["Critical", "Major", "Minor", "Observation"], series: ["Closed", "Open"], range: [2, 18] },
  "Funding Secured over Time": { x: "quarters", series: ["This year", "Last year"], range: [80, 420] },
  "Quarterly Trend": { x: "quarters", series: ["This year", "Last year"], range: [40, 100] },
  "Research Funding by Source": { x: "years", series: ["AHC", "Other funders"], range: [60, 260] },
  "Outputs by Type": { x: "quarters", series: ["Publications", "Policy briefs", "Reports", "Presentations"], range: [1, 9] },
  "Beneficiaries by Pillar and Year": { x: "years", series: ["HEMP", "HENT", "HECO"], range: [120, 620] },
  "Visibility by Type": { x: "quarters", series: ["Conferences", "Panels", "Forums", "Roundtables", "Media"], range: [1, 8] },
  "Audience Reached over Time": { x: "quarters", series: ["In person", "Online"], range: [200, 1400] },
};

const between = (key: string, min: number, max: number) => min + dummyCount(key, max - min);

function seriesRows(title: string, year: string) {
  const def = SERIES[title];
  const names = def.x === "quarters" ? QUARTERS : def.x === "years" ? yearsFor(year) : def.x;
  return {
    series: def.series,
    rows: names.map(name => {
      const row: Record<string, string | number> = { name };
      let total = 0;
      def.series.forEach(s => {
        const value = between(`${title}|${s}|${name}|${year}`, def.range[0], def.range[1]);
        row[s] = value;
        total += value;
      });
      row.Total = total;
      return row;
    }),
  };
}

function SeriesLegend({ names }: { names: string[] }) {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", paddingTop: 6 }}>
      {names.map((n, i) => (
        <span key={n} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, color: "#6B7280" }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: PALETTE[i % PALETTE.length] }} />
          {n}
        </span>
      ))}
    </div>
  );
}

/* ── Shares ──────────────────────────────────────────── */

function PartToWhole({ rows, hole }: { rows: { name: string; value: number }[]; hole: boolean }) {
  const total = rows.reduce((sum, r) => sum + r.value, 0);
  return (
    <div className="flex flex-col sm:flex-row items-center" style={{ gap: 14, minHeight: BODY_HEIGHT }}>
      <div style={{ position: "relative", width: 176, height: 176, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTip />} />
            <Pie data={rows} dataKey="value" nameKey="name" innerRadius={hole ? 54 : 0} outerRadius={84} paddingAngle={hole ? 2 : 0} stroke="white" strokeWidth={hole ? 0 : 2} isAnimationActive={false}>
              {rows.map((r, i) => <Cell key={r.name} fill={PALETTE[i % PALETTE.length]} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {hole && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: NAVY, lineHeight: 1 }}>{total.toLocaleString()}</span>
            <span style={{ fontSize: 10, color: "#6B7280", marginTop: 3 }}>Total</span>
          </div>
        )}
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, flex: 1, minWidth: 0, width: "100%", display: "flex", flexDirection: "column", gap: 7 }}>
        {rows.map((r, i) => (
          <li key={r.name} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11 }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, flexShrink: 0, backgroundColor: PALETTE[i % PALETTE.length] }} />
            <span style={{ flex: 1, minWidth: 0, color: "#374151" }}>{r.name}</span>
            <span style={{ fontWeight: 700, color: LABEL }}>{r.value}</span>
            <span style={{ width: 32, textAlign: "right", color: "#6B7280" }}>{Math.round((r.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Metric charts: each kind of metric has its own form ── */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PACE_GREY = "#9CA3B8";
const OVER_TARGET = "rgba(22,163,74,0.10)";

/** Months of the chosen year that have happened: all 12 for a past year, otherwise up to this month. */
export function monthsDone(year: string): number {
  const now = new Date();
  return year !== "all" && Number(year) < now.getFullYear() ? 12 : now.getMonth() + 1;
}

const RATE_TARGETS: Record<string, number> = { "SOP Compliance": 80, "Projects on Track": 90, "Reports on Time": 90 };
/** The target for a rate. A rate is compared with this line, never shown as "% of target". */
export const rateTarget = (label: string) => RATE_TARGETS[label] ?? 85;

/** A running total against the straight line to its annual target, with the projection to 31 December. */
export function PaceChart({ label, value, target, year, format, height = 170 }: {
  label: string; value: number; target: number; year: string; format: (n: number) => string; height?: number;
}) {
  const done = monthsDone(year);
  const weights = MONTHS.slice(0, done).map((_, i) => 3 + dummyCount(`${label}|month|${i}|${year}`, 5));
  const sum = weights.reduce((a, b) => a + b, 0);
  let running = 0;
  const rate = value / done;
  const rows = MONTHS.map((name, i) => {
    const month = i + 1;
    if (month <= done) running += weights[i];
    return {
      name,
      Pace: Math.round((target * month) / 12),
      Actual: month <= done ? Math.round((running / sum) * value) : null,
      Projected: month >= done ? Math.round(value + (month - done) * rate) : null,
    };
  });
  const yearEnd = Math.round(value + (12 - done) * rate);
  return (
    <div>
      <p style={{ fontSize: 11, color: "#6B7280", marginBottom: 6 }}>
        <b style={{ fontSize: 17, fontWeight: 800, color: NAVY }}>{format(value)}</b> today · <b style={{ color: NAVY }}>{format(yearEnd)}</b> by 31 Dec · target {format(target)}
      </p>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={rows} margin={{ top: 6, right: 10, bottom: 0, left: -8 }}>
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false} interval={2} />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} width={44} tickFormatter={(v: number) => format(v)} tickCount={3} />
          <Tooltip content={<ChartTip />} />
          <Line dataKey="Pace" name="Even pace" stroke={PACE_GREY} strokeWidth={1.5} dot={false} isAnimationActive={false} />
          <Line dataKey="Projected" name="Projected" stroke={NAVY} strokeWidth={1.5} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
          <Line dataKey="Actual" name="Actual" stroke={NAVY} strokeWidth={2.5} dot={false} isAnimationActive={false} />
          <ReferenceDot x={MONTHS[done - 1]} y={value} r={4} fill={NAVY} stroke="white" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** A rate month by month against its target line. */
export function RateChart({ label, value, year }: { label: string; value: number; year: string }) {
  const done = monthsDone(year);
  const target = rateTarget(label);
  const rows = MONTHS.map((name, i) => ({
    name,
    Rate: i + 1 > done ? null : i + 1 === done ? value : Math.min(100, Math.max(0, value - 7 + dummyCount(`${label}|rate|${i}|${year}`, 14))),
  }));
  const gap = target - value;
  return (
    <div>
      <p style={{ fontSize: 11, color: "#6B7280", marginBottom: 6 }}>
        <b style={{ fontSize: 17, fontWeight: 800, color: NAVY }}>{value}%</b> {gap > 0 ? `${gap} pts below the ${target}% target` : `at or above the ${target}% target`}
      </p>
      <ResponsiveContainer width="100%" height={170}>
        <LineChart data={rows} margin={{ top: 6, right: 10, bottom: 0, left: -18 }}>
          <CartesianGrid vertical={false} stroke={GRID} />
          <ReferenceArea y1={target} y2={100} fill={OVER_TARGET} fillOpacity={1} stroke="none" />
          <ReferenceLine y={target} stroke={NAVY} strokeWidth={1.5} label={{ value: `Target ${target}%`, position: "insideBottomRight", fontSize: 10, fill: LABEL, fontWeight: 700 }} />
          <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false} interval={2} />
          <YAxis domain={[0, 100]} ticks={[0, 50, 100]} tick={AXIS} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
          <Tooltip content={<ChartTip />} />
          <Line dataKey="Rate" name={label} stroke={BLUE} strokeWidth={2.5} dot={false} isAnimationActive={false} />
          <ReferenceDot x={MONTHS[done - 1]} y={value} r={4} fill={BLUE} stroke="white" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const AGE_BANDS = [
  { key: "<30 days", colour: "#9FC9E8" },
  { key: "30–60 days", colour: BLUE },
  { key: ">60 days", colour: NAVY },
];

/** A backlog over the last six months, stacked by how long items have waited. Each backlog has its own scale. */
export function BacklogChart({ item, year }: { item: string; year: string }) {
  const done = monthsDone(year);
  const names = MONTHS.slice(Math.max(0, done - 6), done);
  const latest = dummyAttentionCount(item, year);
  const rows = names.map((name, i) => {
    const isLatest = i === names.length - 1;
    const total = isLatest ? latest : Math.max(1, Math.round(latest * (0.55 + dummyCount(`${item}|total|${name}|${year}`, 60) / 100)));
    const old = Math.round(total * (0.12 + dummyCount(`${item}|old|${name}|${year}`, 25) / 100));
    const mid = Math.round((total - old) * (0.3 + dummyCount(`${item}|mid|${name}|${year}`, 30) / 100));
    return { name, "<30 days": total - old - mid, "30–60 days": mid, ">60 days": old };
  });
  const oldest = rows[rows.length - 1][">60 days"];
  return (
    <div>
      <p style={{ fontSize: 11, color: "#6B7280", marginBottom: 6 }}>
        <b style={{ fontSize: 17, fontWeight: 800, color: NAVY }}>{latest}</b> open · {oldest} waiting over 60 days
      </p>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={rows} margin={{ top: 6, right: 4, bottom: 0, left: -24 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(16,44,94,0.04)" }} />
          {AGE_BANDS.map(b => <Bar key={b.key} dataKey={b.key} name={b.key} stackId="a" fill={b.colour} isAnimationActive={false} />)}
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", paddingTop: 6 }}>
        {AGE_BANDS.map(b => (
          <span key={b.key} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, color: "#6B7280" }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: b.colour }} /> {b.key}
          </span>
        ))}
      </div>
    </div>
  );
}

const usdK = (n: number) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : `$${Math.round(n / 1000).toLocaleString("en-US")}K`;

/** Money against the annual target, split by how certain it is, with the amount expected by now marked. */
function MoneyBar({ year }: { year: string }) {
  const funding = dummyKpi("Funding Secured", "(USD)", year);
  const target = funding.target;
  const secured = funding.num;
  const rest = target - secured;
  const committed = Math.round(rest * (0.25 + dummyCount(`money|committed|${year}`, 20) / 100));
  const pipeline = Math.round(rest * (0.25 + dummyCount(`money|pipeline|${year}`, 20) / 100));
  const gap = target - secured - committed - pipeline;
  const parts = [
    { name: "Secured", value: secured, colour: NAVY },
    { name: "Committed", value: committed, colour: BLUE },
    { name: "Pipeline", value: pipeline, colour: "#9FC9E8" },
    { name: "Gap", value: gap, colour: "#E2E6EF" },
  ];
  const byNowPct = (monthsDone(year) / 12) * 100;
  return (
    <div style={{ minHeight: BODY_HEIGHT, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
      <p style={{ fontSize: 11, color: "#6B7280" }}>
        <b style={{ fontSize: 22, fontWeight: 800, color: NAVY }}>{usdK(secured)}</b> secured of {usdK(target)}
      </p>
      <div style={{ position: "relative", paddingTop: 20 }}>
        <span style={{ position: "absolute", top: 0, left: `${byNowPct}%`, transform: byNowPct > 75 ? "translateX(-100%)" : "translateX(-50%)", fontSize: 10, fontWeight: 700, color: "#B4374A", whiteSpace: "nowrap" }}>
          Target by now {usdK((target * byNowPct) / 100)}
        </span>
        <div style={{ display: "flex", height: 36, gap: 2, borderRadius: 6, overflow: "hidden" }}>
          {parts.map(p => <div key={p.name} title={`${p.name}: ${usdK(p.value)}`} style={{ width: `${(p.value / target) * 100}%`, backgroundColor: p.colour }} />)}
        </div>
        <span style={{ position: "absolute", top: 15, bottom: -5, left: `${byNowPct}%`, width: 2, backgroundColor: "#B4374A" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 6, marginTop: 4 }}>
        {parts.map(p => (
          <div key={p.name}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10.5, color: "#374151" }}>
              <span style={{ width: 9, height: 9, borderRadius: 2, flexShrink: 0, backgroundColor: p.colour }} /> {p.name}
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: LABEL, marginTop: 2 }}>{usdK(p.value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Strategic priorities ────────────────────────────── */

// Status comes from where a priority will finish on its current pace, so it means the same in March and November.
const ON_TRACK_AT = 90;
const AT_RISK_AT = 80;
const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  "On track": { bg: "rgba(22,163,74,0.12)", fg: "#166534" },
  "At risk": { bg: "rgba(224,164,88,0.22)", fg: "#8A5A12" },
  "Off track": { bg: "rgba(209,122,134,0.20)", fg: "#9B3F4E" },
};

function priorities(year: string) {
  const done = monthsDone(year);
  return OVERVIEW_AREAS.map(area => {
    const today = Math.min(100, Math.round(dummyArea(area, year).pct * (done / 12)));
    const yearEnd = Math.min(100, Math.round((today * 12) / done));
    const status = yearEnd >= ON_TRACK_AT ? "On track" : yearEnd >= AT_RISK_AT ? "At risk" : "Off track";
    return { area, today, yearEnd, status };
  }).sort((a, b) => b.yearEnd - a.yearEnd);
}

function StatusBadge({ status }: { status: string }) {
  return <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap", backgroundColor: STATUS_STYLE[status].bg, color: STATUS_STYLE[status].fg }}>{status}</span>;
}

/** Each priority from today to its projected year-end, over the status bands. */
export function PriorityDumbbell({ year }: { year: string }) {
  const byNow = (monthsDone(year) / 12) * 100;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
      {priorities(year).map(p => (
        <div key={p.area} className="grid grid-cols-1 md:grid-cols-[270px_1fr_170px] items-center" style={{ gap: 12 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" }}>{p.area}</span>
          <div style={{ position: "relative", height: 24, display: "flex", borderRadius: 4, overflow: "visible" }}>
            <span style={{ width: `${AT_RISK_AT}%`, backgroundColor: "rgba(209,122,134,0.14)" }} />
            <span style={{ width: `${ON_TRACK_AT - AT_RISK_AT}%`, backgroundColor: "rgba(224,164,88,0.20)" }} />
            <span style={{ flex: 1, backgroundColor: OVER_TARGET }} />
            <span style={{ position: "absolute", top: -4, bottom: -4, left: `${byNow}%`, width: 2, backgroundColor: PACE_GREY }} />
            <span style={{ position: "absolute", top: 11, height: 2, left: `${p.today}%`, width: `${p.yearEnd - p.today}%`, backgroundColor: NAVY }} />
            <span style={{ position: "absolute", top: 5, left: `calc(${p.today}% - 7px)`, width: 14, height: 14, borderRadius: 999, backgroundColor: "white", border: `3px solid ${NAVY}` }} />
            <span style={{ position: "absolute", top: 5, left: `calc(${p.yearEnd}% - 7px)`, width: 14, height: 14, borderRadius: 999, backgroundColor: NAVY }} />
          </div>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontSize: 12.5, color: "#6B7280" }}><b style={{ color: NAVY }}>{p.today}%</b> → <b style={{ color: NAVY }}>{p.yearEnd}%</b></span>
            <StatusBadge status={p.status} />
          </span>
        </div>
      ))}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 10.5, color: "#6B7280", paddingTop: 2 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 999, border: `2px solid ${NAVY}` }} /> Today</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: NAVY }} /> Projected 31 Dec</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 2, height: 12, backgroundColor: PACE_GREY }} /> Expected by now</span>
        <span>Year-end status: on track from {ON_TRACK_AT}%, at risk from {AT_RISK_AT}%</span>
      </div>
    </div>
  );
}

/** The five priorities month by month against even pace, on one scale, with a guide to reading them. */
export function PriorityPace({ year }: { year: string }) {
  const pct = (n: number) => `${Math.round(n)}%`;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" style={{ gap: 16 }}>
      {priorities(year).map(p => (
        <div key={p.area} style={{ backgroundColor: "var(--bg-surface)", borderRadius: 10, border: "1px solid rgba(0,33,71,0.08)", padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start", minHeight: 36, marginBottom: 4 }}>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>{p.area}</p>
            <StatusBadge status={p.status} />
          </div>
          <PaceChart label={p.area} value={p.today} target={100} year={year} format={pct} height={150} />
        </div>
      ))}
      <div style={{ borderRadius: 10, border: "1px dashed rgba(0,33,71,0.22)", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 9, fontSize: 11.5, color: "#374151" }}>
        <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)" }}>How to read these</p>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 18, height: 2.5, backgroundColor: NAVY }} /> Actual, cumulative % of target</span>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 18, borderTop: `2px dashed ${NAVY}` }} /> Projected to 31 Dec at current pace</span>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 18, height: 2, backgroundColor: PACE_GREY }} /> Even pace to reach 100% on 31 Dec</span>
        <p style={{ color: "#6B7280", lineHeight: 1.5 }}>Above the grey line is ahead of pace. A line that flattens shows a slowdown months before the status changes. Values are sample data.</p>
      </div>
    </div>
  );
}

/* ── Pipelines ───────────────────────────────────────── */

/** Stages as joined chevrons. Each stage holds no more than the one before it. */
function Pipeline({ title, sub, year }: { title: string; sub: string; year: string }) {
  const stages = dummyChartRows(title, sub, year);
  const values = stages.map(s => s.value).sort((a, b) => b - a);
  const rows = stages.map((s, i) => ({ name: s.name, value: values[i] }));
  const overall = Math.round((rows[rows.length - 1].value / rows[0].value) * 100);
  return (
    <div style={{ minHeight: BODY_HEIGHT, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
      <div style={{ display: "flex" }}>
        {rows.map((r, i) => (
          <div key={r.name} style={{
            flex: 1, minWidth: 0, height: 78, marginLeft: i === 0 ? 0 : -9,
            display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: STAGE_COLOURS[i % STAGE_COLOURS.length], color: "white", fontSize: 20, fontWeight: 800,
            clipPath: i === 0
              ? "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)"
              : "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)",
          }}>
            {r.value}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))`, gap: 6 }}>
        {rows.map((r, i) => (
          <div key={r.name} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#374151", lineHeight: 1.25 }}>{r.name}</div>
            <div style={{ fontSize: 10, color: "#6B7280", marginTop: 3 }}>
              {i === 0 ? "Start" : `${Math.round((r.value / rows[i - 1].value) * 100)}% moved on`}
            </div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", fontSize: 11, color: "#6B7280" }}>
        <b style={{ color: LABEL, fontSize: 13 }}>{overall}%</b> reach the final stage
      </div>
    </div>
  );
}

/** Grant applications split into where they are now. */
function Segments({ title, year }: { title: string; year: string }) {
  const parts = ["Under Review", "Awarded", "Rejected"].map((name, i) => ({
    name, value: between(`${title}|${name}|${year}`, 6, 34), colour: [BLUE, NAVY, PINK][i],
  }));
  const applied = parts.reduce((sum, p) => sum + p.value, 0);
  return (
    <div style={{ minHeight: BODY_HEIGHT, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 30, fontWeight: 800, color: NAVY, lineHeight: 1 }}>{applied}</span>
        <span style={{ fontSize: 12, color: "#6B7280" }}>grants applied for</span>
      </div>
      <div style={{ display: "flex", height: 34, borderRadius: 8, overflow: "hidden", gap: 2 }}>
        {parts.map(p => (
          <div key={p.name} title={`${p.name}: ${p.value}`} style={{ width: `${(p.value / applied) * 100}%`, backgroundColor: p.colour, color: "white", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {p.value}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
        {parts.map(p => (
          <div key={p.name}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, fontWeight: 700, color: "#374151" }}>
              <span style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: p.colour }} /> {p.name}
            </div>
            <div style={{ fontSize: 10, color: "#6B7280", marginTop: 2 }}>{Math.round((p.value / applied) * 100)}% of applications</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Change over time ────────────────────────────────── */

function Lines({ title, year }: { title: string; year: string }) {
  const { rows, series } = seriesRows(title, year);
  return (
    <>
      <ResponsiveContainer width="100%" height={BODY_HEIGHT - 22}>
        <LineChart data={rows} margin={{ top: 12, right: 14, bottom: 0, left: -12 }}>
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="name" tick={CATEGORY_AXIS} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<ChartTip />} />
          {series.map((s, i) => (
            <Line key={s} type="monotone" dataKey={s} name={s} stroke={PALETTE[i]} strokeWidth={2.5}
              strokeDasharray={s === "Last year" ? "5 4" : undefined} dot={{ r: 3, strokeWidth: 0, fill: PALETTE[i] }} isAnimationActive={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <SeriesLegend names={series} />
    </>
  );
}

function Areas({ title, year }: { title: string; year: string }) {
  const { rows, series } = seriesRows(title, year);
  return (
    <>
      <ResponsiveContainer width="100%" height={BODY_HEIGHT - 22}>
        <AreaChart data={rows} margin={{ top: 12, right: 14, bottom: 0, left: -8 }}>
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="name" tick={CATEGORY_AXIS} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<ChartTip />} />
          {series.map((s, i) => (
            <Area key={s} type="monotone" dataKey={s} name={s} stackId="a" stroke={PALETTE[i]} fill={PALETTE[i]} fillOpacity={0.72} isAnimationActive={false} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <SeriesLegend names={series} />
    </>
  );
}

function Stacked({ title, year }: { title: string; year: string }) {
  const { rows, series } = seriesRows(title, year);
  return (
    <>
      <ResponsiveContainer width="100%" height={BODY_HEIGHT - 22}>
        <BarChart data={rows} margin={{ top: 20, right: 8, bottom: 0, left: -12 }} barCategoryGap="34%">
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="name" tick={CATEGORY_AXIS} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(16,44,94,0.04)" }} />
          {series.map((s, i) => {
            const last = i === series.length - 1;
            return (
              <Bar key={s} dataKey={s} name={s} stackId="s" fill={PALETTE[i]} radius={last ? [4, 4, 0, 0] : undefined} isAnimationActive={false}>
                {last && <LabelList dataKey="Total" position="top" fontSize={10} fill={LABEL} fontWeight={700} />}
              </Bar>
            );
          })}
        </BarChart>
      </ResponsiveContainer>
      <SeriesLegend names={series} />
    </>
  );
}

/* ── Comparisons ─────────────────────────────────────── */

function SkillsRadar({ title, sub, year }: { title: string; sub: string; year: string }) {
  const rows = dummyChartRows(title, sub, year);
  return (
    <ResponsiveContainer width="100%" height={BODY_HEIGHT}>
      <RadarChart data={rows} outerRadius="68%">
        <PolarGrid stroke={GRID} />
        <PolarAngleAxis dataKey="name" tick={{ fontSize: 9.5, fill: "#374151" }} />
        <Tooltip content={<ChartTip />} />
        <Radar dataKey="value" name="Research staff" stroke={NAVY} fill={BLUE} fillOpacity={0.45} strokeWidth={2} dot={{ r: 3, fill: NAVY, strokeWidth: 0 }} isAnimationActive={false} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

/** Horizontal bars against the 80% target. Processes under target are marked in pink. */
function TargetBars({ title, sub, year }: { title: string; sub: string; year: string }) {
  const rows = dummyChartRows(title, sub, year).map(r => ({ name: r.name, value: between(`${title}|${r.name}|${year}`, 58, 98) }));
  return (
    <ResponsiveContainer width="100%" height={BODY_HEIGHT}>
      <BarChart data={rows} layout="vertical" margin={{ top: 18, right: 34, bottom: 0, left: 0 }}>
        <CartesianGrid horizontal={false} stroke={GRID} />
        <XAxis type="number" domain={[0, 100]} tick={AXIS} tickFormatter={(v: number) => `${v}%`} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={108} tick={{ fontSize: 10.5, fill: "#374151" }} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(16,44,94,0.04)" }} />
        <ReferenceLine x={80} stroke={NAVY} strokeDasharray="4 3" label={{ value: "80% target", position: "top", fontSize: 10, fill: LABEL, fontWeight: 700 }} />
        <Bar dataKey="value" name="Compliance" radius={[0, 4, 4, 0]} barSize={16} isAnimationActive={false}>
          {rows.map(r => <Cell key={r.name} fill={r.value >= 80 ? BLUE : PINK} />)}
          <LabelList dataKey="value" position="right" fontSize={10} fill={LABEL} fontWeight={700} formatter={(v: number) => `${v}%`} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function Ranked({ title, sub, year }: { title: string; sub: string; year: string }) {
  const rows = [...dummyChartRows(title, sub, year)].sort((a, b) => b.value - a.value);
  return (
    <ResponsiveContainer width="100%" height={BODY_HEIGHT}>
      <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 34, bottom: 0, left: 0 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={128} tick={{ fontSize: 10.5, fill: "#374151" }} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(16,44,94,0.04)" }} />
        <Bar dataKey="value" name="Count" fill={BLUE} radius={[0, 4, 4, 0]} barSize={18} isAnimationActive={false}>
          <LabelList dataKey="value" position="right" fontSize={10} fill={LABEL} fontWeight={700} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function Columns({ title, sub, year }: { title: string; sub: string; year: string }) {
  const rows = dummyChartRows(title, sub, year);
  return (
    <ResponsiveContainer width="100%" height={BODY_HEIGHT}>
      <BarChart data={rows} margin={{ top: 20, right: 8, bottom: 0, left: -16 }} barCategoryGap="30%">
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="name" tick={{ fontSize: 9.5, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} interval={0} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(16,44,94,0.04)" }} />
        <Bar dataKey="value" name="Attendees" fill={BLUE} radius={[4, 4, 0, 0]} isAnimationActive={false}>
          <LabelList dataKey="value" position="top" fontSize={10} fill={LABEL} fontWeight={700} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ── Timeline, stories and heat map ──────────────────── */

const CAPABILITIES = ["Research methods lab", "Grant writing unit", "Data analytics team", "Policy briefing service"];
const CAPABILITY_STATUS = ["Live", "Scaling", "Piloting"];

function Timeline({ year }: { year: string }) {
  return (
    <ol style={{ listStyle: "none", margin: 0, padding: 0, minHeight: BODY_HEIGHT, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      {CAPABILITIES.map((name, i) => {
        const status = CAPABILITY_STATUS[dummyCount(`Capability|${name}|${year}`, 2)];
        return (
          <li key={name} style={{ display: "flex", gap: 12, flex: 1 }}>
            <span style={{ width: 26, fontSize: 10.5, fontWeight: 800, color: LABEL, paddingTop: 2 }}>Q{i + 1}</span>
            <span style={{ position: "relative", width: 12, flexShrink: 0 }}>
              {i < CAPABILITIES.length - 1 && <span style={{ position: "absolute", left: 5, top: 12, bottom: -3, width: 2, backgroundColor: "rgba(71,155,214,0.4)" }} />}
              <span style={{ position: "absolute", left: 0, top: 3, width: 12, height: 12, borderRadius: 999, backgroundColor: status === "Live" ? NAVY : BLUE, border: "2px solid white", boxShadow: `0 0 0 1px ${BLUE}` }} />
            </span>
            <span style={{ flex: 1, minWidth: 0, display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" }}>{name}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: LABEL, backgroundColor: "rgba(71,155,214,0.14)", borderRadius: 999, padding: "2px 8px", flexShrink: 0 }}>{status}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

const STORIES = [
  { change: "Maternal care guideline adopted", role: "Technical advice" },
  { change: "Digital referral service launched", role: "Evidence review" },
  { change: "Health workforce training scaled", role: "Training" },
  { change: "Community health protocol updated", role: "Technical advice" },
];

function Stories() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 10, minHeight: BODY_HEIGHT }}>
      {STORIES.map(s => (
        <div key={s.change} style={{ padding: 12, borderRadius: 8, border: "1px solid rgba(0,33,71,0.10)", borderLeft: `3px solid ${BLUE}`, display: "flex", flexDirection: "column", gap: 6 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.35 }}>{s.change}</p>
          <p style={{ fontSize: 10.5, color: "#6B7280" }}>CHII role: {s.role}</p>
          <p style={{ fontSize: 10.5, fontWeight: 700, color: LABEL, marginTop: "auto" }}>View evidence ↗</p>
        </div>
      ))}
    </div>
  );
}

const RISK_LEVELS = ["Low", "Medium", "High"];
// Colour of a cell by its risk score (likelihood + impact, 0 to 4): green for low, through amber, to red for high.
const RISK_COLOURS = ["#D1FAE5", "#FEF3C7", "#FDE68A", "#FCA5A5", "#F87171"];

/** A 3 × 3 heat map of risks by likelihood (down) and impact (across). Each cell shows how many risks it holds. */
function RiskHeatMap({ year }: { year: string }) {
  const rows = [2, 1, 0]; // High likelihood at the top
  return (
    <div style={{ minHeight: BODY_HEIGHT, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "56px repeat(3, 1fr)", gridTemplateRows: "repeat(3, 1fr) auto", gap: 6, height: 200 }}>
        {rows.map(li => (
          <Fragment key={li}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6, fontSize: 11, fontWeight: 600, color: "#374151" }}>
              {RISK_LEVELS[li]}
            </div>
            {[0, 1, 2].map(ii => {
              const count = dummyCount(`Risk Heat Map|${year}|${li}|${ii}`, 9);
              return (
                <div key={ii} title={`${RISK_LEVELS[li]} likelihood, ${RISK_LEVELS[ii].toLowerCase()} impact: ${count} risks`}
                  style={{ borderRadius: 6, backgroundColor: RISK_COLOURS[li + ii], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: NAVY }}>
                  {count}
                </div>
              );
            })}
          </Fragment>
        ))}
        <div />
        {[0, 1, 2].map(ii => (
          <div key={ii} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "#374151" }}>{RISK_LEVELS[ii]}</div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "0 4px" }}>
        <span style={{ fontSize: 10, color: "#6B7280" }}>Likelihood (down) · Impact (across)</span>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 10, color: "#6B7280" }}>Low</span>
          {RISK_COLOURS.map(c => <span key={c} style={{ width: 14, height: 10, borderRadius: 2, backgroundColor: c, display: "inline-block" }} />)}
          <span style={{ fontSize: 10, color: "#6B7280" }}>High</span>
        </div>
      </div>
    </div>
  );
}

/** Draws a chart in the form that suits its data. */
export function AluChartView({ title, sub, year }: { title: string; sub: string; year: string }) {
  switch (KINDS[title] ?? "ranked") {
    case "pipeline": return <Pipeline title={title} sub={sub} year={year} />;
    case "segments": return <Segments title={title} year={year} />;
    // Pies and donuts only for three slices or fewer; longer breakdowns read better as ranked bars.
    case "donut":
    case "pie": {
      const rows = dummyChartRows(title, sub, year);
      return rows.length > 3 ? <Ranked title={title} sub={sub} year={year} /> : <PartToWhole rows={rows} hole={KINDS[title] === "donut"} />;
    }
    case "line": return <Lines title={title} year={year} />;
    case "area": return <Areas title={title} year={year} />;
    case "stacked": return <Stacked title={title} year={year} />;
    case "radar": return <SkillsRadar title={title} sub={sub} year={year} />;
    case "gauge": return <MoneyBar year={year} />;
    case "target-bars": return <TargetBars title={title} sub={sub} year={year} />;
    case "columns": return <Columns title={title} sub={sub} year={year} />;
    case "timeline": return <Timeline year={year} />;
    case "stories": return <Stories />;
    case "heatmap": return <RiskHeatMap year={year} />;
    default: return <Ranked title={title} sub={sub} year={year} />;
  }
}
