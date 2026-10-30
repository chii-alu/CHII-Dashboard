// One place that maps a stat card's label to the metric name in v_progress.
// Labels that already match the workbook name need no entry.
import type { ProgressRow } from "@/lib/progressInsight";

export const PROGRESS_NAMES: Record<string, string> = {
  // Executive: Entrepreneurship
  "Active Enterprises": "Enterprises",
  "Entrepreneurship:Jobs Created": "Jobs created",
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
  "Students w/ Ventures": "Students with ventures",
  "HEMP Engagement Rate": "HEMP engagement rate",
};

const warned = new Set<string>();

/** The v_progress row for a card label. A section-specific entry ("Section:Label") wins over the plain label.
 *  In development, logs a warning once per label when no row matches. */
export function progressFor(rows: Record<string, ProgressRow>, cardLabel: string, section?: string): ProgressRow | undefined {
  const name = (section && PROGRESS_NAMES[`${section}:${cardLabel}`]) || PROGRESS_NAMES[cardLabel] || cardLabel;
  const row = rows[name];
  // Rows load asynchronously; an empty map means "not loaded yet", not "missing".
  const loaded = Object.keys(rows).length > 0;
  const key = `${section ?? ""}|${cardLabel}`;
  if (!row && loaded && process.env.NODE_ENV !== "production" && !warned.has(key)) {
    warned.add(key);
    console.warn(`[progress] No v_progress row for card "${cardLabel}"${section ? ` in ${section}` : ""} (looked for "${name}").`);
  }
  return row;
}
