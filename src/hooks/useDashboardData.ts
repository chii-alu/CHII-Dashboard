'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseDashboardDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useDashboardData<T>(
  fetchFn: () => Promise<T>,
  dependencies: unknown[] = []
): UseDashboardDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the fetch function to prevent unnecessary re-renders
  const memoizedFetchFn = useCallback(fetchFn, dependencies);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await memoizedFetchFn();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [memoizedFetchFn]);

  return { data, loading, error };
}
