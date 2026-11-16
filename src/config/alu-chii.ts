// ALU-CHII Executive Dashboard: the content of every page, from the KPI and chart design.
// Values are dummy data for now (see alu-chii-dummy.ts) until each log is connected.
import type { ComponentType } from "react";
import {
  Users, Briefcase, GraduationCap, Handshake, Building2, FileCheck, ShieldCheck, FlaskConical,
  HeartPulse, Mic, Megaphone, Coins, Landmark, UserCheck, Sparkles, Wallet, ClipboardCheck,
  Network, Presentation, Target, Award, Activity, Globe, Radio, Library, FileText, HandCoins,
} from "lucide-react";

export type AluIcon = ComponentType<any>;

export type AluKpi = { label: string; definition: string; sub: string; icon: AluIcon };
export type AluGroup = { key: string; label: string; blurb: string };
export type AluChart = { title: string; sub: string; info?: string; group?: string };
export type AluTable = { title: string; sub: string; columns: string[]; group?: string };
/** `groups` are the section pills of a tab (as on Outreach): each shows its own charts and tables. */
export type AluTab = { key: string; label: string; kpis: AluKpi[]; charts: AluChart[]; tables: AluTable[]; groups?: AluGroup[] };

export type AluSection = {
  slug: string;
  title: string;      // header title
  question: string;   // the question the section answers (header subtitle)
  nav: string;        // short label in the navigation
  owner?: string;      // shown as "Data owner" only where set
  tabs: AluTab[];
};

export const ALU_TITLE = "ALU-CHII Executive Dashboard";

// ─── Overview: one headline number per section ─────────────────────────────────
export const OVERVIEW_KPIS: AluKpi[] = [
  { label: "Funding Secured", definition: "Funding secured this year as % of the annual target (USD)", sub: "Institutional and Operational Excellence", icon: Wallet },
  { label: "Partnerships Activated", definition: "Formal partnerships with active joint work this year", sub: "Partnerships", icon: Handshake },
  { label: "Research Outputs", definition: "Papers, policy briefs, reports and stakeholder presentations produced this year", sub: "Health Systems Contribution and Impact", icon: FlaskConical },
  { label: "People Reached", definition: "Unique beneficiaries reached by CHII programmes this year", sub: "Health Systems Contribution and Impact", icon: Users },
  { label: "Projects on Track", definition: "% of active projects on schedule and reporting on time", sub: "Institutional and Operational Excellence", icon: Target },
  { label: "Strategic Visibility", definition: "Conferences, panels and high-level forums where CHII was represented", sub: "External Recognition", icon: Megaphone },
];

export const OVERVIEW_AREAS = [
  "Talent and Institutional Capabilities",
  "Partnerships",
  "Institutional and Operational Excellence",
  "Health Systems Contribution and Impact",
  "External Recognition",
];

