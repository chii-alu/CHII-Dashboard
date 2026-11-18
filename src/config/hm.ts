// Health Missions (HM) portal: the KPI cards and charts for At a Glance and each intervention page.
// HM has no rows in Supabase yet, so the values are sample data (see sampleValue below), the same on every load.
import type { ComponentType } from "react";
import {
  Users, GraduationCap, Globe, UserCheck, Briefcase, HeartHandshake, CalendarCheck, Star,
  Mic, Building2, Presentation, Plane, MapPin, FlaskConical, FileText, BookOpen, Target, Percent,
} from "lucide-react";

export type HMUnit = "count" | "percent";

export type HMKpi = {
  label: string;
  icon: ComponentType<any>;
  unit: HMUnit;
  tip: string;
  range: [number, number]; // sample values fall in this range
};

export type HMChart = {
  title: string;
  sub: string;
  info?: string;
  /** bar: columns · hbar: horizontal bars · stack: stacked columns · group: grouped columns · line: lines over time */
  kind: "bar" | "hbar" | "stack" | "group" | "line";
  categories: string[];
  series: string[];
  unit?: HMUnit;
  range: [number, number];
};

export type HMSection = { name: string; blurb: string; charts: HMChart[] };

export type HMPageConfig = {
  slug: string;
  title: string;
  subtitle: string;
  kpis: HMKpi[];
  sections: HMSection[];
};

const YEARS = ["2024", "2025", "2026"];
const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const GENDER = ["Female", "Male"];
const COUNTRIES = ["Rwanda", "Kenya", "Uganda", "Nigeria", "Ghana", "Ethiopia"];

