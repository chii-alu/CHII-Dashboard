"use client";
import { useEffect, useState } from "react";
import type { ProgressRow } from "@/lib/progressInsight";
import { periodParam } from "@/lib/filter-years";

export function useProgress(dashboard: string, intervention?: string, section?: string, metricGroup?: string, year?: number | string) {
  const [byMetric, setByMetric] = useState<Record<string, ProgressRow>>({});
  useEffect(() => {
    const params = new URLSearchParams({ dashboard });
    if (intervention) params.set("intervention", intervention);
    if (section) params.set("section", section);
    if (metricGroup) params.set("metricGroup", metricGroup);
    // A period filter label or year; "Cumulative Total"/"all" sends none (cumulative targets).
    const period = periodParam(year);
    if (period) params.set("year", period);
    const load = () =>
      fetch(`/api/progress?${params}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((json) => {
          const map: Record<string, ProgressRow> = {};
          for (const row of json.progress ?? []) map[row.metric.trim()] = row;
          setByMetric(map);
        })
        .catch((err) => console.error("[progress]", err));
    load();
    const timer = setInterval(load, 60_000);
    return () => clearInterval(timer);
  }, [dashboard, intervention, section, metricGroup, year]);
  return byMetric;
}
