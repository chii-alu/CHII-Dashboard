"use client";
// Two-step period filter: pick a year first, then (for years reported in halves) Full Year, H1 or H2.
// The value is the same period label used everywhere (see lib/filter-years), so pages filter as before.
import { ALL_PERIODS, FILTER_YEARS, HALF_YEARS, PERIOD_FILTER_OPTIONS, parsePeriod, type Half } from "@/lib/filter-years";

/** True when an option list is the period list, so a renderer should show the PeriodPicker instead. */
export function isPeriodOptions(options: readonly unknown[] | null | undefined): boolean {
  if (!options) return false;
  return options.some(o => (typeof o === "object" && o !== null ? (o as { label?: unknown }).label : o) === ALL_PERIODS);
}

/** The period label for a year and half (null = the whole year). */
export function periodLabelFor(year: number, half: Half | null): string {
  if (!HALF_YEARS.includes(year)) return String(year);
  const want = half ? `${half} ${year}` : `${year} (Full Year)`;
  return PERIOD_FILTER_OPTIONS.find(l => l.startsWith(want)) ?? String(year);
}

export function PeriodPicker({
  value, onChange, allValue = ALL_PERIODS, accent = "#14306B", dark = accent, border = "rgba(0,33,71,0.12)",
  variant = "pills", padding, hideYearHeading = false,
}: {
  value: string;
  onChange: (value: string) => void;
  /** The value that means Cumulative Total ("Cumulative Total" for string filters, "all" for executive filters). */
  allValue?: string;
  accent?: string;
  dark?: string;
  border?: string;
  /** pills: year buttons; select: a year dropdown. Both show Full Year / H1 / H2 buttons below for 2026–2030. */
  variant?: "pills" | "select";
  padding?: number | string;
  /** Leave out the "Year" heading when the renderer already shows the filter's label. */
  hideYearHeading?: boolean;
}) {
  const { year, half } = parsePeriod(value === allValue ? null : value);
  const hasHalves = year !== null && HALF_YEARS.includes(year);

  const chip = (selected: boolean) => ({
    fontSize: 10, fontWeight: selected ? 700 : 500, padding: "5px 10px", borderRadius: 6, cursor: "pointer",
    border: `1px solid ${selected ? accent : border}`, backgroundColor: selected ? accent : "white",
    color: selected ? "white" : dark, transition: "all 0.15s ease", whiteSpace: "nowrap" as const,
  });
  const heading = { fontSize: 9.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.05em", margin: "0 0 6px 0" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding, minWidth: padding !== undefined ? 300 : 0, flex: "1 1 100%", width: "100%", boxSizing: "border-box" }} onClick={e => e.stopPropagation()}>
      <div>
        {variant === "pills" && !hideYearHeading && <p style={heading}>Year</p>}
        {variant === "pills" ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <button type="button" style={chip(year === null)} onClick={() => onChange(allValue)}>{ALL_PERIODS}</button>
            {FILTER_YEARS.map(y => (
              <button key={y} type="button" style={chip(year === y)} onClick={() => onChange(periodLabelFor(y, null))}>{y}</button>
            ))}
          </div>
        ) : (
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={heading}>Year</span>
            <select
              value={year === null ? "all" : String(year)}
              onChange={e => onChange(e.target.value === "all" ? allValue : periodLabelFor(Number(e.target.value), null))}
              style={{ width: "100%", fontSize: 12, border: `1px solid ${accent}26`, borderRadius: 6, padding: "7px 9px", color: accent, backgroundColor: "var(--bg-surface)", cursor: "pointer" }}
            >
              <option value="all">{ALL_PERIODS}</option>
              {FILTER_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
        )}
      </div>

      {hasHalves && (
        <div>
          <p style={heading}>Period in {year}</p>
          <div style={{ display: "flex", gap: 6 }}>
            {([null, "H1", "H2"] as (Half | null)[]).map(h => (
              <button key={h ?? "full"} type="button" style={{ ...chip(half === h), flex: variant === "select" ? 1 : undefined }}
                onClick={() => onChange(periodLabelFor(year!, h))}>
                {h === null ? "Full Year" : h === "H1" ? "H1 (Jan–Jun)" : "H2 (Jul–Dec)"}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
