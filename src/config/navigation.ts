// Navigation — the single source of truth for every portal's routes and labels.
// Adding a page means adding one entry here; the nav renders itself.

import type { Portal } from "@/theme/portals";

export interface NavItem {
  label: string;
  href: string;
}

export interface PortalNavConfig {
  /** Large wordmark in the nav, e.g. "HENT". */
  wordmark: string;
  /** Stacked lines beside the wordmark. */
  wordmarkLines: string[];
  /** The portal's index route. */
  rootHref: string;
  items: NavItem[];
}

export const PORTAL_NAVS: Record<Portal, PortalNavConfig> = {
  hent: {
    wordmark: "HENT",
    wordmarkLines: ["HEALTH", "ENTREPRENEURSHIP", "PILLAR"],
    rootHref: "/hent/at-a-glance",
    items: [
      { label: "At a Glance",           href: "/hent/at-a-glance" },
      { label: "Overview",              href: "/hent/overview" },
      { label: "Ventures",              href: "/hent/ventures" },
      { label: "Venture Funding",       href: "/hent/venture-funding" },
      { label: "Masterclass",           href: "/hent/masterclasses" },
      { label: "Hackathon",             href: "/hent/hackathons" },
      { label: "Mentorship",            href: "/hent/mentorship" },
      { label: "Exposure & Networking", href: "/hent/exposure-networking" },
    ],
  },

  hm: {
    wordmark: "HM",
    wordmarkLines: ["HEALTH", "MISSIONS"],
    rootHref: "/hm/career-workshops",
    items: [
      { label: "Mission Students",               href: "/hm/career-workshops" },
      { label: "Mentorship Program",             href: "/hm/exposure-events" },
      { label: "Guest Faculty & Sessions",       href: "/hm/internships" },
      { label: "Study Trips",                    href: "/hm/sie" },
      { label: "Research",                       href: "/hm/course" },
    ],
  },

  hemp: {
    wordmark: "Health Missions & HEMP",
    wordmarkLines: ["HEALTH", "EMPLOYMENT", "PILLAR"],
    rootHref: "/hemp",
    items: [
      { label: "At a Glance",                    href: "/hemp" },
      { label: "Career Workshops",               href: "/hemp/career-workshops" },
      { label: "Exposure Events",                href: "/hemp/exposure-events" },
      { label: "Internships",                    href: "/hemp/internships" },
      { label: "SIE",                             href: "/hemp/sie" },
      { label: "Courses",                        href: "/hemp/course" },
    ],
  },

  heco: {
    wordmark: "HECO",
    wordmarkLines: ["HEALTH", "ECOSYSTEMS", "PILLAR"],
    rootHref: "/heco",
    items: [
      { label: "At a Glance",                            href: "/heco" },
      { label: "Public Sector Fellowship",               href: "/heco/public-sector-fellowship" },
      { label: "Health Expert in Residence Programme",   href: "/heco/health-expert-in-residence" },
      { label: "Research Activities",                    href: "/heco/research-activities" },
      { label: "Public Sector Innovation Hackathon",     href: "/heco/innovation-hackathon" },
      { label: "Executive Courses",                      href: "/heco/executive-courses" },
      { label: "Impact Stories",                         href: "/heco/impact-stories" },
    ],
  },

  alu: {
    wordmark: "ALU-CHII",
    wordmarkLines: [],
    rootHref: "/alu-chii/at-a-glance",
    items: [
      { label: "At a Glance",         href: "/alu-chii/at-a-glance" },
      { label: "Outreach",            href: "/alu-chii/outreach" },
      { label: "Youth in Work",       href: "/alu-chii/youth-in-work" },
      { label: "Wage Employment",     href: "/alu-chii/wage-employment" },
      { label: "Entrepreneurship",    href: "/alu-chii/entrepreneurship" },
      { label: "Further Education",   href: "/alu-chii/further-education" },
      { label: "Impact Reports",      href: "/alu-chii/reports" },
      { label: "Impact Stories",      href: "/alu-chii/stories" },
    ],
  },

  executive: {
    wordmark: "CHII",
    wordmarkLines: ["EXECUTIVE", "IMPACT", "DASHBOARD"],
    rootHref: "/executive",
    items: [
      { label: "At a Glance", href: "/executive/at-a-glance" },
      { label: "Overview",    href: "/executive" },
    ],
  },
};
