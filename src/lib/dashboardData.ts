import { createClient } from '@/lib/supabase-client';

const supabase = createClient();

// ============================================================================
// HEADLINES: KPI cards with value, female/male counts, target & progress
// ============================================================================
interface HeadlineCard {
  metric: string;
  value: number;
  female?: number;
  male?: number;
  target?: number;
  progress?: number; // percentage
  unit?: string;
}

export async function getHeadlines(
  dashboard: string,
  section: string,
  options?: { intervention?: string; year?: number }
): Promise<HeadlineCard[]> {
  try {
    let query = supabase
      .from('v_metric_values')
      .select('metric, value, segment, unit, intervention')
      .eq('dashboard', dashboard)
      .eq('section', section)
      .eq('value_type', 'actual')
      .is('item', null)
      .is('breakdown', null)
      .is('period', null);

    if (options?.intervention) {
      query = query.eq('intervention', options.intervention);
    }

    if (options?.year) {
      query = query.eq('year', options.year);
    } else {
      query = query.is('year', null); // Current Total
    }

    const { data, error } = await query;

    if (error) throw error;

    // Group by metric and aggregate by segment
    const grouped = new Map<string, HeadlineCard>();

    data?.forEach((row) => {
      const key = row.metric;
      if (!grouped.has(key)) {
        grouped.set(key, {
          metric: row.metric,
          value: 0,
          unit: row.unit,
        });
      }

      const card = grouped.get(key)!;
      if (row.segment === 'all') {
        card.value = row.value;
      } else if (row.segment === 'female') {
        card.female = row.value;
      } else if (row.segment === 'male') {
        card.male = row.value;
      }
    });

    // Fetch targets for progress calculation
    let targetQuery = supabase
      .from('v_metric_values')
      .select('metric, value')
      .eq('dashboard', dashboard)
      .eq('section', section)
      .eq('value_type', 'target')
      .is('item', null)
      .is('breakdown', null)
      .is('period', null);

    if (options?.intervention) {
      targetQuery = targetQuery.eq('intervention', options.intervention);
    }

    const { data: targets } = await targetQuery;

    targets?.forEach((row) => {
      const card = grouped.get(row.metric);
      if (card) {
        card.target = row.value;
        if (card.value && card.target) {
          card.progress = Math.round((card.value / card.target) * 100);
        }
      }
    });

    return Array.from(grouped.values());
  } catch (error) {
    console.error('Error fetching headlines:', error);
    throw error;
  }
}

// ============================================================================
// TRENDS: One row per year { year, all, female, male, ... }
// ============================================================================
interface TrendRow {
  year: number | string;
  all?: number;
  female?: number;
  male?: number;
  [key: string]: number | string | undefined;
}

