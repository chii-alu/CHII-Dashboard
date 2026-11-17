// Dummy values for the ALU-CHII dashboard, used until the logs are connected.
// Every number here is made up. Values are deterministic (same label, same number on every load).
import type { AluTable } from "@/config/alu-chii";

function seed(text: string): number {
  let h = 2166136261;
  for (const c of text) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// The card counts up to its value, so each format rounds to whole numbers.
const usd = (n: number) => `$${Math.round(n / 1000).toLocaleString("en-US")}K`;
const pct = (n: number) => `${Math.round(n)}%`;
const count = (n: number) => Math.round(n).toLocaleString("en-US");

export type DummyUnit = "percent" | "currency_usd" | "count";

/**
 * A dummy headline value and target for a KPI, formatted by its definition (rate, USD or count).
 * The target sits 70%–129% of the value, so the cards show a mix of met, close and behind.
 */
export function dummyKpi(label: string, definition: string, year: string): {
  num: number; display: (n: number) => string; target: number; unit: DummyUnit;
} {
  // Each year (or "all") gets its own numbers, so the cards change when the Year filter changes.
  const h = seed(`${label}|${year}`);
  const ratio = (0.7 + ((seed(`${label}|target|${year}`) % 60) / 100));
  const unit: DummyUnit = /%/.test(definition) ? "percent" : /\(USD\)/.test(definition) ? "currency_usd" : "count";
  if (unit === "percent") {
    const num = 40 + (h % 56);
    return { num, display: pct, target: Math.min(100, Math.round(num / ratio)), unit };
  }
  if (unit === "currency_usd") {
    const num = (150 + (h % 1600)) * 1000;
    return { num, display: usd, target: Math.round(num / ratio), unit };
  }
  const num = 5 + (h % 940);
  return { num, display: count, target: Math.max(1, Math.round(num / ratio)), unit };
}

const QUARTER_WORDS = /quarter|time|trend|timeline/i;

/** Time charts run across quarters (drawn as columns); the others compare groups (drawn as bars). */
export function isTimeChart(title: string, sub: string): boolean {
  return QUARTER_WORDS.test(`${title} ${sub}`);
}

/** A dummy whole number from 0 to max for a key, the same every time for the same key. */
export function dummyCount(key: string, max: number): number {
  return seed(key) % (max + 1);
}

/** Realistic category names for each chart. Time charts use quarters (or years). */
const CHART_CATEGORIES: Record<string, string[]> = {
  "Research Staff Capacity": ["Health economics", "Epidemiology", "Data science", "Implementation research", "Health policy"],
  "Collaboration Outputs by Department": ["Health Sciences", "Business", "Engineering", "Public Policy", "Digital Learning"],
  "Partnerships by Category": ["Government", "Academic", "Health provider", "Private sector", "NGO", "Funder"],
  "Partnerships by Project or Intervention": ["HEMP", "HENT", "HECO", "Health Missions", "Centre-wide"],
  "Partnership Funnel": ["Identified", "Engaged", "Formalised", "Activated"],
  "Partner Map": ["Rwanda", "Kenya", "Uganda", "Nigeria", "South Africa"],
  "SOP Compliance by Process": ["Admissions", "Programme delivery", "Finance", "Procurement", "Reporting"],
  "Project Delivery Status": ["On track", "At risk", "Delayed", "Completed"],
  "Risk Heat Map": ["Financial", "Operational", "Reputational", "Partner", "Safeguarding"],
  "CQI Audit Findings": ["Critical", "Major", "Minor", "Observation"],
  "Funding vs Target": ["Secured", "Weighted pipeline", "Gap to target"],
  "Funding Pipeline by Stage": ["Concept note", "Proposal submitted", "Under review", "Secured"],
  "Funding by Source": ["AHC funding", "Other grants", "Contracts", "Philanthropy"],
  "Research Pipeline": ["Concept notes", "Proposals submitted", "Funded", "Outputs"],
  "Research Funding by Source": ["AHC", "Other funders", "Beyond AHC"],
  "Research by Health Theme": ["Maternal health", "Health workforce", "Digital health", "Non-communicable diseases", "Mental health"],
  "Health System Changes by Type": ["Policy", "Guideline", "Service", "Practice", "System"],
  "Reach by Country": ["Rwanda", "Kenya", "Uganda", "Nigeria", "Ghana"],
  "Contribution Stories": ["Policy adoption", "Service expansion", "Workforce training", "Community outreach"],
  "Delegate": ["Attendee", "Panellist", "Moderator", "Keynote", "Organiser"],
  "Advisory Roles by Level": ["Institutional", "National", "Regional", "Global"],
  "Funding Progress": ["Secured", "Pipeline", "Gap to target"],
  "Papers by Research Topic": ["Health systems", "Maternal and child health", "Digital health", "Health workforce", "Health financing"],
  "Grant Pipeline": ["Applied", "Under Review", "Awarded", "Rejected"],
  "Masterclass Attendance per Session": ["Research methods", "Data analysis", "Grant writing", "Policy writing", "Ethics in research"],
};
const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const YEARS = ["2023", "2024", "2025", "2026"];

/** Dummy bars for a chart, named for what the chart shows. */
export function dummyChartRows(title: string, sub: string, year: string): { name: string; value: number }[] {
  const h = seed(`${title}|${year}`);
  const names = CHART_CATEGORIES[title] ?? (isTimeChart(title, sub) ? (/year/i.test(title) ? YEARS : QUARTERS) : ["Other"]);
  return names.map((name, i) => ({ name, value: 20 + ((h >>> (i * 3)) + i * 37) % 80 }));
}

const STATUSES = ["On track", "At risk", "Off track", "Completed"] as const;

/** Realistic sample values for each table column. */
const COLUMN_SAMPLES: Record<string, string[]> = {
  "Capability": ["Research methods lab", "Grant writing unit", "Data analytics team", "Health economics course", "Policy briefing service", "Mentorship programme"],
  "Owner": ["Programme lead", "Research manager", "Operations lead", "Partnerships lead", "Data officer"],
  "What it enables": ["Faster grant submissions", "Stronger evidence for ministries", "Better data for decisions", "More trained staff"],
  "ALU department": ["Health Sciences", "Business", "Engineering", "Public Policy"],
  "Initiative": ["Joint curriculum", "Shared research call", "Summer school", "Co-funded study"],
  "Output": ["Policy brief", "Case study", "Workshop report", "Journal article"],
  "Partner": ["Ministry of Health", "Rwanda Biomedical Centre", "Kenya Medical Research Institute", "WHO country office"],
  "Category": ["Government", "Academic", "Health provider", "NGO", "Funder"],
  "Stage": ["Identified", "Engaged", "Formalised", "Activated"],
  "Linked project": ["HEMP", "HENT", "HECO"],
  "Executive engagement needed": ["Yes", "No"],
  "Lead": ["Partnerships lead", "Programme manager", "Associate Director"],
  "Next step": ["Schedule meeting", "Draft MoU", "Sign agreement", "Review proposal"],
  "Project": ["Maternal health pilot", "Digital health course", "Youth venture fund", "Community health survey"],
  "Funder": ["AHC", "Wellcome Trust", "Government of Rwanda", "Gates Foundation"],
  "Risk": ["Donor funding gap", "Staff turnover", "Data security breach", "Delayed approvals"],
  "Likelihood": ["Low", "Medium", "High"],
  "Impact": ["Low", "Medium", "High"],
  "Mitigation": ["Diversify donors", "Cross-training", "Access controls", "Escalation plan"],
  "SOP": ["Admissions SOP", "Procurement SOP", "Finance SOP", "Reporting SOP"],
  "Activity sampled": ["Cohort intake", "Supplier payment", "Monthly close", "Donor report"],
  "Evidence found": ["Signed form", "Checklist", "Approval email", "Missing sign-off"],
  "Auditor": ["Internal audit", "MELA team"],
  "Action": ["None", "Retrain staff", "Update SOP"],
  "Change": ["Maternal care guideline", "Digital referral service", "Community health protocol"],
  "Institution": ["Ministry of Health", "District hospital", "Health insurance scheme", "Nursing council"],
  "Level": ["National", "Regional", "District", "Facility"],
  "Country": ["Rwanda", "Kenya", "Uganda", "Nigeria", "Ghana"],
  "CHII contribution": ["Technical advice", "Training", "Evidence review"],
  "Event or platform": ["Rwanda Breast Cancer Symposium", "AHTS", "Youth roundtable", "Webinar series", "Media feature"],
  "Type": ["Conference", "Panel", "Webinar", "Media"],
  "CHII representative": ["Programme director", "Research lead", "Communications officer"],
  "Role": ["Keynote", "Panellist", "Moderator", "Attendee"],
  "Board or committee": ["Health technical working group", "Policy advisory committee", "Regional nursing board"],
  "Organisation": ["Ministry of Health", "WHO AFRO", "African Union"],
  "CHII member": ["Director", "Research lead"],
};

/** One dummy table cell. Values change with the year: statuses, dates and sample names all follow it. */
export function dummyCell(table: AluTable, column: string, row: number, year: string): string {
  const h = seed(`${table.title}|${year}`);
  const pick = (list: string[]) => list[(row + h) % list.length];
  if (/^status$/i.test(column)) return pick([...STATUSES]);
  if (/(evidence|link)$/i.test(column) && !/found/i.test(column)) return "View link";
  const dateYear = year === "all" ? 2026 : Number(year);
  if (/date|launched|since|milestone|report due/i.test(column)) return `${dateYear}-${String(((row + h) % 12) + 1).padStart(2, "0")}-15`;
  if (/audience size/i.test(column)) return String(120 + ((row + h) % 900));
  const samples = COLUMN_SAMPLES[column];
  if (samples && samples.length) return pick(samples);
  return `${column} ${row + 1}`;
}

/** Dummy scorecard entry for a strategic area: status and % of target. */
export function dummyArea(area: string, year: string): { status: string; pct: number; color: string } {
  const h = seed(`${area}|${year}`);
  const pctValue = 45 + (h % 60);
  const status = pctValue >= 80 ? "On track" : pctValue >= 60 ? "At risk" : "Off track";
  const color = status === "On track" ? "#16A34A" : status === "At risk" ? "#F59E0B" : "#DC2626";
  return { status, pct: pctValue, color };
}

/** Dummy counts for the Needs Attention list. */
export function dummyAttentionCount(item: string, year: string): number {
  return 1 + (seed(`${item}|${year}`) % 12);
}

export const DUMMY_HIGHLIGHTS = [
  "First cohort of research fellows enrolled",
  "New partnership agreement signed with a ministry",
  "Donor report submitted ahead of its due date",
];

/** Dummy events for the gallery. Photos are added per event once they are shared. */
export const GALLERY_EVENTS: { title: string; date: string; year: number; location: string; type: string }[] = [
  { title: "Rwanda Breast Cancer Symposium", date: "12 Mar 2026", year: 2026, location: "Kigali", type: "Conference" },
  { title: "Research Methods Masterclass", date: "27 Jan 2026", year: 2026, location: "Kigali", type: "Workshop" },
  { title: "Youth Roundtable on Health Careers", date: "8 Oct 2025", year: 2025, location: "Kigali", type: "Youth roundtable" },
  { title: "Health Systems Webinar Series: Episode 3", date: "18 Jun 2025", year: 2025, location: "Online", type: "Webinar" },
  { title: "Partner meeting with the Ministry of Health", date: "22 Nov 2024", year: 2024, location: "Kigali", type: "Partner Meetings" },
  { title: "AHTS Annual Health Technology Summit", date: "14 May 2024", year: 2024, location: "Nairobi", type: "Conference" },
  { title: "Media feature: Digital health in Africa", date: "9 Feb 2027", year: 2027, location: "Online", type: "Media" },
  { title: "Partner meeting with the WHO country office", date: "3 Jun 2027", year: 2027, location: "Kigali", type: "Partner Meetings" },
];

/**
 * Dummy events for each pillar's gallery, until their photos are shared.
 * Every intervention in the pillar's navigation has at least one event, and the event's `type` is that intervention.
 */
export const PILLAR_GALLERY_EVENTS: Record<"hemp" | "hent" | "heco" | "hm", { title: string; date: string; year: number; location: string; type: string }[]> = {
  hemp: [
    { title: "Career Workshop: CV and Interview Skills", date: "14 Feb 2026", year: 2026, location: "Kigali", type: "Career Workshops" },
    { title: "Campus Exposure Day", date: "3 Oct 2025", year: 2025, location: "Kigali", type: "Exposure Events" },
    { title: "Summer Internship Launch", date: "12 Jul 2025", year: 2025, location: "Kampala", type: "Internships" },
    { title: "Social Impact Entrepreneurship Week", date: "22 Apr 2026", year: 2026, location: "Nairobi", type: "SIE" },
    { title: "Employability Course Cohort 2", date: "19 Jun 2025", year: 2025, location: "Online", type: "Courses" },
    { title: "Partner Meeting with an Employer Network", date: "5 Mar 2026", year: 2026, location: "Kigali", type: "Partner Meetings" },
  ],
  hent: [
    { title: "Venture Clinic: Business Model Review", date: "21 Mar 2026", year: 2026, location: "Kigali", type: "Ventures" },
    { title: "Venture Funding Pitch Night", date: "9 Nov 2025", year: 2025, location: "Kigali", type: "Venture Funding" },
    { title: "Health Masterclass: Scaling Ventures", date: "27 Aug 2025", year: 2025, location: "Nairobi", type: "Masterclass" },
    { title: "Health Hackathon Finals", date: "16 May 2026", year: 2026, location: "Kigali", type: "Hackathon" },
    { title: "Founder Mentorship Circle", date: "4 Feb 2026", year: 2026, location: "Online", type: "Mentorship" },
    { title: "Exposure Trip: Innovation Hub Visit", date: "11 Oct 2025", year: 2025, location: "Kampala", type: "Exposure & Networking" },
    { title: "Partner Meeting with a Venture Investor", date: "18 Dec 2025", year: 2025, location: "Kigali", type: "Partner Meetings" },
  ],
  heco: [
    { title: "Public Sector Fellowship Cohort Launch", date: "8 Sep 2025", year: 2025, location: "Kigali", type: "Public Sector Fellowship" },
    { title: "Health Expert in Residence Kick-off", date: "12 May 2026", year: 2026, location: "Kigali", type: "Health Expert in Residence Programme" },
    { title: "Health Ecosystem Research Forum", date: "25 Mar 2026", year: 2026, location: "Kigali", type: "Research Activities" },
    { title: "Public Sector Innovation Hackathon", date: "5 Dec 2025", year: 2025, location: "Kigali", type: "Public Sector Innovation Hackathon" },
    { title: "Executive Course Graduation", date: "24 Jan 2025", year: 2025, location: "Kigali", type: "Executive Courses" },
    { title: "Partner Meeting with the Ministry of Health", date: "30 Jan 2026", year: 2026, location: "Kigali", type: "Partner Meetings" },
  ],
  hm: [
    { title: "Mission Students Orientation", date: "10 Sep 2025", year: 2025, location: "Kigali", type: "Mission Students" },
    { title: "Mentorship Programme Kick-off", date: "17 Apr 2026", year: 2026, location: "Kigali", type: "Mentorship Program" },
    { title: "Guest Faculty Session: Health Systems", date: "6 Sep 2025", year: 2025, location: "Kigali", type: "Guest Faculty & Sessions" },
    { title: "Health Missions Study Trip", date: "15 Feb 2026", year: 2026, location: "Kampala", type: "Study Trips" },
    { title: "Research Course Launch", date: "13 Jan 2025", year: 2025, location: "Online", type: "Research" },
    { title: "Partner Meeting with a Health Institution", date: "21 Oct 2025", year: 2025, location: "Kigali", type: "Partner Meetings" },
  ],
};
