export type ProgressRow = {
  metric: string;
  unit: string; // "percent" | "count" | "score" | "currency_usd" | "months"
  actual: number | null;
  target: number | null;
  progress_pct: number | null;
};
export type ProgressStatus = "met" | "close" | "behind" | "no-data" | "no-target";
export type ProgressInsight = { barPct: number | null; caption: string; status: ProgressStatus };

const CLOSE_FROM = 75; // 75% of target or more counts as "close"

export function formatValue(value: number, unit: string): string {
  switch (unit) {
    case "percent": return `${round(value, 1)}%`;
    case "currency_usd": return `$${Math.round(value).toLocaleString()}`;
    case "score": return `${round(value, 1)}`;
    case "months": return `${round(value, 1)} months`;
    default: return Math.round(value).toLocaleString();
  }
}

function round(n: number, dp: number): string {
  const f = 10 ** dp;
  return String(Math.round(n * f) / f);
}

function gapText(gap: number, target: number, unit: string): string {
  if (unit === "percent") return `${round(gap, 1)} pts to go`;
  if (unit === "score") return `${round(gap, 1)} below the ${formatValue(target, unit)} target`;
  return `${formatValue(Math.ceil(gap), unit)} more to reach ${formatValue(target, unit)}`;
}

export function progressInsight(row?: ProgressRow | null): ProgressInsight {
  if (!row || row.target == null) return { barPct: null, caption: "No target set", status: "no-target" };
  const target = formatValue(row.target, row.unit);
  if (row.actual == null) return { barPct: 0, caption: `Target ${target} · awaiting data`, status: "no-data" };

  const pct = row.progress_pct ?? (row.target ? (100 * row.actual) / row.target : 0);
  const barPct = Math.max(0, Math.min(100, pct));
  if (pct >= 100) {
    return { barPct, caption: `Target met · ${formatValue(row.actual, row.unit)} vs ${target} target`, status: "met" };
  }
  const gap = row.target - row.actual;
  return {
    barPct,
    caption: `${Math.round(pct)}% of target · ${gapText(gap, row.target, row.unit)}`,
    status: pct >= CLOSE_FROM ? "close" : "behind",
  };
}
