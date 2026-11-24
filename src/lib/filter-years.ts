// Reporting periods offered in every year filter across the dashboards.
// 2025 is reported as a whole year; from 2026 each year is reported in halves, so 2026–2030 offer
// the full year, H1 (Jan–Jun) and H2 (Jul–Dec). "Cumulative Total" means all periods together.
//
// In the database a period is stored as `year` plus `period`: `period` is "H1" or "H2" for a half,
// and empty for a whole year. Rows with no year are the cumulative totals.

export const FILTER_YEARS = [2025, 2026, 2027, 2028, 2029, 2030];
/** Years reported in halves. */
export const HALF_YEARS = FILTER_YEARS.filter(y => y >= 2026);

export type Half = "H1" | "H2";

/** The "all periods" option. */
export const ALL_PERIODS = "Cumulative Total";
/** Shown in headers and footers when all periods are selected. */
export const FULL_PERIOD_TEXT = "2025–2030";

const halfLabel = (half: Half, year: number) => `${half} ${year} (${half === "H1" ? "Jan–Jun" : "Jul–Dec"})`;

/** Every period option label, in order: 2025, then per year the full year, H1 and H2. */
export const PERIOD_LABELS: string[] = FILTER_YEARS.flatMap(y =>
  HALF_YEARS.includes(y) ? [`${y} (Full Year)`, halfLabel("H1", y), halfLabel("H2", y)] : [String(y)]
);

/** Options for string-valued filters: Cumulative Total first, then each period. */
export const PERIOD_FILTER_OPTIONS: string[] = [ALL_PERIODS, ...PERIOD_LABELS];

/** Options for value/label filters (FilterSelect): "all" is Cumulative Total; each period's value is its label. */
export const PERIOD_SELECT_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: ALL_PERIODS },
  ...PERIOD_LABELS.map(label => ({ value: label, label })),
];

export type Period = { year: number | null; half: Half | null };

/** Reads a period from a filter label ("H1 2026 (Jan–Jun)"), an API code ("2026-H1") or a year ("2026"). */
export function parsePeriod(value: string | number | null | undefined): Period {
  if (value == null) return { year: null, half: null };
  const text = String(value);
  const year = text.match(/\b(20\d{2})\b/);
  if (!year) return { year: null, half: null };
  const half = text.match(/\b(H[12])\b/);
  return { year: Number(year[1]), half: (half?.[1] as Half) ?? null };
}

export const isAllPeriods = (value: string | number | null | undefined) => parsePeriod(value).year === null;

/** Compact form for API query strings: "2026", "2026-H1", or "" for all periods. */
export function periodParam(value: string | number | null | undefined): string {
  const { year, half } = parsePeriod(value);
  if (year === null) return "";
  return half ? `${year}-${half}` : String(year);
}

/** "?year=2026-H1" or "" — the query suffix the year-aware APIs accept. */
export const periodQuery = (value: string | number | null | undefined, sep: "?" | "&" = "?") => {
  const p = periodParam(value);
  return p ? `${sep}year=${p}` : "";
};

/** Header/footer text for the chosen period. */
export function periodText(value: string | number | null | undefined): string {
  const { year, half } = parsePeriod(value);
  if (year === null) return FULL_PERIOD_TEXT;
  return half ? halfLabel(half, year) : String(year);
}

/** The half a month (1–12) falls in. */
export const halfOfMonth = (month: number): Half => (month <= 6 ? "H1" : "H2");

/**
 * Whether a record from `year` (and, if known, its half or a date) falls in the chosen period.
 * A half-year filter only matches records whose half is known; year-only records match the full year.
 */
export function inPeriod(value: string | number | null | undefined, year: number | null | undefined, half?: Half | string | Date | null): boolean {
  const p = parsePeriod(value);
  if (p.year === null) return true;
  if (year == null || Number(year) !== p.year) return false;
  if (!p.half) return true;
  const recordHalf = half instanceof Date ? halfOfMonth(half.getMonth() + 1) : half;
  return recordHalf === p.half;
}

/**
 * For database rows (year + period): Cumulative Total matches the rows with no year; a whole year matches
 * that year's whole-year rows; a half matches that year's rows for the half.
 */
export function rowInPeriod(value: string | number | null | undefined, row: { year?: number | null; period?: string | null }): boolean {
  const p = parsePeriod(value);
  if (p.year === null) return row.year == null;
  if (row.year == null || Number(row.year) !== p.year) return false;
  return p.half ? row.period === p.half : !row.period;
}
