'use client'

// Example: headline figures from the Executive "At a Glance" sheet plus the
// HEMP cross-check. Unstyled on purpose - drop the data into your own design.
import { useDashboardData } from '../hooks/useDashboardData'
import { getHeadlines, getRollupCheck, getLastSync } from '../lib/dashboardData'
import { formatValue } from '../lib/shape'

export default function ExecutiveSnapshot() {
  const cards = useDashboardData(() => getHeadlines('EXEC', 'At a Glance'), [])
  const checks = useDashboardData(() => getRollupCheck(), [])
  const sync = useDashboardData(() => getLastSync(), [])

  if (cards.loading && !cards.data) return <p>Loading dashboard…</p>
  if (cards.error) return <p role="alert">Couldn't load the dashboard: {cards.error}</p>
  if (!cards.data?.length) {
    return <p>No figures yet. Check that you're signed in and that the Excel sync has run.</p>
  }

  const asOf = sync.data?.find(s => s.dashboard === 'EXEC')?.last_synced
  const mismatches = (checks.data ?? []).filter(c => c.status !== 'match' && c.status !== 'no pillar data yet')

  return (
    <section>
      <h2>Executive overview</h2>
      {asOf && <p>Data as of {new Date(asOf).toLocaleString()}</p>}

      <ul>
        {cards.data.map(c => (
          <li key={`${c.metric}-${c.intervention ?? ''}`}>
            <strong>{formatValue(c.value, c.unit)}</strong> {c.metric}
            {c.female != null && c.value ? ` (${Math.round((100 * c.female) / c.value)}% female)` : ''}
            {c.progress != null ? ` - ${c.progress}% of target` : ''}
          </li>
        ))}
      </ul>

      {mismatches.length > 0 && (
        <p role="status">
          {mismatches.length} executive figure(s) don't match the pillar workbooks. See the data check page.
        </p>
      )}
    </section>
  )
}
