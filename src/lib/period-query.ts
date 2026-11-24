// Server side: turns the `year` query parameter ("2026", "2026-H1", or none) into Supabase filters.
// Cumulative totals have no year; a whole year has the year and no period; a half has the year and period "H1"/"H2".
import { parsePeriod, type Period } from "@/lib/filter-years";

export function periodFromRequest(request: Request): Period {
  return parsePeriod(new URL(request.url).searchParams.get("year"));
}

export function withPeriod<Q>(query: Q, period: Period): Q {
  const q = query as any;
  if (period.year === null) return q.is("year", null);
  const byYear = q.eq("year", period.year);
  return period.half ? byYear.eq("period", period.half) : byYear.is("period", null);
}
