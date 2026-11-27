// One place that maps a stat card's label to the metric name in v_progress.
// Labels that already match the workbook name need no entry.
import { NO_TARGET_ROW, type ProgressRow } from "@/lib/progressInsight";

/** What useProgress returns for a period with no targets (2025): every card gets NO_TARGET_ROW. */
export const NO_TARGET_ROWS: Record<string, ProgressRow> = Object.freeze({}) as Record<string, ProgressRow>;

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
  "Female": "Female Share",
  "Youth in Work:Participants": "Beneficiaries",
  "Based in Africa": "Based in Africa (%)",
  // Executive: Wage Employment
  "Wage Employed": "Waged Employed",
  // HEMP home
  "SIE Placements": "SIE placements",
  "Students w/ Ventures": "Students with ventures",
  "HEMP Engagement Rate": "HEMP engagement rate",
};

/** Workbook renames (25 Nov 2026 half-year layout): new name -> name before the migration.
 *  Lookups try the new name first, so cards work before and after the migration runs. */
export const PREVIOUS_NAMES: Record<string, string> = {
  "Total Work-Enabling Outreach": "Total Outreach",
  "Beneficiaries": "Participants",
  "Female Share": "Female Share (%)",
  "Pathway Distribution": "Work Pathway Distribution",
  "Health Mission Students Graduation Status": "Graduation Status",
  "Gender Split By Academic Program": "Gender Split",
  "Employment Placement Rate": "Time To Employment After Graduation",
  "Enterprises Supported": "Enterprises",   // At a Glance row 23 only (Entrepreneurship keeps 'Enterprises')
};

/** True when a row's metric is `name` or the name it had before the rename. */
export function isMetric(rowMetric: unknown, name: string): boolean {
  return rowMetric === name || (PREVIOUS_NAMES[name] !== undefined && rowMetric === PREVIOUS_NAMES[name]);
}

const warned = new Set<string>();

/** The database name for a card label (the label itself when it isn't mapped). */
export function progressName(cardLabel: string, section?: string): string {
  return (section && PROGRESS_NAMES[`${section}:${cardLabel}`]) || PROGRESS_NAMES[cardLabel] || cardLabel;
}

/** The v_progress row for a card label. A section-specific entry ("Section:Label") wins over the plain label.
 *  In development, logs a warning once per label when no row matches. */
export function progressFor(rows: Record<string, ProgressRow>, cardLabel: string, section?: string): ProgressRow | undefined {
  if (rows === NO_TARGET_ROWS) return NO_TARGET_ROW;
  const name = (section && PROGRESS_NAMES[`${section}:${cardLabel}`]) || PROGRESS_NAMES[cardLabel] || cardLabel;
  const row = rows[name] ?? (PREVIOUS_NAMES[name] ? rows[PREVIOUS_NAMES[name]] : undefined);
  // Rows load asynchronously; an empty map means "not loaded yet", not "missing".
  const loaded = Object.keys(rows).length > 0;
  const key = `${section ?? ""}|${cardLabel}`;
  if (!row && loaded && process.env.NODE_ENV !== "production" && !warned.has(key)) {
    warned.add(key);
    console.warn(`[progress] No v_progress row for card "${cardLabel}"${section ? ` in ${section}` : ""} (looked for "${name}").`);
  }
  return row;
}
