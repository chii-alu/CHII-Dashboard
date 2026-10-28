import type { Gender } from "@/types";
export type { Gender };
export { GENDERS } from "@/types";
/* ════════════════════════════════════════════════════════
   Further Education — synthetic dataset
   Deterministic (seeded) so SSR and CSR render identically.
═══════════════════════════════════════════════════════ */


export interface FeStudent {
  id: number;
  gender: Gender;
  scholar: boolean;            // MCF scholar cohort
  country: string;             // country of origin
  programme: string;          // ALU degree programme
  qualification: string;
  field: string;
  funding: string;
  destination: string;        // region of study
  countryOfStudy: string;
  relevance: string;
  year: number;                // year enrolled
  active: boolean;             // currently enrolled this cycle
}

export const QUALIFICATIONS = ["Bachelor's top-up", "Postgraduate diploma", "Master's", "Doctorate", "Professional cert"];
export const FIELDS = ["Business & Management", "Engineering & Tech", "Public Health / Policy", "Education", "Sciences", "Arts / Other"];
export const FUNDING_SOURCES = ["Scholarship / funded", "Self-funded", "Employer", "Loan"];
export const DESTINATIONS = ["Within Africa", "Europe", "North America", "Asia / Other"];
export const RELEVANCE = ["Directly related", "Somewhat related", "Different field"];
export const COUNTRIES = ["Rwanda", "Kenya", "Nigeria", "Ghana", "Uganda", "South Africa", "Ethiopia", "Other Africa"];
export const PROGRAMMES = ["BSc Software Eng", "Computer Science", "Entrepreneurial Leadership", "International Business & Trade", "Global Challenges"];
export const YEARS = [2025, 2026, 2027, 2028, 2029, 2030];

const STUDY_COUNTRIES: Record<string, string[]> = {
  "Within Africa": ["Rwanda", "Kenya", "South Africa", "Ghana"],
  "Europe": ["United Kingdom", "Germany", "France"],
  "North America": ["United States", "Canada"],
  "Asia / Other": ["India", "China", "Australia"],
};

export const FE_STUDENTS: FeStudent[] = [];
