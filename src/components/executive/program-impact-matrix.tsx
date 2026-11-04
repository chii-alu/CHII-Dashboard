"use client";
import { useState } from "react";

const YEARS = [2021, 2022, 2023, 2024, 2025, 2026] as const;
type YearVal = typeof YEARS[number] | "all";

function fmt(n: number) { return Math.round(n).toLocaleString(); }

/* round an axis max up to a clean 1/2/5 × 10^n step */
function niceCeil(n: number): number {
  if (n <= 0) return 10;
  const pow = Math.pow(10, Math.floor(Math.log10(n)));
  const f = n / pow;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nice * pow;
}

const SEL: React.CSSProperties = {
  fontSize: 10, border: "1px solid rgba(0,33,71,0.12)", borderRadius: 5,
  padding: "2px 6px", color: "#374151", backgroundColor: "white", cursor: "pointer",
};

/* Outcome pathways — these are the headline goals on the stats cards */
const WAGE = "#102C5E";   // Wage Employment  — theme navy
const ENT  = "#479BD6";   // Entrepreneurs    — theme light blue
const EDU  = "#D45F2C";   // Further Education — theme orange

/* Outcomes by programme and pathway come from Supabase; until they load the chart shows "In coming data". */
const chartData: { name: string; wage: number; ent: number; edu: number; total: number }[] = [];

export default function ProgramImpactMatrix() {
  const [year, setYear] = useState<YearVal>("all");

  return (
    <div style={{ backgroundColor: "white", borderRadius: 10, border: "1px solid rgba(0,33,71,0.08)", overflow: "hidden" }}>
      {/* Navy heading band */}
      <div style={{ backgroundColor: "#14306B", padding: "11px 20px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 3, height: 15, borderRadius: 999, backgroundColor: "#D17A86", flexShrink: 0 }} />
        <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "white" }}>Program Impact Matrix</p>
      </div>
      <div style={{ padding: "16px 24px 20px" }}>
      {/* Description + filter row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ fontSize: 10, color: "#9CA3AF" }}>Youth-in-work outcomes each program delivers — by pathway</p>
        <select value={String(year)} onChange={e => setYear(e.target.value === "all" ? "all" : Number(e.target.value) as YearVal)} style={SEL}>
          <option value="all">All years</option>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", fontSize: 14 }}>In coming data</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 6 }}>
        {([
          { label: "Wage Employment", color: WAGE },
          { label: "Entrepreneurs",   color: ENT },
          { label: "Further Education", color: EDU },
        ] as { label: string; color: string }[]).map(c => (
          <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, backgroundColor: c.color }} />
            <span style={{ fontSize: 10, color: "#6B7280" }}>{c.label}</span>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