export const HM_PAGES: Record<string, HMPageConfig> = {
  glance: {
    slug: "glance",
    title: "Health Missions Overview",
    subtitle: "Mission students, mentorship, guest faculty, study trips and research across Health Missions",
    kpis: [
      { label: "Mission Students", icon: GraduationCap, unit: "count", tip: "Students enrolled as Health Missions students", range: [180, 420] },
      { label: "Mentees Matched", icon: HeartHandshake, unit: "count", tip: "Mission students matched with a mentor", range: [90, 260] },
      { label: "Guest Sessions", icon: Mic, unit: "count", tip: "Guest faculty sessions delivered", range: [20, 70] },
      { label: "Study Trip Participants", icon: Plane, unit: "count", tip: "Students who took part in a study trip", range: [40, 160] },
      { label: "Research Projects", icon: FlaskConical, unit: "count", tip: "Research projects with mission students involved", range: [8, 40] },
      { label: "Female Participation", icon: Users, unit: "percent", tip: "Share of participants across Health Missions who are female", range: [48, 66] },
    ],
    sections: [
      {
        name: "Reach",
        blurb: "How many students each intervention reaches, and where they come from",
        charts: [
          { title: "Participation by Intervention", sub: "Students reached by each Health Missions intervention", kind: "hbar", categories: ["Mission Students", "Mentorship Program", "Guest Faculty & Sessions", "Study Trips", "Research"], series: ["Students"], range: [30, 320] },
          { title: "Students by Country", sub: "Where mission students come from", kind: "hbar", categories: COUNTRIES, series: ["Students"], range: [10, 120] },
        ],
      },
      {
        name: "Inclusion & Trends",
        blurb: "Who is taking part, and how participation is changing year on year",
        charts: [
          { title: "Gender Split by Intervention", sub: "Female and male participants per intervention", kind: "stack", categories: ["Mission Students", "Mentorship", "Guest Sessions", "Study Trips", "Research"], series: GENDER, range: [10, 160] },
          { title: "Participation Trend", sub: "Students reached per year, by intervention", kind: "line", categories: YEARS, series: ["Mission Students", "Mentorship", "Study Trips"], range: [40, 300] },
        ],
      },
    ],
  },

  "mission-students": {
    slug: "mission-students",
    title: "Mission Students",
    subtitle: "Health Missions students: enrolment, retention, graduation and placements",
    kpis: [
      { label: "Students Enrolled", icon: GraduationCap, unit: "count", tip: "Mission students currently enrolled", range: [180, 420] },
      { label: "Female Students", icon: Users, unit: "percent", tip: "Share of mission students who are female", range: [48, 66] },
      { label: "Countries Represented", icon: Globe, unit: "count", tip: "Countries mission students come from", range: [8, 22] },
      { label: "Retention Rate", icon: UserCheck, unit: "percent", tip: "Students still enrolled from the start of the year", range: [78, 96] },
      { label: "Graduates", icon: BookOpen, unit: "count", tip: "Mission students who have graduated", range: [40, 140] },
      { label: "In Health Placements", icon: Briefcase, unit: "percent", tip: "Graduates working or placed in the health sector", range: [55, 85] },
    ],
    sections: [
      {
        name: "Enrolment & Reach",
        blurb: "How many mission students we enrol, and who they are",
        charts: [
          { title: "Enrolment by Cohort Year", sub: "Mission students per cohort, split by gender", kind: "stack", categories: YEARS, series: GENDER, range: [50, 160] },
          { title: "Students by Country", sub: "Where mission students come from", kind: "hbar", categories: COUNTRIES, series: ["Students"], range: [10, 120] },
        ],
      },
      {
        name: "Progress & Outcomes",
        blurb: "How students progress, graduate and move into health work",
        charts: [
          { title: "Retention and Graduation by Cohort", sub: "Retention and graduation rates per cohort", kind: "group", categories: YEARS, series: ["Retention", "Graduation"], unit: "percent", range: [60, 96] },
          { title: "Graduate Destinations", sub: "Where graduates go after the programme", kind: "hbar", categories: ["Health sector job", "Further study", "Health venture", "Public sector", "Still seeking"], series: ["Graduates"], range: [5, 60] },
        ],
      },
    ],
  },

  mentorship: {
    slug: "mentorship",
    title: "Mentorship Program",
    subtitle: "Mission students matched with health professionals as mentors",
    kpis: [
      { label: "Mentees Matched", icon: HeartHandshake, unit: "count", tip: "Mission students matched with a mentor", range: [90, 260] },
      { label: "Active Mentors", icon: UserCheck, unit: "count", tip: "Mentors with at least one session this year", range: [30, 90] },
      { label: "Sessions Held", icon: CalendarCheck, unit: "count", tip: "Mentorship sessions held", range: [300, 900] },
      { label: "Sessions per Mentee", icon: Target, unit: "count", tip: "Average sessions per mentee", range: [3, 9] },
      { label: "Completion Rate", icon: Percent, unit: "percent", tip: "Mentees who completed the mentorship cycle", range: [70, 94] },
      { label: "Mentee Satisfaction", icon: Star, unit: "percent", tip: "Mentees rating their mentorship good or very good", range: [78, 97] },
    ],
    sections: [
      {
        name: "Participation",
        blurb: "Who is being mentored, and by whom",
        charts: [
          { title: "Mentees by Cohort", sub: "Mentees per cohort, split by gender", kind: "stack", categories: YEARS, series: GENDER, range: [30, 120] },
          { title: "Mentors by Background", sub: "The professional background of our mentors", kind: "hbar", categories: ["Clinician", "Public health practitioner", "Researcher", "Policy maker", "Health entrepreneur"], series: ["Mentors"], range: [4, 30] },
        ],
      },
      {
        name: "Engagement & Quality",
        blurb: "How often pairs meet, and how mentees rate the experience",
        charts: [
          { title: "Sessions per Quarter", sub: "Mentorship sessions held each quarter", kind: "line", categories: QUARTERS, series: ["Sessions"], range: [60, 240] },
          { title: "Satisfaction by Cohort", sub: "Mentees rating their mentorship good or very good", kind: "bar", categories: YEARS, series: ["Satisfied"], unit: "percent", range: [75, 97] },
        ],
      },
    ],
  },

  "guest-faculty": {
    slug: "guest-faculty",
    title: "Guest Faculty & Sessions",
    subtitle: "Health experts teaching mission students through guest sessions",
    kpis: [
      { label: "Guest Faculty", icon: Presentation, unit: "count", tip: "Guest faculty who taught a session", range: [12, 45] },
      { label: "Sessions Delivered", icon: Mic, unit: "count", tip: "Guest sessions delivered", range: [20, 70] },
      { label: "Total Attendance", icon: Users, unit: "count", tip: "Student attendances across all sessions", range: [600, 2200] },
      { label: "Average Attendance", icon: UserCheck, unit: "count", tip: "Average students per session", range: [25, 60] },
      { label: "Institutions Represented", icon: Building2, unit: "count", tip: "Institutions our guest faculty come from", range: [8, 30] },
      { label: "Session Rating", icon: Star, unit: "percent", tip: "Students rating sessions good or very good", range: [80, 97] },
    ],
    sections: [
      {
        name: "Delivery",
        blurb: "What the sessions covered, and who delivered them",
        charts: [
          { title: "Sessions by Topic", sub: "Guest sessions per health topic", kind: "hbar", categories: ["Health systems", "Epidemiology", "Digital health", "Health policy", "Leadership"], series: ["Sessions"], range: [3, 18] },
          { title: "Faculty by Sector", sub: "Where our guest faculty work", kind: "bar", categories: ["Academia", "Government", "NGO", "Private sector", "Multilateral"], series: ["Faculty"], range: [2, 14] },
        ],
      },
      {
        name: "Reach & Feedback",
        blurb: "How many students attend, and how they rate the sessions",
        charts: [
          { title: "Attendance per Quarter", sub: "Student attendances at guest sessions", kind: "line", categories: QUARTERS, series: ["Attendance"], range: [120, 600] },
          { title: "Session Ratings", sub: "How students rated the sessions", kind: "bar", categories: ["Very good", "Good", "Fair", "Poor"], series: ["Responses"], range: [5, 180] },
        ],
      },
    ],
  },

  "study-trips": {
    slug: "study-trips",
    title: "Study Trips",
    subtitle: "Mission students visiting health institutions and systems in the field",
    kpis: [
      { label: "Trips Completed", icon: Plane, unit: "count", tip: "Study trips completed", range: [4, 14] },
      { label: "Students Participating", icon: Users, unit: "count", tip: "Students who joined a study trip", range: [40, 160] },
      { label: "Host Institutions", icon: Building2, unit: "count", tip: "Health institutions visited", range: [8, 32] },
      { label: "Countries Visited", icon: MapPin, unit: "count", tip: "Countries study trips went to", range: [2, 7] },
      { label: "Female Participation", icon: UserCheck, unit: "percent", tip: "Share of trip participants who are female", range: [48, 66] },
      { label: "Trip Satisfaction", icon: Star, unit: "percent", tip: "Participants rating their trip good or very good", range: [82, 98] },
    ],
    sections: [
      {
        name: "Trips & Reach",
        blurb: "Where the trips went, and how many students took part",
        charts: [
          { title: "Participants by Trip", sub: "Students on each study trip", kind: "hbar", categories: ["Kigali health facilities", "Nairobi research institutes", "Kampala referral hospital", "Addis public health agency", "Accra digital health hub"], series: ["Students"], range: [10, 45] },
          { title: "Participants by Year", sub: "Trip participants per year, split by gender", kind: "stack", categories: YEARS, series: GENDER, range: [15, 70] },
        ],
      },
      {
        name: "Learning & Feedback",
        blurb: "What students gained from the trips",
        charts: [
          { title: "Learning Outcomes", sub: "Participants agreeing the trip improved each area", kind: "hbar", categories: ["Understanding of health systems", "Professional network", "Career clarity", "Practical skills"], series: ["Agree"], unit: "percent", range: [65, 96] },
          { title: "Host Institutions by Type", sub: "The kinds of institutions visited", kind: "bar", categories: ["Hospital", "Research institute", "Ministry or agency", "NGO", "Health venture"], series: ["Institutions"], range: [1, 9] },
        ],
      },
    ],
  },

  research: {
    slug: "research",
    title: "Research",
    subtitle: "Mission students taking part in health research, and what it produces",
    kpis: [
      { label: "Research Projects", icon: FlaskConical, unit: "count", tip: "Research projects with mission students involved", range: [8, 40] },
      { label: "Students in Research", icon: Users, unit: "count", tip: "Mission students working on a research project", range: [20, 110] },
      { label: "Outputs Produced", icon: FileText, unit: "count", tip: "Papers, policy briefs and posters produced", range: [6, 45] },
      { label: "Conference Presentations", icon: Presentation, unit: "count", tip: "Times students presented research at a conference", range: [3, 25] },
      { label: "Supervisors Engaged", icon: UserCheck, unit: "count", tip: "Researchers supervising mission students", range: [5, 24] },
      { label: "Projects Completed", icon: Percent, unit: "percent", tip: "Share of projects completed", range: [35, 80] },
    ],
    sections: [
      {
        name: "Projects & Participation",
        blurb: "What students research, and how many take part",
        charts: [
          { title: "Projects by Health Theme", sub: "Research projects per health theme", kind: "hbar", categories: ["Maternal health", "Health workforce", "Digital health", "Non-communicable diseases", "Mental health"], series: ["Projects"], range: [2, 12] },
          { title: "Students in Research by Year", sub: "Students in research per year, split by gender", kind: "stack", categories: YEARS, series: GENDER, range: [8, 50] },
        ],
      },
      {
        name: "Outputs",
        blurb: "Where projects stand, and what they have produced",
        charts: [
          { title: "Project Stage", sub: "Projects at each stage, from proposal to completion", kind: "bar", categories: ["Proposal", "Ethics approval", "Data collection", "Analysis", "Completed"], series: ["Projects"], range: [2, 14] },
          { title: "Outputs by Type", sub: "Research outputs produced, by type", kind: "group", categories: YEARS, series: ["Papers", "Policy briefs", "Posters"], range: [1, 14] },
        ],
      },
    ],
  },
};

/* ── Sample data ─────────────────────────────────────── */

function seed(text: string): number {
  let h = 2166136261;
  for (const c of text) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A sample value in [min, max] for a key. The year is part of the key, so values change with the Year filter. */
export function sampleValue(key: string, [min, max]: [number, number]): number {
  return min + (seed(key) % (max - min + 1));
}

/** A sample target 70%–129% of the value, so the cards show a mix of met, close and behind. Rates stay at or under 100. */
export function sampleTarget(key: string, value: number, unit: HMUnit): number {
  const ratio = 0.7 + (seed(`${key}|target`) % 60) / 100;
  const target = Math.max(1, Math.round(value / ratio));
  return unit === "percent" ? Math.min(100, target) : target;
}
