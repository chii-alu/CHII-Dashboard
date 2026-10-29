// One place that maps a stat card's label to the metric name in v_progress.
// Labels that already match the workbook name need no entry.
import type { ProgressRow } from "@/lib/progressInsight";

export const PROGRESS_NAMES: Record<string, string> = {
  // Executive: Entrepreneurship
  "Active Enterprises": "Enterprises",
  // Executive: Outreach
  "Total Participants": "Total Participants (All Programmes)",
  "Interventions": "Interventions (Types)",
  "Refugee / IDP": "Refugee / IDP (%)",
  "Persons w/ Disability": "Persons with Disability (%)",
  // Executive: Youth in Work
  "Enterprise": "Enterprise (Self-employment)",
  "In Employment": "In Employment (Wage)",
  "Female": "Female Share (%)",
  "Based in Africa": "Based in Africa (%)",
  // Executive: Wage Employment
  "Wage Employed": "Waged Employed",
  // HEMP home
  "SIE Placements": "SIE placements",
};

const warned = new Set<string>();

/** The v_progress row for a card label. In development, logs a warning once per label when no row matches. */
export function progressFor(rows: Record<string, ProgressRow>, cardLabel: string): ProgressRow | undefined {
  const name = PROGRESS_NAMES[cardLabel] ?? cardLabel;
  const row = rows[name];
  // Rows load asynchronously; an empty map means "not loaded yet", not "missing".
  const loaded = Object.keys(rows).length > 0;
  if (!row && loaded && process.env.NODE_ENV !== "production" && !warned.has(cardLabel)) {
    warned.add(cardLabel);
    console.warn(`[progress] No v_progress row for card "${cardLabel}" (looked for "${name}").`);
  }
  return row;
}
