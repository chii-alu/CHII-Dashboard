// Executive "Key Performance Insights", calculated from the synced workbook data
// instead of being typed into the workbook. Each card follows the period filter
// (Cumulative Total, a year, or a half). A card whose inputs are missing shows
// "In coming data" - nothing is defaulted to 0.
import { parsePeriod, rowInPeriod, type Half } from "@/lib/filter-years";
import { isMetric } from "@/lib/progressLabels";

export interface MetricRow {
  section: string;
  metric: string;
  value_type: string;
  year: number | null;
  period: string | null;
  segment: string;
  label?: string | null;
  breakdown?: string | null;
  country?: string | null;
  value: number | null;
}

export interface ExecInsight {
  key: string;
  title: string;
  figure: string | null;   // the big number; null = "In coming data"
  detail: string;          // what the figure is
  copy: string;            // supporting context
}

/** Gender parity: the Executive target for female participation. */
export const GENDER_PARITY_TARGET = 50;

const pct = (part: number, whole: number) => (part / whole) * 100;
const fmtPct = (n: number) => `${Math.round(n)}%`;
const fmtNum = (n: number) => Math.round(n).toLocaleString("en-US");
const fmtChange = (n: number) => `${n >= 0 ? "+" : "−"}${Math.abs(Math.round(n))}%`;

type Slot = { year: number | null; half: Half | null };

/** The period to compare with: H2 -> H1 of the same year; H1 -> H2 of the year before;
 *  a year -> the year before; cumulative -> the latest year with data vs the year before it. */
function previousOf(p: Slot): Slot | null {
  if (p.year === null) return null;
  if (p.half === "H2") return { year: p.year, half: "H1" };
  if (p.half === "H1") return { year: p.year - 1, half: "H2" };
  return { year: p.year - 1, half: null };
}

const slotLabel = (s: Slot) => (s.year === null ? "to date" : s.half ? `${s.half} ${s.year}` : String(s.year));
const slotValue = (s: Slot) => (s.year === null ? null : s.half ? `${s.half} ${s.year}` : String(s.year));

