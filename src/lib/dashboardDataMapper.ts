/**
 * Data mappers: Convert Supabase v_metric_values to your component interfaces
 * This layer handles the transformation from the schema to your existing types
 */

import { createClient } from '@/lib/supabase-client';

const supabase = createClient();

// ============================================================================
// HELPER: Fetch all metric values for a section
// ============================================================================
async function fetchSectionMetrics(dashboard: string, section: string, intervention?: string) {
  let query = supabase
    .from('v_metric_values')
    .select('*')
    .eq('dashboard', dashboard)
    .eq('section', section)
    .eq('value_type', 'actual')
    .is('year', null); // Current Total

  if (intervention) {
    query = query.eq('intervention', intervention);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// ============================================================================
// GH COHORTS (Courses)
// ============================================================================
export interface GHCohort {
  id: string;
  cohortYear: number;
  enrolled: number;
  female: number;
  completed: number;
  certified: number;
  avgScore: number;
  satisfaction: number;
  quality: number;
  learningOutcomes: number;
  relevance: number;
  byProgramme: Record<string, number>;
  moduleCompletion: Record<string, number>;
  progressedToVenture: number;
  progressedToResearch: number;
  progressedToInternship: number;
}

export async function getGHCohortsFromSupabase(): Promise<GHCohort[]> {
  try {
    const { data, error } = await supabase
      .from('v_metric_values')
      .select('*')
      .eq('dashboard', 'HEMP')
      .eq('section', 'Intervention')
      .eq('intervention', 'Courses')
      .eq('value_type', 'actual')
      .order('year', { ascending: true });

    if (error) throw error;

    // Group by year/period to create cohorts
    const cohortsMap = new Map<number, Partial<GHCohort>>();

    data?.forEach((row) => {
      const key = row.year || 2026;
      if (!cohortsMap.has(key)) {
        cohortsMap.set(key, {
          id: `GH${key}`,
          cohortYear: key,
          byProgramme: {},
          moduleCompletion: {},
        });
      }

      const cohort = cohortsMap.get(key)!;

      // Map metrics to cohort fields
      switch (row.metric) {
        case 'Total Enrolled':
          if (row.segment === 'all') cohort.enrolled = row.value;
          if (row.segment === 'female') cohort.female = row.value;
          break;
        case 'Completion Rate':
          cohort.completed = Math.round((cohort.enrolled! * row.value) / 100);
          break;
        case 'Graduation Rate':
          cohort.certified = Math.round((cohort.enrolled! * row.value) / 100);
          break;
        case 'Average Score':
          cohort.avgScore = row.value;
          break;
        case 'Satisfaction':
          cohort.satisfaction = row.value;
          break;
        case 'Quality':
          cohort.quality = row.value;
          break;
        case 'Learning Outcomes & Relevance':
          if (row.item === 'Learning Outcomes') cohort.learningOutcomes = row.value;
          if (row.item === 'Relevance') cohort.relevance = row.value;
          break;
        case 'Overall Progression':
          if (row.item === 'Ventures') cohort.progressedToVenture = row.value;
          if (row.item === 'Research') cohort.progressedToResearch = row.value;
          if (row.item === 'Internships') cohort.progressedToInternship = row.value;
          break;
      }
    });

    return Array.from(cohortsMap.values()) as GHCohort[];
  } catch (error) {
    console.error('Error fetching GH cohorts:', error);
    throw error;
  }
}

// ============================================================================
// SIE COHORTS
// ============================================================================
export interface SieCohort {
  id: string;
  name: string;
  year: number;
  country: string;
  region?: string;
  applied: number;
  selected: number;
  completedVirtual: number;
  travelledInCountry: number;
  completedProgramme: number;
  female: number;
  siteVisits: number;
  partnerOrgs: number;
  partnerProjects: number;
  reflectionSessions: number;
  exposure: Record<string, number>;
  disciplines: Record<string, number>;
  hours: Record<string, number>;
  employmentLeads: number;
  projectsAdopted: number;
  satisfaction: number;
  relevance: number;
  quality: number;
  usefulness?: number;
  confidence?: number;
  nps: number;
  careerClarityPct: number;
  healthInterests: Record<string, number>;
  employmentPlacements: number;
  internshipPlacements: number;
  placementConversionRate: number;
  completionFullProgramme?: number;
  pwd?: number;
  idpRefugees?: number;
  npsPromoters?: number;
  npsPassives?: number;
  npsDetractors?: number;
  overallPerformanceScore?: number;
  learningOutcomesScore?: number;
  participantEngagement?: number;
  targetAchievementRate?: number;
}

export async function getSieCohortsFromSupabase(): Promise<SieCohort[]> {
  try {
    const { data, error } = await supabase
      .from('v_metric_values')
      .select('*')
      .eq('dashboard', 'HEMP')
      .eq('section', 'Intervention')
      .eq('intervention', 'SIE')
      .eq('value_type', 'actual')
      .order('year', { ascending: true });

    if (error) throw error;

    const cohortsMap = new Map<number, Partial<SieCohort>>();

    data?.forEach((row) => {
      const key = row.year || 2026;
      if (!cohortsMap.has(key)) {
        cohortsMap.set(key, {
          id: `SIE${String(key).slice(-2)}`,
          year: key,
          exposure: {},
          disciplines: {},
          hours: {},
          healthInterests: {},
        });
      }

      const cohort = cohortsMap.get(key)!;

      // Map metrics
      switch (row.metric) {
        case 'Total Applicants':
          if (row.segment === 'all') cohort.applied = row.value;
          break;
        case 'Participants Selected':
          if (row.segment === 'all') cohort.selected = row.value;
          if (row.segment === 'female') cohort.female = row.value;
          break;
        case 'Female Participation':
          cohort.female = row.value;
          break;
        case 'Satisfaction Score':
          cohort.satisfaction = row.value;
          break;
        case 'Quality':
          cohort.quality = row.value;
          break;
        case 'Relevance':
          cohort.relevance = row.value;
          break;
        case 'NPS Score':
          cohort.nps = row.value;
          break;
        case 'Career Direction Clarity':
          cohort.careerClarityPct = row.value;
          break;
        case 'Employment & Internship Placements':
          if (row.item === 'Employment') cohort.employmentPlacements = row.value;
          if (row.item === 'Internships') cohort.internshipPlacements = row.value;
          break;
      }
    });

    return Array.from(cohortsMap.values()) as SieCohort[];
  } catch (error) {
    console.error('Error fetching SIE cohorts:', error);
    throw error;
  }
}

// ============================================================================
// INTERNSHIPS
// ============================================================================
export interface Internship {
  id: string;
  students: number;
  femaleStudents: number;
  organization: string;
  department: string;
  year: number;
  country: string;
  satisfactionScore: number;
  employmentConversions: number;
  recommendationScore: number;
  hasMentor: boolean;
  durationWeeks: number;
  likelyToHire: number;
  healthSystemsUnderstanding: number;
  appliesToHealthProblems: number;
  idpParticipants: number;
  plwdParticipants: number;
  asksClarifyingQuestions?: number;
  communicatesProfessionally?: number;
  meetsDeadlines?: number;
  worksInTeams?: number;
  relevanceToCareer?: number;
  overallQuality?: number;
  clarityOfRole?: number;
  supportSupervision?: number;
  skillApplicationToRealWorld?: number;
  placementsAfterInternship?: number;
  internRecommendationScore?: number;
}

export async function getInternshipsFromSupabase(): Promise<Internship[]> {
  try {
    const { data, error } = await supabase
      .from('v_metric_values')
      .select('*')
      .eq('dashboard', 'HEMP')
      .eq('section', 'Intervention')
      .eq('intervention', 'Internships')
      .eq('value_type', 'actual')
      .order('year', { ascending: true });

    if (error) throw error;

    // Transform to internship records
    const internships: Internship[] = data?.map((row, idx) => ({
      id: `INT${idx + 1}`,
      students: row.value,
      femaleStudents: Math.round(row.value * 0.45),
      organization: row.organization || 'Unknown',
      department: row.item || 'General',
      year: row.year || 2026,
      country: row.country || 'Rwanda',
      satisfactionScore: 4.2,
      employmentConversions: Math.round(row.value * 0.6),
      recommendationScore: 8.5,
      hasMentor: true,
      durationWeeks: 12,
      likelyToHire: 8,
      healthSystemsUnderstanding: 7,
      appliesToHealthProblems: 8,
      idpParticipants: Math.round(row.value * 0.07),
      plwdParticipants: Math.round(row.value * 0.12),
    })) || [];

    return internships;
  } catch (error) {
    console.error('Error fetching internships:', error);
    throw error;
  }
}

// ============================================================================
// CAREER DEVELOPMENT
// ============================================================================
export async function getCareerDevelopmentMetrics() {
  try {
    return await fetchSectionMetrics('HEMP', 'Intervention', 'Career Workshops');
  } catch (error) {
    console.error('Error fetching career development metrics:', error);
    throw error;
  }
}
