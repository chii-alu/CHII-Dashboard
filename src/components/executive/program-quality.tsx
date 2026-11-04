"use client";
import { useState } from "react";

const YEARS = [2021, 2022, 2023, 2024, 2025, 2026] as const;
type YearVal = typeof YEARS[number] | "all";

const SEL: React.CSSProperties = {
  fontSize: 10, border: "1px solid rgba(0,33,71,0.12)", borderRadius: 5,
  padding: "2px 6px", color: "#374151", backgroundColor: "white", cursor: "pointer",
};

/* Programmes shown in the index. Their sub-metrics come from Supabase; until they load, each row shows "In coming data". */
const PROGRAMS = ["HealthX", "Internships", "Masterclasses", "Field Visits", "Mentorship"];

const SUBS = [
  { key: "completion",   label: "Completion" },
  { key: "conversion",   label: "Conversion" },
  { key: "retention",    label: "Retention" },
  { key: "satisfaction", label: "Satisfaction" },
] as const;

function scoreColor(s: number): string {
  if (s >= 80) return "#102C5E";
  if (s >= 70) return "#479BD6";
  if (s >= 60) return "#D45F2C";
  return "#A81B2D";
}

export default function ProgramQuality() {
  const [year, setYear] = useState<YearVal>("all");
  const [hover, setHover] = useState<string | null>(null);

  // Sub-metrics are not loaded from Supabase yet, so no programme has an index.
  const programs = PROGRAMS.map(name => ({ name, index: null as number | null, satRaw: null as number | null }));

  return (
    <div style={{ backgroundColor: "white", borderRadius: 10, border: "1px solid rgba(0,33,71,0.08)", minHeight: 400, overflow: "hidden" }}>
      {/* Navy heading band */}
      <div style={{ backgroundColor: "#14306B", padding: "11px 20px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 3, height: 15, borderRadius: 999, backgroundColor: "#D17A86", flexShrink: 0 }} />
        <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "white" }}>Program Quality</p>
      </div>
      <div style={{ padding: "16px 28px 22px" }}>
      {/* Description + filter row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <p style={{ fontSize: 10, color: "#9CA3AF" }}>Effectiveness Index — how well each program drives the headline goals</p>
        <select value={String(year)} onChange={e => setYear(e.target.value === "all" ? "all" : Number(e.target.value) as YearVal)} style={SEL}>
          <option value="all">All years</option>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {programs.map((p, i) => {
        const clr = p.index === null ? "#9CA3AF" : scoreColor(p.index);
        return (
          <div
            key={p.name}
            onMouseEnter={() => setHover(p.name)}
            onMouseLeave={() => setHover(null)}
            style={{ marginBottom: i < programs.length - 1 ? 16 : 0, position: "relative" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <p style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>{p.name}</p>
              <p style={{ fontSize: p.index === null ? 10 : 13, fontWeight: 800, color: clr }}>{p.index === null ? "In coming data" : <>{p.index}<span style={{ fontSize: 9, color: "#9CA3AF", fontWeight: 600 }}>/100</span></>}</p>
            </div>
            <div style={{ height: 8, borderRadius: 4, backgroundColor: "rgba(0,33,71,0.06)", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 4, backgroundColor: clr, width: `${p.index === null ? 0 : Math.min(p.index, 100)}%`, transition: "width 0.5s ease" }} />
            </div>

            {/* sub-metric breakdown on hover */}
            {hover === p.name && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 4px)", zIndex: 20,
                backgroundColor: "white", border: "1px solid rgba(0,33,71,0.1)", borderRadius: 7,
                padding: "9px 12px", boxShadow: "0 6px 20px rgba(0,0,0,0.12)", minWidth: 168,
              }}>
                {SUBS.map(s => (
                  <div key={s.key} style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 11, marginBottom: 3 }}>
                    <span style={{ color: "#6B7280" }}>{s.label}</span>
                    <b style={{ color: "#14306B" }}>In coming data</b>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Legend — score-band colour key */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 18, paddingTop: 14 }}>
        {([
          { label: "80–100 · Excellent", color: "#102C5E" },
          { label: "70–79 · Good",       color: "#479BD6" },
          { label: "60–69 · Fair",       color: "#D45F2C" },
          { label: "Below 60 · Needs attention", color: "#A81B2D" },
        ] as { label: string; color: string }[]).map(l => (
          <span key={l.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#6B7280" }}>
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, backgroundColor: l.color, flexShrink: 0 }} />
            {l.label}
          </span>
        ))}
      </div>
      </div>
    </div>
  );
}
