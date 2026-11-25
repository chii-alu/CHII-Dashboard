"use client";
// The HEMP page Filters panel: the two-step period picker (same as At a Glance), then any page-specific
// filters as dropdowns. A filter whose list holds only its "All" option is hidden (nothing to pick yet).
import { FilterDropdown } from "@/components/hemp/filter-dropdown";
import { PeriodPicker } from "@/components/filters/period-picker";

const BRAND = "#14306B";
const BRAND_DK = "#0E2A5C";
const LIGHT_BORDER = "rgba(20,48,107,0.12)";

export interface ExtraFilter {
  label: string;
  value: string;
  setValue: (value: string) => void;
  /** The first option is the "All" option. */
  options: string[];
}

export function PeriodFilterPanel({
  isOpen, period, onPeriodChange, extraFilters = [], onReset,
}: {
  isOpen: boolean;
  period: string;
  onPeriodChange: (value: string) => void;
  extraFilters?: ExtraFilter[];
  onReset: () => void;
}) {
  const shown = extraFilters.filter(f => f.options.length > 1);
  return (
    <FilterDropdown isOpen={isOpen} onResetFilters={onReset}>
      <PeriodPicker value={period} onChange={onPeriodChange} accent={BRAND} dark={BRAND_DK} border={LIGHT_BORDER} />
      {shown.map(f => (
        <label key={f.label} style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 12 }}>
          <span style={{ fontSize: 9.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.label}</span>
          <select
            value={f.value}
            onChange={e => f.setValue(e.target.value)}
            style={{ width: "100%", fontSize: 12, border: `1px solid ${BRAND}26`, borderRadius: 6, padding: "7px 9px", color: BRAND, backgroundColor: "var(--bg-surface)", cursor: "pointer", fontFamily: "inherit" }}
          >
            {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </label>
      ))}
    </FilterDropdown>
  );
}