export function computeExecInsights(rows: MetricRow[], periodValue: string | null): ExecInsight[] {
  const p = parsePeriod(periodValue);
  const actual = rows.filter(r => r.value_type === "actual" && r.value !== null);

  /** A headline figure for a period (segment 'all' unless given, no table label). */
  const get = (section: string, metric: string, slot: Slot, segment = "all"): number | null => {
    const want = slotValue(slot);
    const row = actual.find(r => r.section === section && isMetric(r.metric, metric) && r.segment === segment
      && !r.label && !r.breakdown && rowInPeriod(want, r));
    return row ? Number(row.value) : null;
  };
  const target = (section: string, metric: string, slot: Slot): number | null => {
    const want = slotValue(slot);
    const row = rows.find(r => r.value_type === "target" && r.section === section && isMetric(r.metric, metric)
      && r.segment === "all" && !r.label && rowInPeriod(want, r));
    return row?.value != null ? Number(row.value) : null;
  };
  /** Table rows (label -> value) for a period. */
  const table = (section: string, metric: string, slot: Slot): Map<string, number> => {
    const want = slotValue(slot);
    const out = new Map<string, number>();
    actual.filter(r => r.section === section && isMetric(r.metric, metric) && r.segment === "all" && r.label
      && rowInPeriod(want, r)).forEach(r => out.set(String(r.label), Number(r.value)));
    return out;
  };

  // For cumulative, "growth" compares the two most recent years that have outreach data.
  const now: Slot = { year: p.year, half: p.half };
  const yearsWithData = Array.from(new Set(actual
    .filter(r => r.section === "At a Glance" && isMetric(r.metric, "Total Work-Enabling Outreach") && r.year !== null && !r.period)
    .map(r => Number(r.year)))).sort((a, b) => a - b);
  const latestYear = yearsWithData[yearsWithData.length - 1] ?? null;
  const cmpNow: Slot = p.year === null ? { year: latestYear, half: null } : now;
  const cmpPrev: Slot | null = p.year === null
    ? (latestYear !== null ? { year: latestYear - 1, half: null } : null)
    : previousOf(now);
  const growth = (section: string, metric: string): { text: string } | null => {
    if (cmpNow.year === null || !cmpPrev) return null;
    const a = get(section, metric, cmpNow);
    const b = get(section, metric, cmpPrev);
    if (a === null || b === null || b === 0) return null;
    return { text: `${fmtChange(pct(a - b, b))} ${slotLabel(cmpNow)} vs ${slotLabel(cmpPrev)}` };
  };

  const OUTREACH = "Total Work-Enabling Outreach";
  const YOUTH = "Youth in Work (Total)";
  const insights: ExecInsight[] = [];

  // 1. Gender balance: female share of everyone reached, against parity.
  {
    const total = get("At a Glance", OUTREACH, now);
    const female = get("At a Glance", OUTREACH, now, "female");
    const yTotal = get("At a Glance", YOUTH, now);
    const yFemale = get("At a Glance", YOUTH, now, "female");
    const share = total && female !== null ? pct(female, total) : null;
    const youthShare = yTotal && yFemale !== null ? pct(yFemale, yTotal) : null;
    const gap = share === null ? "" : share >= GENDER_PARITY_TARGET
      ? `Above the ${GENDER_PARITY_TARGET}% parity target`
      : `${Math.round(GENDER_PARITY_TARGET - share)} pts below the ${GENDER_PARITY_TARGET}% parity target`;
    insights.push({
      key: "gender",
      title: "Gender Balance",
      figure: share === null ? null : fmtPct(share),
      detail: `Female participants (target: ${GENDER_PARITY_TARGET}%)`,
      copy: [gap, youthShare !== null ? `Youth in work: ${fmtPct(youthShare)} female` : ""].filter(Boolean).join(" · "),
    });
  }

  // 2. Reach: progress to the outreach target (cumulative) or the period's reach and its change.
  {
    const total = get("At a Glance", OUTREACH, now);
    const goal = target("At a Glance", OUTREACH, now);
    const countries = p.year === null
      ? new Set(actual.filter(r => r.section === "Map" && r.segment === "all" && r.breakdown === "Outreach"
          && r.country && Number(r.value) > 0).map(r => r.country)).size
      : 0;
    const g = growth("At a Glance", OUTREACH);
    if (goal && total !== null) {
      insights.push({
        key: "reach",
        title: "Outreach Progress",
        figure: fmtPct(pct(total, goal)),
        detail: `${fmtNum(total)} of ${fmtNum(goal)} youth reached (target)`,
        copy: [countries ? `${countries} countries` : "", g?.text ?? ""].filter(Boolean).join(" · "),
      });
    } else {
      insights.push({
        key: "reach",
        title: "Outreach Reach",
        figure: total === null ? null : fmtNum(total),
        detail: `Youth reached, ${slotLabel(now)}`,
        copy: [g?.text ?? "", countries ? `${countries} countries` : ""].filter(Boolean).join(" · "),
      });
    }
  }

  // 3. Work outcomes. Cumulative: youth in work as a share of youth reached to date.
  //    A single year or half: the number in work and its change - people reached in an earlier
  //    period often find work later, so a per-period ratio would be misleading (it can pass 100%).
  {
    const reached = get("At a Glance", OUTREACH, now);
    const inWork = get("At a Glance", YOUTH, now);
    const mix = table("Youth in Work", "Job Categories - Full-Time, Part-Time, Seasonal", now);
    const mixTotal = Array.from(mix.values()).reduce((a, b) => a + b, 0);
    const full = mix.get("Full-time");
    const fullShare = mixTotal && full !== undefined ? `${fmtPct(pct(full, mixTotal))} of jobs full-time` : "";
    if (p.year === null) {
      insights.push({
        key: "work",
        title: "Work Outcomes",
        figure: reached && inWork !== null ? fmtPct(pct(inWork, reached)) : null,
        detail: "Youth in work, as a share of youth reached",
        copy: [inWork !== null && reached ? `${fmtNum(inWork)} in work of ${fmtNum(reached)} reached` : "", fullShare]
          .filter(Boolean).join(" · "),
      });
    } else {
      insights.push({
        key: "work",
        title: "Work Outcomes",
        figure: inWork === null ? null : fmtNum(inWork),
        detail: `Youth in work, ${slotLabel(now)}`,
        copy: [growth("At a Glance", YOUTH)?.text ?? "", fullShare].filter(Boolean).join(" · "),
      });
    }
  }

  // 4. Venture momentum: enterprises started, female-led share and change on the previous period.
  {
    const ent = get("At a Glance", "Enterprises Supported", now);
    const entFemale = get("At a Glance", "Enterprises Supported", now, "female");
    const g = growth("At a Glance", "Enterprises Supported");
    insights.push({
      key: "ventures",
      title: "Venture Momentum",
      figure: ent === null ? null : fmtNum(ent),
      detail: `Enterprises supported${entFemale !== null && ent ? ` · ${fmtPct(pct(entFemale, ent))} female-led` : ""}`,
      copy: g?.text ?? "",
    });
  }

  return insights;
}
