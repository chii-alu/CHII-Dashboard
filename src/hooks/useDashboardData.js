'use client'

// Load data in a component:
//   const { data, loading, error } = useDashboardData(() => getHeadlines('EXEC', 'At a Glance'), [])
// With live: true, the component refreshes by itself a couple of seconds
// after the Excel sync writes new numbers to Supabase.
import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useDashboardData(fetcher, deps = [], { live = true } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const latest = useRef(0)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(async () => {
    const call = ++latest.current
    setLoading(true)
    try {
      const result = await fetcher()
      if (call === latest.current) { setData(result); setError(null) }
    } catch (e) {
      if (call === latest.current) setError(e.message)
    } finally {
      if (call === latest.current) setLoading(false)
    }
  }, deps)

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!live) return
    // A sync writes many rows at once; wait until it's quiet, then refresh once.
    let timer
    const channel = supabase
      .channel(`metric-values-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'metric_values' }, () => {
        clearTimeout(timer)
        timer = setTimeout(load, 2000)
      })
      .subscribe()
    return () => { clearTimeout(timer); supabase.removeChannel(channel) }
  }, [live, load])

  return { data, loading, error, refresh: load }
}
