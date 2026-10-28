import type { Gender } from "@/types";
export type { Gender };
export { GENDERS } from "@/types";
/* ════════════════════════════════════════════════════════
   Entrepreneurship — synthetic dataset
   Deterministic (seeded) so SSR and CSR render identically.
═══════════════════════════════════════════════════════ */

export type Stage = "Idea" | "Pre-seed" | "Seed" | "Early-stage" | "Growth" | "Scaling" | "Mature" | "Closed";
export type Status = "Active" | "Pre-seed" | "Seed" | "Early-stage" | "Growth" | "Scaling" | "Closed" | "Non-operational";
export type FundingSource = "Personal / bootstrap" | "Grant" | "Angel / investor" | "Accelerator" | "Loan";

export interface Venture {
  id: number;
  gender: Gender;          // founder gender
  stage: Stage;
  status: Status;
  fundingSource: FundingSource;
  formal: boolean;         // formally registered
  enablerSupport: boolean; // received enabler/accelerator support
  yearLaunched: number;
  jobsCreated: number;
  rating: number;          // 1–5
}

export const STAGES: Stage[] = ["Idea", "Early-stage", "Growth", "Scaling"];
export const STATUSES: Status[] = ["Active", "Non-operational", "Closed"];
export const FUNDING_SOURCES: FundingSource[] = ["Personal / bootstrap", "Grant", "Angel / investor", "Accelerator", "Loan"];

/* pipeline funnel order (descending) */
export const PIPELINE: Stage[] = ["Idea", "Pre-seed", "Seed", "Early-stage", "Growth", "Scaling"];

/* mulberry32 — small deterministic PRNG */
function rng(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(r: () => number, weighted: [T, number][]): T {
  const total = weighted.reduce((s, [, w]) => s + w, 0);
  let x = r() * total;
  for (const [val, w] of weighted) {
    if ((x -= w) <= 0) return val;
  }
  return weighted[weighted.length - 1][0];
}

export const VENTURES: Venture[] = [];