export async function getTrend(
  dashboard: string,
  section: string,
  metric: string,
  options?: { intervention?: string }
): Promise<TrendRow[]> {
  try {
    let query = supabase
      .from('v_metric_values')
      .select('year, value, segment, intervention')
      .eq('dashboard', dashboard)
      .eq('section', section)
      .eq('metric', metric)
      .eq('value_type', 'actual')
      .is('item', null)
      .is('breakdown', null)
      .is('period', null)
      .not('year', 'is', null)
      .order('year', { ascending: true });

    if (options?.intervention) {
      query = query.eq('intervention', options.intervention);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Group by year and segment
    const grouped = new Map<number, TrendRow>();

    data?.forEach((row) => {
      const year = row.year;
      if (!grouped.has(year)) {
        grouped.set(year, { year });
      }

      const row_data = grouped.get(year)!;
      if (row.segment === 'all') {
        row_data.all = row.value;
      } else if (row.segment === 'female') {
        row_data.female = row.value;
      } else if (row.segment === 'male') {
        row_data.male = row.value;
      }
    });

    return Array.from(grouped.values());
  } catch (error) {
    console.error('Error fetching trend:', error);
    throw error;
  }
}

// ============================================================================
// BREAKDOWN: One row per category, largest first
// ============================================================================
interface BreakdownRow {
  category: string;
  value: number;
  percentage?: number;
  [key: string]: string | number | undefined;
}

export async function getBreakdown(
  dashboard: string,
  section: string,
  metric: string,
  options?: { intervention?: string; year?: number }
): Promise<BreakdownRow[]> {
  try {
    let query = supabase
      .from('v_metric_values')
      .select('item, value, segment')
      .eq('dashboard', dashboard)
      .eq('section', section)
      .eq('metric', metric)
      .eq('value_type', 'actual')
      .eq('segment', 'all')
      .not('item', 'is', null)
      .order('value', { ascending: false });

    if (options?.intervention) {
      query = query.eq('intervention', options.intervention);
    }

    if (options?.year) {
      query = query.eq('year', options.year);
    } else {
      query = query.is('year', null);
    }

    const { data, error } = await query;

    if (error) throw error;

    const total = data?.reduce((sum, row) => sum + row.value, 0) || 0;

    return (
      data?.map((row) => ({
        category: row.item,
        value: row.value,
        percentage: total ? Math.round((row.value / total) * 100) : 0,
      })) || []
    );
  } catch (error) {
    console.error('Error fetching breakdown:', error);
    throw error;
  }
}

// ============================================================================
// MAP: One row per country with iso3 code and value
// ============================================================================
interface MapRow {
  country: string;
  iso3: string;
  value: number;
}

export async function getMap(
  dashboard: string,
  options?: { intervention?: string; year?: number }
): Promise<MapRow[]> {
  try {
    let query = supabase
      .from('v_metric_values')
      .select('country, value')
      .eq('dashboard', dashboard)
      .eq('section', 'Map')
      .eq('value_type', 'actual')
      .eq('segment', 'all')
      .order('value', { ascending: false });

    if (options?.intervention) {
      query = query.eq('intervention', options.intervention);
    }

    if (options?.year) {
      query = query.eq('year', options.year);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Fetch country iso codes
    const countryData = await supabase
      .from('countries')
      .select('name, iso2')
      .in(
        'name',
        data?.map((d) => d.country) || []
      );

    const isoMap = new Map(countryData.data?.map((c) => [c.name, c.iso2]) || []);

    return (
      data?.map((row) => ({
        country: row.country,
        iso3: (isoMap.get(row.country) || '').toUpperCase(),
        value: row.value,
      })) || []
    );
  } catch (error) {
    console.error('Error fetching map data:', error);
    throw error;
  }
}

// ============================================================================
// PROGRESS: Actual vs target
// ============================================================================
interface ProgressRow {
  metric: string;
  actual: number;
  target: number;
  progress: number; // percentage
}

export async function getProgress(
  dashboard: string,
  options?: { section?: string; year?: number }
): Promise<ProgressRow[]> {
  try {
    let query = supabase
      .from('v_metric_progress')
      .select('metric_id, actual, target, progress_pct')
      .is('item', null)
      .is('breakdown', null)
      .is('period', null);

    if (options?.section) {
      query = query.eq('section', options.section);
    }

    if (options?.year) {
      query = query.eq('year', options.year);
    } else {
      query = query.is('year', null);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Get metric names
    const metricIds = data?.map((d) => d.metric_id) || [];
    const metricData = await supabase
      .from('metrics')
      .select('id, name')
      .in('id', metricIds);

    const nameMap = new Map(metricData.data?.map((m) => [m.id, m.name]) || []);

    return (
      data?.map((row) => ({
        metric: nameMap.get(row.metric_id) || '',
        actual: row.actual,
        target: row.target,
        progress: row.progress_pct,
      })) || []
    );
  } catch (error) {
    console.error('Error fetching progress:', error);
    throw error;
  }
}

// ============================================================================
// ROLLUP CHECK: Whether Executive figures agree with pillar figures
// ============================================================================
export async function getRollupCheck() {
  try {
    const { data, error } = await supabase
      .from('v_rollup_check')
      .select('*')
      .order('status', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching rollup check:', error);
    throw error;
  }
}

// ============================================================================
// REPORTS: Impact reports list
// ============================================================================
export async function getReports(options?: { pillar?: string }) {
  try {
    let query = supabase
      .from('impact_reports')
      .select('id, report_name, status, publication_date, report_type, report_url')
      .order('publication_date', { ascending: false, nullsFirst: false });

    if (options?.pillar) {
      const pillarId = await supabase
        .from('pillars')
        .select('id')
        .eq('code', options.pillar)
        .single();

      if (pillarId.data) {
        query = query.eq('pillar_id', pillarId.data.id);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
}

// ============================================================================
// LAST SYNC: When each workbook was last synced
// ============================================================================
export async function getLastSync() {
  try {
    const { data, error } = await supabase
      .from('data_sources')
      .select('dashboard_id, loaded_at')
      .order('loaded_at', { ascending: false });

    if (error) throw error;

    // Get dashboard names
    const dashboardData = await supabase
      .from('dashboards')
      .select('id, code, name');

    const nameMap = new Map(
      dashboardData.data?.map((d) => [d.id, { code: d.code, name: d.name }]) || []
    );

    return (
      data?.map((row) => ({
        dashboard: nameMap.get(row.dashboard_id)?.code || '',
        name: nameMap.get(row.dashboard_id)?.name || '',
        syncedAt: new Date(row.loaded_at).toLocaleString(),
      })) || []
    );
  } catch (error) {
    console.error('Error fetching last sync:', error);
    throw error;
  }
}
