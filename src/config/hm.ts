// Health Missions (HM) portal: the KPI cards and charts for the Overview and each of the seven intervention pages.
// HM has no rows in Supabase yet, so the values are sample data (see sampleValue below), the same on every load.
import type { ComponentType } from "react";
import {
  Users, GraduationCap, UserCheck, HeartHandshake, Star, Mic, Building2, Presentation,
  Plane, FlaskConical, FileText, BookOpen, Target, Percent, ClipboardCheck, ClipboardList, Compass,
  MessageSquare, Route, Lightbulb, Clock, Library, Activity, Award, UserPlus, Ticket,
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

const TERMS = ["Term 1", "Term 2", "Term 3"];
const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const GENDER = ["Female", "Male"];

/** The seven Health Missions interventions, in navigation order. */
export const HM_INTERVENTIONS = [
  "Onboarding & Orientation",
  "Mission Support",
  "Training & Capacity",
  "Mentorship",
  "Experiential Learning",
  "Research & Innovation",
  "Progress Monitoring",
];

export const HM_PAGES: Record<string, HMPageConfig> = {
  glance: {
    slug: "glance",
    title: "Health Missions Overview",
    subtitle: "Onboarding, mission support, training, mentorship, exposure, research and follow-up across Health Missions",
    kpis: [
      { label: "Health Mission Students", icon: GraduationCap, unit: "count", tip: "Students enrolled on a Health Mission (latest termly census)", range: [180, 420] },
      { label: "Missions in Implementation", icon: Route, unit: "count", tip: "Student missions past planning and being implemented", range: [60, 200] },
      { label: "Masterclass & Course Enrolments", icon: BookOpen, unit: "count", tip: "Enrolments across masterclasses and elective courses", range: [250, 800] },
      { label: "Mentorship Sessions", icon: HeartHandshake, unit: "count", tip: "One-on-one and group mentorship sessions held", range: [300, 900] },
      { label: "Exposure Participants", icon: Plane, unit: "count", tip: "Students who joined a field visit, conference or summit", range: [60, 220] },
      { label: "Capstone Research Projects", icon: FlaskConical, unit: "count", tip: "Capstone research projects supported", range: [10, 45] },
    ],
    sections: [
      {
        name: "Reach",
        blurb: "How many students each intervention reaches",
        charts: [
          { title: "Students Reached by Intervention", sub: "Students reached by each Health Missions intervention", kind: "hbar", categories: HM_INTERVENTIONS, series: ["Students"], range: [40, 320] },
          { title: "Student Census by Term", sub: "Health Mission students counted at each termly census, by gender", kind: "stack", categories: TERMS, series: GENDER, range: [70, 190] },
        ],
      },
      {
        name: "Engagement & Trends",
        blurb: "How support and learning activity is changing through the year",
        charts: [
          { title: "Support Sessions per Quarter", sub: "Office hours, mentorship and mission support sessions held", kind: "line", categories: QUARTERS, series: ["Mission support", "Mentorship", "Office hours"], range: [30, 240] },
          { title: "Mission Stage", sub: "Student missions at each stage", kind: "bar", categories: ["Ideation", "Planning", "Implementation", "Completed"], series: ["Missions"], range: [15, 110] },
        ],
      },
    ],
  },

  onboarding: {
    slug: "onboarding",
    title: "Student Onboarding & Orientation",
    subtitle: "Onboarding new Health Mission students, the termly census, and introductions to Health Missions and its opportunities",
    kpis: [
      { label: "New Students Onboarded", icon: UserPlus, unit: "count", tip: "New Health Mission students onboarded this year", range: [60, 180] },
      { label: "Termly Census Count", icon: ClipboardList, unit: "count", tip: "Health Mission students counted at the latest termly census", range: [180, 420] },
      { label: "Census Response Rate", icon: Percent, unit: "percent", tip: "Students who completed the termly census", range: [70, 96] },
      { label: "Orientation Sessions", icon: Presentation, unit: "count", tip: "Introduction to Health Missions sessions held", range: [4, 16] },
      { label: "Orientation Attendance", icon: UserCheck, unit: "percent", tip: "New students who attended an orientation session", range: [72, 97] },
      { label: "Female Students", icon: Users, unit: "percent", tip: "Share of onboarded students who are female", range: [48, 66] },
    ],
    sections: [
      {
        name: "Onboarding",
        blurb: "How many new students join Health Missions, and when",
        charts: [
          { title: "New Students Onboarded by Term", sub: "New Health Mission students per term, by gender", kind: "stack", categories: TERMS, series: GENDER, range: [15, 70] },
          { title: "Students by Programme of Study", sub: "Where onboarded students are studying", kind: "hbar", categories: ["Global Challenges", "Software Engineering", "International Business & Trade", "Entrepreneurial Leadership", "Other"], series: ["Students"], range: [8, 80] },
        ],
      },
      {
        name: "Census & Orientation",
        blurb: "The termly census, and how students are introduced to expectations and opportunities",
        charts: [
          { title: "Termly Census", sub: "Students counted and census responses each term", kind: "group", categories: TERMS, series: ["Students counted", "Responses"], range: [120, 400] },
          { title: "Orientation Topics Covered", sub: "Students attending each orientation topic", kind: "hbar", categories: ["What Health Missions is", "Expectations of students", "Available opportunities", "Support and office hours"], series: ["Attendees"], range: [40, 170] },
        ],
      },
    ],
  },

  "mission-support": {
    slug: "mission-support",
    title: "Mission Development & Implementation Support",
    subtitle: "Office hours, mission pathways, planning guidance and monitoring of student missions",
    kpis: [
      { label: "Office Hours Held", icon: Clock, unit: "count", tip: "Mission development office hours held", range: [40, 140] },
      { label: "Students Supported", icon: Users, unit: "count", tip: "Students who used office hours or support hours", range: [90, 300] },
      { label: "Mission Plans Approved", icon: ClipboardCheck, unit: "count", tip: "Mission plans reviewed and approved", range: [40, 160] },
      { label: "Missions in Implementation", icon: Route, unit: "count", tip: "Missions being implemented", range: [30, 140] },
      { label: "Missions On Track", icon: Target, unit: "percent", tip: "Monitored missions on track against their plan", range: [62, 90] },
      { label: "Support Satisfaction", icon: Star, unit: "percent", tip: "Students rating the support good or very good", range: [78, 97] },
    ],
    sections: [
      {
        name: "Support Delivered",
        blurb: "Office hours and support hours, and what students come for",
        charts: [
          { title: "Support Sessions per Quarter", sub: "Office hours and regular support hours held", kind: "group", categories: QUARTERS, series: ["Office hours", "Support hours"], range: [8, 45] },
          { title: "Support Requests by Topic", sub: "What students asked for help with", kind: "hbar", categories: ["Choosing a mission pathway", "Mission planning", "Partner identification", "Implementation challenges", "Reporting"], series: ["Requests"], range: [10, 90] },
        ],
      },
      {
        name: "Mission Progress",
        blurb: "Where missions stand, and how monitored missions are progressing",
        charts: [
          { title: "Missions by Pathway", sub: "Student missions in each mission pathway", kind: "hbar", categories: ["Health access", "Health workforce", "Digital health", "Maternal and child health", "Non-communicable diseases"], series: ["Missions"], range: [8, 60] },
          { title: "Monitored Missions Status", sub: "Monitored missions on track, at risk and stalled, by term", kind: "stack", categories: TERMS, series: ["On track", "At risk", "Stalled"], range: [5, 70] },
        ],
      },
    ],
  },

  training: {
    slug: "training",
    title: "Training & Capacity Building",
    subtitle: "Masterclasses, elective courses (Planetary Health, Fundamentals of Healthcare, Introduction to Global Healthcare) and new learning courses",
    kpis: [
      { label: "Masterclasses Held", icon: Mic, unit: "count", tip: "Health Mission student masterclasses delivered", range: [6, 24] },
      { label: "Masterclass Attendance", icon: Users, unit: "count", tip: "Student attendances across masterclasses", range: [150, 600] },
      { label: "Elective Enrolments", icon: BookOpen, unit: "count", tip: "Students enrolled in a Health Missions elective course", range: [90, 320] },
      { label: "Course Completion", icon: Award, unit: "percent", tip: "Enrolled students who completed their elective", range: [68, 94] },
      { label: "New Courses in Development", icon: Library, unit: "count", tip: "Additional learning courses being developed", range: [1, 6] },
      { label: "Learner Satisfaction", icon: Star, unit: "percent", tip: "Learners rating masterclasses and courses good or very good", range: [80, 97] },
    ],
    sections: [
      {
        name: "Elective Courses",
        blurb: "Enrolment and completion across the Health Missions electives",
        charts: [
          { title: "Enrolment by Elective", sub: "Students enrolled in each elective course", kind: "hbar", categories: ["Planetary Health", "Fundamentals of Healthcare", "Introduction to Global Healthcare"], series: ["Enrolled"], range: [30, 140] },
          { title: "Completion by Elective", sub: "Enrolled and completed students per elective", kind: "group", categories: ["Planetary Health", "Fundamentals of Healthcare", "Intro to Global Healthcare"], series: ["Enrolled", "Completed"], range: [25, 140] },
        ],
      },
      {
        name: "Masterclasses & New Courses",
        blurb: "Masterclass reach, and the courses being developed",
        charts: [
          { title: "Masterclass Attendance per Quarter", sub: "Student attendances at Health Mission masterclasses", kind: "line", categories: QUARTERS, series: ["Attendance"], range: [30, 180] },
          { title: "New Course Development Stage", sub: "Additional learning courses at each stage", kind: "bar", categories: ["Concept", "Curriculum design", "Content build", "Pilot", "Launched"], series: ["Courses"], range: [0, 4] },
        ],
      },
    ],
  },

  mentorship: {
    slug: "mentorship",
    title: "Mentorship & Professional Guidance",
    subtitle: "One-on-one and group mentorship, individual office hours, and referrals to professionals and experts",
    kpis: [
      { label: "One-on-One Sessions", icon: MessageSquare, unit: "count", tip: "One-on-one mentorship sessions held", range: [200, 700] },
      { label: "Group Sessions", icon: Users, unit: "count", tip: "Group mentorship sessions held", range: [20, 80] },
      { label: "Students Mentored", icon: HeartHandshake, unit: "count", tip: "Students who had at least one mentorship session", range: [90, 280] },
      { label: "Guidance Office Hours", icon: Clock, unit: "count", tip: "Individual office hours held for guidance", range: [40, 160] },
      { label: "Referrals Made", icon: Compass, unit: "count", tip: "Referrals to relevant professionals and experts", range: [30, 140] },
      { label: "Mentee Satisfaction", icon: Star, unit: "percent", tip: "Mentees rating their mentorship good or very good", range: [78, 97] },
    ],
    sections: [
      {
        name: "Mentorship",
        blurb: "One-on-one and group mentorship through the year",
        charts: [
          { title: "Mentorship Sessions per Quarter", sub: "One-on-one and group sessions held", kind: "group", categories: QUARTERS, series: ["One-on-one", "Group"], range: [10, 190] },
          { title: "Students Mentored by Term", sub: "Students mentored each term, by gender", kind: "stack", categories: TERMS, series: GENDER, range: [20, 100] },
        ],
      },
      {
        name: "Guidance & Referrals",
        blurb: "Office hours for guidance, and who students are referred to",
        charts: [
          { title: "Referrals by Professional Type", sub: "Referrals to professionals and experts, by type", kind: "hbar", categories: ["Clinician", "Public health practitioner", "Researcher", "Policy maker", "Health entrepreneur"], series: ["Referrals"], range: [4, 40] },
          { title: "Guidance Office Hours per Quarter", sub: "Individual office hours held for guidance", kind: "line", categories: QUARTERS, series: ["Office hours"], range: [8, 45] },
        ],
      },
    ],
  },

  "experiential-learning": {
    slug: "experiential-learning",
    title: "Experiential Learning & Professional Exposure",
    subtitle: "Field visits, exposure conferences, summits, and external learning and networking opportunities",
    kpis: [
      { label: "Field Visits", icon: Building2, unit: "count", tip: "Field visits to health institutions completed", range: [4, 16] },
      { label: "Conferences Attended", icon: Presentation, unit: "count", tip: "Exposure conferences students attended", range: [3, 14] },
      { label: "Summits Attended", icon: Ticket, unit: "count", tip: "Summits students attended", range: [2, 8] },
      { label: "Networking Opportunities", icon: Lightbulb, unit: "count", tip: "External learning and networking opportunities shared and taken up", range: [10, 50] },
      { label: "Students Exposed", icon: Users, unit: "count", tip: "Students who joined at least one exposure activity", range: [60, 220] },
      { label: "Exposure Satisfaction", icon: Star, unit: "percent", tip: "Participants rating the activity good or very good", range: [82, 98] },
    ],
    sections: [
      {
        name: "Exposure Activities",
        blurb: "The exposure activities held, and how many students took part",
        charts: [
          { title: "Participants by Activity Type", sub: "Students taking part in each kind of exposure activity", kind: "hbar", categories: ["Field visits", "Exposure conferences", "Summits", "External learning & networking"], series: ["Students"], range: [20, 140] },
          { title: "Exposure Participants per Quarter", sub: "Students in exposure activities, by gender", kind: "stack", categories: QUARTERS, series: GENDER, range: [8, 60] },
        ],
      },
      {
        name: "Learning & Feedback",
        blurb: "What students gained, and where they went",
        charts: [
          { title: "Learning Outcomes", sub: "Participants agreeing the activity improved each area", kind: "hbar", categories: ["Understanding of health systems", "Professional network", "Career clarity", "Practical skills"], series: ["Agree"], unit: "percent", range: [65, 96] },
          { title: "Field Visit Hosts by Type", sub: "The kinds of institutions visited", kind: "bar", categories: ["Hospital", "Research institute", "Ministry or agency", "NGO", "Health venture"], series: ["Hosts"], range: [1, 9] },
        ],
      },
    ],
  },

  research: {
    slug: "research",
    title: "Research & Innovation Support",
    subtitle: "Research support, capstone research projects, and connections to research professionals",
    kpis: [
      { label: "Students Supported", icon: Users, unit: "count", tip: "Students given research support", range: [30, 120] },
      { label: "Capstone Projects", icon: FlaskConical, unit: "count", tip: "Capstone research projects supported", range: [10, 45] },
      { label: "Capstones Completed", icon: Percent, unit: "percent", tip: "Share of capstone projects completed", range: [35, 80] },
      { label: "Research Connections", icon: UserCheck, unit: "count", tip: "Students connected to a research professional", range: [15, 70] },
      { label: "Research Professionals", icon: GraduationCap, unit: "count", tip: "Research professionals guiding students", range: [5, 24] },
      { label: "Research Outputs", icon: FileText, unit: "count", tip: "Papers, posters and policy briefs produced", range: [5, 35] },
    ],
    sections: [
      {
        name: "Capstone Research",
        blurb: "What students research, and where projects stand",
        charts: [
          { title: "Capstone Projects by Health Theme", sub: "Capstone projects per health theme", kind: "hbar", categories: ["Maternal health", "Health workforce", "Digital health", "Non-communicable diseases", "Mental health"], series: ["Projects"], range: [2, 12] },
          { title: "Capstone Project Stage", sub: "Projects at each stage, from proposal to completion", kind: "bar", categories: ["Proposal", "Ethics approval", "Data collection", "Analysis", "Completed"], series: ["Projects"], range: [2, 14] },
        ],
      },
      {
        name: "Support & Connections",
        blurb: "Research support given, and the professionals students are connected to",
        charts: [
          { title: "Research Support by Type", sub: "Students supported, by kind of support", kind: "hbar", categories: ["Research design", "Literature review", "Data analysis", "Writing and publishing", "Ethics applications"], series: ["Students"], range: [5, 45] },
          { title: "Connections per Quarter", sub: "Students connected to research professionals", kind: "line", categories: QUARTERS, series: ["Connections"], range: [3, 25] },
        ],
      },
    ],
  },

  "progress-monitoring": {
    slug: "progress-monitoring",
    title: "Student Progress Monitoring & Follow-up",
    subtitle: "Tracking mission progress, one-on-one sessions, session feedback, exposure participation and professional referrals",
    kpis: [
      { label: "Missions Tracked", icon: Activity, unit: "count", tip: "Student missions with a progress update this term", range: [60, 200] },
      { label: "One-on-Ones Logged", icon: MessageSquare, unit: "count", tip: "One-on-one sessions recorded in the tracker", range: [200, 700] },
      { label: "Feedback Forms Returned", icon: ClipboardCheck, unit: "count", tip: "Student feedback forms returned after sessions", range: [150, 600] },
      { label: "Feedback Response Rate", icon: Percent, unit: "percent", tip: "Sessions with a feedback form returned", range: [55, 90] },
      { label: "Exposure Participation Logged", icon: Plane, unit: "count", tip: "Exposure participations recorded", range: [60, 220] },
      { label: "Referrals Followed Up", icon: Compass, unit: "percent", tip: "Professional referrals with a recorded follow-up", range: [50, 92] },
    ],
    sections: [
      {
        name: "Mission & Session Tracking",
        blurb: "How mission progress and one-on-one sessions are being tracked",
        charts: [
          { title: "Mission Progress Updates by Term", sub: "Missions tracked, by status", kind: "stack", categories: TERMS, series: ["On track", "At risk", "Stalled"], range: [5, 80] },
          { title: "One-on-One Sessions Logged per Quarter", sub: "Sessions recorded in the tracker", kind: "line", categories: QUARTERS, series: ["Sessions logged"], range: [40, 190] },
        ],
      },
      {
        name: "Feedback & Follow-up",
        blurb: "Session feedback, exposure participation and referral follow-up",
        charts: [
          { title: "Feedback Response Rate by Session Type", sub: "Sessions with a feedback form returned", kind: "hbar", categories: ["Mentorship", "Office hours", "Masterclasses", "Field visits", "Orientation"], series: ["Response rate"], unit: "percent", range: [45, 92] },
          { title: "Referral Follow-up Status", sub: "Professional referrals by follow-up status, per quarter", kind: "stack", categories: QUARTERS, series: ["Followed up", "Pending"], range: [3, 35] },
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