// ─── Sections ──────────────────────────────────────────────────────────────────
export const SECTIONS: Record<string, AluSection> = {
  talent: {
    slug: "talent",
    title: "Talent and Institutional Capabilities",
    question: "What capability do we have now that didn't exist before?",
    nav: "Talent",
    tabs: [
      {
        key: "main",
        label: "Capabilities",
        kpis: [
          { label: "New Capabilities Established", definition: "Institutional capabilities, services or programmes CHII now runs that didn't exist before (e.g. SIE, research unit)", sub: "added this year", icon: Sparkles },
          { label: "Staff Trained", definition: "% of CHII staff who completed professional development this year", sub: "training hours in total", icon: GraduationCap },
          { label: "New Skills Acquired", definition: "New technical skills or certifications gained by the team (e.g. research methods, data analysis, grant writing)", sub: "across staff", icon: Award },
          { label: "Staff Retention", definition: "% of staff employed at the start of the year still on the team", sub: "joined · left", icon: UserCheck },
          { label: "Cross-ALU Collaborations", definition: "Joint initiatives with other ALU departments that produced an output", sub: "outputs delivered", icon: Network },
        ],
        groups: [
          { key: "capabilities", label: "Capabilities", blurb: "What capabilities CHII has built, and the training behind them." },
          { key: "collaboration", label: "Staff & Collaboration", blurb: "How the research team is growing, and the work done with other ALU departments." },
        ],
        charts: [
          { title: "Capability Timeline", sub: "When each new capability launched, and its status", info: "Each capability on the register, placed at its launch date.", group: "capabilities" },
          { title: "Professional Development by Type", sub: "Training, conferences, certifications, mentoring, by quarter", group: "capabilities" },
          { title: "Research Staff Capacity", sub: "Research staff by skill area", group: "collaboration" },
          { title: "Collaboration Outputs by Department", sub: "Outputs from work with each ALU department", group: "collaboration" },
        ],
        tables: [
          { title: "Capabilities register", sub: "Every new capability, its owner and its evidence", columns: ["Capability", "Launched", "Owner", "What it enables", "Status", "Evidence"], group: "capabilities" },
          { title: "Collaborations log", sub: "Work with other ALU departments and what it produced", columns: ["ALU department", "Initiative", "Output", "Date", "Evidence"], group: "collaboration" },
        ],
      },
    ],
  },

  partnerships: {
    slug: "partnerships",
    title: "Partnerships",
    question: "Are our partnerships moving from identified to activated?",
    nav: "Partnerships",
    tabs: [
      {
        key: "main",
        label: "Pipeline",
        kpis: [
          { label: "Active Partnerships", definition: "Partnerships with joint work under way this year", sub: "of formalised partnerships", icon: Handshake },
          { label: "Partnerships Formalised", definition: "MoUs or agreements signed this year", sub: "vs. annual target", icon: FileCheck },
          { label: "Pipeline", definition: "Partners identified or engaged, not yet formalised", sub: "stalled for over 90 days", icon: Network },
          { label: "Executive-Level Partnerships", definition: "Partnerships that need ALU or CHII executive engagement", sub: "awaiting action", icon: UserCheck },
          { label: "Reach Through Partners", definition: "People reached through partner-delivered or co-delivered activities", sub: "across countries", icon: Globe },
        ],
        groups: [
          { key: "pipeline", label: "Pipeline & Partners", blurb: "Where each partner sits in the funnel, and what kind of partner it is." },
          { key: "reach", label: "Projects & Reach", blurb: "Which projects the partnerships support, and where the partners are based." },
        ],
        charts: [
          { title: "Partnership Funnel", sub: "Identified → engaged → formalised → activated", info: "Identified: a potential partner named as a fit. Engaged: at least one meeting or exchange. Formalised: an MoU, contract or agreement is signed. Activated: joint work under way.", group: "pipeline" },
          { title: "Partnerships by Category", sub: "Government, academic, health provider, private sector, NGO, funder", group: "pipeline" },
          { title: "Partnerships by Project or Intervention", sub: "Which HEMP, HENT and HECO projects each partnership supports", group: "reach" },
          { title: "Partner Map", sub: "Where partners are based", group: "reach" },
        ],
        tables: [
          { title: "Partnership register", sub: "Every partner, its stage and the next step", columns: ["Partner", "Category", "Stage", "Linked project", "Executive engagement needed", "Lead", "Next step", "Agreement link"], group: "pipeline" },
        ],
      },
    ],
  },

  operations: {
    slug: "operations",
    title: "Institutional and Operational Excellence",
    question: "Are we well run and financially sustainable?",
    nav: "Institutional Excellence",
    tabs: [
      {
        key: "operations",
        label: "Operations",
        kpis: [
          { label: "SOPs in Place", definition: "Approved SOPs and policies covering CHII's core activities", sub: "of activities covered", icon: ClipboardCheck },
          { label: "SOP Compliance", definition: "% of sampled activities with evidence the SOP was followed", sub: "from sampled activities", icon: ShieldCheck },
          { label: "Projects on Track", definition: "% of active projects on schedule against their workplan", sub: "behind schedule", icon: Target },
          { label: "Reports on Time", definition: "% of donor and internal reports submitted by their due date", sub: "overdue", icon: FileCheck },
          { label: "High Risks Mitigated", definition: "% of high-rated risks with an agreed mitigation in place", sub: "open high risks", icon: ShieldCheck },
        ],
        charts: [
          { title: "SOP Compliance by Process", sub: "Compliance % for each SOP, against an 80% target", info: "Each quarter, sample activities under each SOP and check for the required evidence (signed forms, checklists, approvals). Record pass or fail." },
          { title: "Project Delivery Status", sub: "On track, at risk, delayed, completed" },
          { title: "Risk Heat Map", sub: "Risks by likelihood and impact" },
          { title: "CQI Audit Findings", sub: "Findings by severity from each quarterly CQI audit, and how many are closed" },
        ],
        tables: [
          { title: "Project tracker", sub: "Every active project, its milestone and next report", columns: ["Project", "Lead", "Funder", "Milestone due", "Status", "Next report due"] },
          { title: "Risk register", sub: "Every risk, its rating and its mitigation", columns: ["Risk", "Likelihood", "Impact", "Owner", "Mitigation", "Status"] },
          { title: "SOP audit log", sub: "Each sampled activity and what the audit found", columns: ["SOP", "Activity sampled", "Date", "Evidence found", "Auditor", "Action"] },
        ],
      },
      {
        key: "resources",
        label: "Resource Mobilisation",
        kpis: [
          { label: "Funding Secured", definition: "Funding confirmed this year (USD)", sub: "of annual target", icon: Coins },
          { label: "Annual Funding Target", definition: "The target set for the year (USD)", sub: "gap", icon: Target },
          { label: "Qualified Pipeline", definition: "Value of proposals submitted or in late-stage discussion (USD)", sub: "opportunities", icon: Briefcase },
          { label: "Proposal Success Rate", definition: "% of submitted proposals that were funded", sub: "submitted this year", icon: Award },
          { label: "Potential Funders", definition: "Funders identified and being cultivated", sub: "new this year", icon: Landmark },
        ],
        charts: [
          { title: "Funding vs Target", sub: "Secured and weighted pipeline against the annual target" },
          { title: "Funding Pipeline by Stage", sub: "Concept note, proposal submitted, under review, secured" },
          { title: "Funding by Source", sub: "AHC funding, other grants, contracts, philanthropy" },
          { title: "Funding Secured over Time", sub: "By quarter, this year vs last" },
        ],
        tables: [],
      },
    ],
  },

  "health-systems": {
    slug: "health-systems",
    title: "Health Systems Contribution and Impact",
    question: "What are we changing in health systems, and for whom?",
    nav: "Health Systems Impact",
    tabs: [
      {
        key: "research",
        label: "Research and Knowledge",
        kpis: [
          { label: "Research Projects Active", definition: "Research projects under way this year", sub: "AHC-funded · other funders", icon: FlaskConical },
          { label: "Concept Notes and Proposals", definition: "Concept notes developed and proposals submitted this year", sub: "proposals funded", icon: Briefcase },
          { label: "Research Funding Secured", definition: "Research funding confirmed this year (USD)", sub: "from beyond AHC", icon: Coins },
          { label: "Research Outputs", definition: "Papers, reports, policy briefs, datasets and tools produced", sub: "peer-reviewed", icon: Library },
          { label: "Stakeholder Presentations", definition: "Times research findings were presented to ministries, partners or communities", sub: "policy audiences", icon: Presentation },
        ],
        charts: [
          { title: "Research Pipeline", sub: "Concept notes → proposals submitted → funded → outputs", info: "Covers HECO research, AHC-funded research and research beyond AHC, including joint work with partners." },
          { title: "Research Funding by Source", sub: "AHC vs other funders, by year (USD)" },
          { title: "Outputs by Type", sub: "Publications, policy briefs, reports, presentations, by quarter" },
          { title: "Research by Health Theme", sub: "Projects by theme (e.g. maternal health, health workforce, digital health)" },
        ],
        tables: [],
      },
      {
        key: "impact",
        label: "Health System Impact",
        kpis: [
          { label: "Health System Changes", definition: "Documented changes CHII contributed to: policies, guidelines, protocols, services or practices adopted", sub: "at national level", icon: HeartPulse },
          { label: "Institutions Supported", definition: "Ministries, hospitals and health organisations CHII worked with directly", sub: "across countries", icon: Building2 },
          { label: "Beneficiaries Reached", definition: "Unique people reached by CHII programmes (students, health workers, officials, founders)", sub: "female · PWD or refugee", icon: Users },
          { label: "Health Workers Trained", definition: "Health workers and officials trained through CHII courses and fellowships", sub: "public sector", icon: GraduationCap },
          { label: "People Indirectly Influenced", definition: "Estimated people served by the institutions, ventures and policies CHII supported", sub: "method noted on hover", icon: Activity },
        ],
        charts: [
          { title: "Health System Changes by Type", sub: "Policy, guideline, service, practice or system change, by level" },
          { title: "Beneficiaries by Pillar and Year", sub: "HEMP, HENT and HECO beneficiaries over time" },
          { title: "Reach by Country", sub: "Beneficiaries and institutions by country" },
          { title: "Contribution Stories", sub: "The change, CHII's role and the evidence" },
        ],
        tables: [
          { title: "Health system change log", sub: "Each documented change and the evidence for it", columns: ["Change", "Institution", "Level", "Country", "CHII contribution", "Date", "Evidence"] },
        ],
      },
    ],
  },

  research: {
    slug: "research",
    title: "Research and Knowledge Generation",
    question: "What research are we producing, and how is it being funded?",
    nav: "Research & Knowledge",
    tabs: [
      {
        key: "main",
        label: "Research",
        kpis: [
          { label: "Research Projects", definition: "Research projects underway or completed", sub: "underway · completed", icon: FlaskConical },
          { label: "Papers Published", definition: "Papers published", sub: "this year", icon: FileText },
          { label: "Grants Applied For", definition: "Grant applications submitted", sub: "submitted this year", icon: HandCoins },
          { label: "Grants Secured", definition: "Grants secured", sub: "awarded", icon: Coins },
          { label: "Institutions Engaged", definition: "Institutions engaged in research", sub: "partner institutions", icon: Building2 },
          { label: "Masterclass Reach", definition: "Participants in research masterclasses", sub: "across sessions", icon: Users },
        ],
        charts: [
          { title: "Papers by Research Topic", sub: "Number of papers in each topic" },
          { title: "Grant Pipeline", sub: "Applied, under review, awarded and rejected" },
          { title: "Masterclass Attendance per Session", sub: "Training attendance, kept separate from research output" },
        ],
        tables: [],
      },
    ],
  },

  recognition: {
    slug: "recognition",
    title: "External Recognition",
    question: "How visible and trusted is CHII?",
    nav: "External Recognition",
    tabs: [
      {
        key: "main",
        label: "Visibility",
        kpis: [
          { label: "Strategic Visibility", definition: "Conferences, panels and high-level forums where CHII was represented (e.g. Rwanda Breast Cancer Symposium, AHTS)", sub: "as keynote or panellist", icon: Megaphone },
          { label: "Speaking Engagements", definition: "Times CHII staff spoke as keynote, panellist or moderator", sub: "international", icon: Mic },
          { label: "Advisory and Committee Seats", definition: "Advisory boards, technical working groups and policy committees CHII sits on", sub: "government or policy", icon: Landmark },
          { label: "Knowledge Dissemination", definition: "Webinars, opinion pieces, op-eds, blogs and media features published", sub: "media mentions", icon: Radio },
          { label: "Audience Reached", definition: "People reached through events, webinars, publications and media", sub: "live · online", icon: Users },
        ],
        groups: [
          { key: "events", label: "Events & Roles", blurb: "Where CHII was visible, and the role it played at each event." },
          { key: "audience", label: "Audience & Advisory", blurb: "Who CHII reached, and the advisory seats it holds." },
        ],
        charts: [
          { title: "Visibility by Type", sub: "Conferences, panels, high-level forums, youth roundtables, media, by quarter", group: "events" },
          { title: "Delegate", sub: "Attendee, panellist, moderator, keynote, organiser", group: "events" },
          { title: "Audience Reached over Time", sub: "Total audience by quarter, in person and online", group: "audience" },
          { title: "Advisory Roles by Level", sub: "Institutional, national, regional and global seats", group: "audience" },
        ],
        tables: [
          { title: "Visibility log", sub: "Every event or platform, with its evidence", columns: ["Event or platform", "Date", "Type", "CHII representative", "Role", "Audience size", "Evidence"], group: "events" },
          { title: "Advisory roles register", sub: "Every board or committee CHII sits on", columns: ["Board or committee", "Organisation", "Level", "CHII member", "Since", "Status"], group: "audience" },
        ],
      },
    ],
  },
};

export const SECTION_ORDER = ["talent", "partnerships", "operations", "health-systems", "recognition"] as const;

export const FILTERS = {
  basis: ["Calendar year", "ALU financial year"],
  quarter: ["All quarters", "Q1", "Q2", "Q3", "Q4"],
  pillar: ["All pillars", "HEMP", "HENT", "HECO", "Centre-wide"],
  country: ["All countries"],
} as const;
