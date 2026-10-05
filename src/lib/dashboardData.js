// Everything the app reads from Supabase, in one place.
// dashboard is 'EXEC' or 'HEMP' (later 'HENT', 'HECO').
// year: a number (2025) or null for the "Current Total" column.
import { supabase } from './supabase'
import { pivotByYear, toCards, toCountries } from './shape'

async function run(query) {
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

function byYear(query, year) {
  return year == null ? query.is('year', null) : query.eq('year', year)
}

/** Headline KPI cards for a sheet, e.g. getHeadlines('EXEC', 'At a Glance').
 *  For HEMP programme pages: getHeadlines('HEMP', 'Intervention', { intervention: 'SIE' }). */
export async function getHeadlines(dashboard, section, { year = null, intervention } = {}) {
  let q = supabase.from('v_metric_values').select('*')
    .eq('dashboard', dashboard).eq('section', section).eq('is_headline', true)
  q = byYear(q, year)
  if (intervention) q = q.eq('intervention', intervention)
  return toCards(await run(q))
}

/** Year-by-year trend for line/bar charts.
 *  getTrend('EXEC', 'At a Glance', 'Total Beneficiaries')            -> series female/male/all
 *  getTrend('EXEC', 'Wage Employment', 'Contract Type', { seriesBy: 'label' }) */
export async function getTrend(dashboard, section, metric, { seriesBy = 'segment', intervention, segment } = {}) {
  let q = supabase.from('v_metric_values').select('*')
    .eq('dashboard', dashboard).eq('section', section).eq('metric', metric)
    .eq('value_type', 'actual').not('year', 'is', null)
  if (intervention) q = q.eq('intervention', intervention)
  if (segment) q = q.eq('segment', segment)
  return pivotByYear(await run(q), seriesBy)
}

/** One breakdown table for a single year (or current total), e.g. health areas.
 *  Returns [{ label, breakdown, segment, value }] for bar/pie charts. */
export async function getBreakdown(dashboard, section, metric, { year = null, intervention } = {}) {
  let q = supabase.from('v_metric_values')
    .select('label, breakdown, segment, period, value, unit')
    .eq('dashboard', dashboard).eq('section', section).eq('metric', metric)
    .eq('value_type', 'actual')
  q = byYear(q, year)
  if (intervention) q = q.eq('intervention', intervention)
  const rows = await run(q)
  return rows.map(r => ({ ...r, value: Number(r.value) })).sort((a, b) => b.value - a.value)
}

/** Country data for Mapbox. Match on iso3 (Mapbox: iso_3166_1_alpha_3).
 *  EXEC: getMap('EXEC', { breakdown: 'Outreach' })
 *  HEMP: getMap('HEMP', { intervention: 'Career Workshops' })  (omit for all programmes) */
export async function getMap(dashboard, { breakdown, intervention, year = null } = {}) {
  let q = supabase.from('v_map_values').select('*').eq('dashboard', dashboard).eq('value_type', 'actual')
  q = byYear(q, year)
  if (breakdown) q = q.eq('breakdown', breakdown)
  if (intervention) q = q.eq('intervention', intervention)
  return toCountries(await run(q))
}

/** Actual vs target (only where a Target is filled in). */
export async function getProgress(dashboard, { intervention } = {}) {
  let q = supabase.from('v_progress').select('*').eq('dashboard', dashboard)
  if (intervention) q = q.eq('intervention', intervention)
  return run(q)
}

/** Do executive figures agree with the pillar workbooks? */
export async function getRollupCheck() {
  return run(supabase.from('v_rollup_check').select('*'))
}

/** Impact reports, optionally for one pillar ('HEMP', 'HENT', 'HECO', 'MELA'). */
export async function getReports({ pillar } = {}) {
  const rows = await run(supabase.from('impact_reports')
    .select('report_name, status, publication_date, due_date, report_type, key_focus_area, notes, report_url, pillars(code)')
    .order('report_name'))
  const out = rows.map(({ pillars, ...r }) => ({ ...r, pillar: pillars?.code ?? null }))
  return pillar ? out.filter(r => r.pillar === pillar) : out
}

/** When each workbook last synced, for a "Data as of ..." line. */
export async function getLastSync() {
  return run(supabase.from('v_last_sync').select('*'))
}
