"use client";
// Shared HECO pieces: the same header, footer, data hooks and card design as the HEMP dashboard.
import { useDashboardData } from "@/hooks/useDashboardData";
import { progressName } from "@/lib/progressLabels";

export const HECO_NAVY = "#042C53";

/** Current-total actual headlines for a HECO section (or one intervention). Returns a lookup by card label. */
export function useHecoHeadlines(intervention?: string) {
  const { data } = useDashboardData<{ headlines: { metric: string; value: number }[] }>(
    () => {
      const section = intervention ? "Intervention" : "At a Glance";
      const query = `dashboard=HECO&section=${encodeURIComponent(section)}${intervention ? `&intervention=${encodeURIComponent(intervention)}` : ""}`;
      return fetch(`/api/dashboard-section?${query}`).then(r => r.json());
    },
    [intervention]
  );
  return (cardLabel: string): number | null => {
    const name = progressName(cardLabel);
    return data?.headlines?.find(h => h.metric === name)?.value ?? null;
  };
}

/** The workbook's insight cards for HECO At a Glance, in sheet order. */
export function useHecoInsights() {
  const { data } = useDashboardData<{ insights: any[] }>(
    () => fetch("/api/insights?dashboard=HECO").then(r => r.json()),
    []
  );
  return data?.insights ?? [];
}

export const formatPercent = (n: number) => `${Math.round(n * 10) / 10}%`;
