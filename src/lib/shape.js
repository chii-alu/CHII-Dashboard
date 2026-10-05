// Pure helpers that turn database rows into shapes charts and cards expect.
// No Supabase here, so they're easy to test.

/** Rows -> one object per year, with a key per series.
 *  seriesBy: 'segment' (female/male/all), 'label' (Full-time, BSE, ...) or 'breakdown'.
 *  [{ year: 2025, all: 837, female: 455 }, ...] plus the list of series keys. */
export function pivotByYear(rows, seriesBy = 'segment') {
  const byYear = new Map()
  const series = new Set()
  for (const r of rows) {
    if (r.year == null) continue
    const key = r[seriesBy] ?? 'all'
    series.add(key)
    if (!byYear.has(r.year)) byYear.set(r.year, { year: r.year })
    byYear.get(r.year)[key] = Number(r.value)
  }
  return {
    data: [...byYear.values()].sort((a, b) => a.year - b.year),
    series: [...series],
  }
}

/** Headline rows -> one card per metric (and per intervention, if any):
 *  { metric, unit, intervention, value, target, progress, female, male, ... } */
export function toCards(rows) {
  const cards = new Map()
  for (const r of rows) {
    const id = `${r.metric_id}|${r.intervention ?? ''}`
    if (!cards.has(id)) {
      cards.set(id, { metric: r.metric, unit: r.unit, intervention: r.intervention ?? null,
                      metric_id: r.metric_id, value: null, target: null })
    }
    const card = cards.get(id)
    const v = Number(r.value)
    if (r.value_type === 'target') {
      if (r.segment === 'all') card.target = v
    } else if (r.segment === 'all') {
      card.value = v
    } else {
      card[r.segment] = v
    }
  }
  return [...cards.values()]
    .map(c => ({ ...c, progress: c.value != null && c.target ? Math.round((1000 * c.value) / c.target) / 10 : null }))
    .sort((a, b) => a.metric_id - b.metric_id)
}

/** Map rows -> one entry per country: { iso3, iso2, country, value, female } */
export function toCountries(rows) {
  const out = new Map()
  for (const r of rows) {
    if (!out.has(r.iso3)) out.set(r.iso3, { iso3: r.iso3, iso2: r.iso2, country: r.country, value: 0 })
    const c = out.get(r.iso3)
    if (r.segment === 'all') c.value += Number(r.value)
    else c[r.segment] = (c[r.segment] ?? 0) + Number(r.value)
  }
  return [...out.values()].sort((a, b) => b.value - a.value)
}

/** Format a value for display using the metric's unit. */
export function formatValue(value, unit) {
  if (value == null) return '–'
  if (unit === 'percent') return `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`
  if (unit === 'currency_usd') return `$${Number(value).toLocaleString()}`
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })
}
