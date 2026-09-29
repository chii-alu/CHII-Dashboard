import type { Gender } from "@/types";
export type { Gender };
export { GENDERS } from "@/types";
// Synthetic Outreach dataset — seeded so values are stable across renders.
// Models participants engaging in CHII outreach interventions (HENT · HEMP · HECO)
// across partner institutions. Includes "mission students" who also engage in outreach.

export type Institution = "ALX" | "ALU" | "ALCHE" | "Other";
export type Pillar = "HEMP" | "HENT" | "HECO";
export type EngagementStatus = "Registered" | "Completed";

export interface OutreachParticipant {
  id: string;
  institution: Institution;
  pillar: Pillar;
  intervention: string;
  gender: Gender;
  refugee: boolean;        // Refugee / IDP
  pwd: boolean;            // Person with disability
  missionStudent: boolean; // also a degree / mission student
  status: EngagementStatus;
  yearEngaged: number;
}

export const INSTITUTIONS: Institution[] = ["ALX", "ALU", "ALCHE", "Other"];
export const PILLARS: Pillar[] = ["HEMP", "HENT", "HECO"];

/* Interventions grouped by pillar */
export const INTERVENTIONS_BY_PILLAR: Record<Pillar, string[]> = {
  HEMP: ["Career Workshops", "Exposure Events", "SIE", "Courses", "Internships"],
  HENT: ["Ventures", "Venture Funding", "Masterclasses", "Mentorship"],
  HECO: ["Hackathon", "Study Trips", "Exposure & Networking"],
};
export const INTERVENTIONS: string[] = Object.values(INTERVENTIONS_BY_PILLAR).flat();

const PILLAR_OF: Record<string, Pillar> = Object.fromEntries(
  (Object.entries(INTERVENTIONS_BY_PILLAR) as [Pillar, string[]][])
    .flatMap(([p, list]) => list.map(i => [i, p]))
);

export const STATUSES: EngagementStatus[] = ["Registered", "Completed"];

/* approximate relative weight of each intervention's reach */
const INTERVENTION_WEIGHT: Record<string, number> = {
  "Career Workshops": 3.2, "Exposure Events": 2.8, "SIE": 1.8, "Courses": 2.4, "Internships": 1.6,
  "Ventures": 1.4, "Venture Funding": 1.2, "Masterclasses": 2.6, "Mentorship": 1.6,
  "Hackathon": 1.4, "Study Trips": 1.2, "Exposure & Networking": 1.8,
};

const YEARS = [2019, 2020, 2021, 2022, 2023, 2024] as const;

function sd(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
function pickWeighted(s: number): string {
  const total = INTERVENTIONS.reduce((a, k) => a + INTERVENTION_WEIGHT[k], 0);
  let r = sd(s) * total;
  for (const k of INTERVENTIONS) { r -= INTERVENTION_WEIGHT[k]; if (r <= 0) return k; }
  return INTERVENTIONS[0];
}
function pick<T>(arr: readonly T[], s: number): T { return arr[Math.floor(sd(s) * arr.length)]; }
function chance(s: number, p: number): boolean { return sd(s) < p; }

function makeParticipants(): OutreachParticipant[] {
  const out: OutreachParticipant[] = [];
  const N = 1280;
  for (let i = 0; i < N; i++) {
    const intervention = pickWeighted(i * 23 + 8);
    const pillar = PILLAR_OF[intervention];

    // Institution mix — ALU largest, then ALX, ALCHE, other partners
    const inst = sd(i * 3 + 1);
    const institution: Institution = inst < 0.42 ? "ALU" : inst < 0.72 ? "ALX" : inst < 0.9 ? "ALCHE" : "Other";

    // Gender — ~53% F, ~2.5% non-binary
    const g = sd(i * 7 + 3);
    const gender: Gender = g < 0.53 ? "Female" : g < 0.975 ? "Male" : "Non-binary";

    // Mission students engage more in HEMP interventions
    const missionStudent = chance(i * 37 + 12, pillar === "HEMP" ? 0.55 : 0.28);

    // Equity flags — higher among HECO / community work
    const refugee = chance(i * 11 + 4, pillar === "HECO" ? 0.22 : 0.09);
    const pwd     = chance(i * 13 + 5, 0.06);

    const yearEngaged = pick(YEARS, i * 17 + 6);

    // Status — Registered or Completed; older engagements more likely completed
    const age = 2024 - yearEngaged;
    const r = sd(i * 29 + 9);
    let status: EngagementStatus;
    if (age >= 2) {
      status = r < 0.75 ? "Completed" : "Registered";
    } else if (age === 1) {
      status = r < 0.50 ? "Completed" : "Registered";
    } else {
      status = r < 0.40 ? "Completed" : "Registered";
    }

    out.push({
      id: `OUT-${1000 + i}`,
      institution, pillar, intervention, gender,
      refugee, pwd, missionStudent, status, yearEngaged,
    });
  }
  return out;
}

export const OUTREACH_PARTICIPANTS: OutreachParticipant[] = makeParticipants();
export const TREND_YEARS = YEARS;
