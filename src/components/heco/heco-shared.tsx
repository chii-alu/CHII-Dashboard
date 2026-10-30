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

export const HECO_BAR = "#479BD6";
export const HECO_GRID = "rgba(20, 48, 107, 0.12)";

/** A titled white panel with the HECO navy header strip. */
export function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "white", borderRadius: 10, border: `1px solid ${HECO_GRID}`, overflow: "hidden" }}>
      <div style={{ backgroundColor: HECO_NAVY, padding: "12px 20px" }}>
        <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "white" }}>{title}</p>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{subtitle}</p>
      </div>
      <div style={{ padding: "16px 18px" }}>{children}</div>
    </div>
  );
}

/** The programme page banner: title, subtitle, data source and last updated. */
export function ProgrammeBanner({ title, subtitle, dataSource, syncedAt, headerDesign }: { title: string; subtitle: string; dataSource: string; syncedAt: string; headerDesign: React.ReactNode }) {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-2">
      <header style={{ position: "relative", overflow: "hidden", backgroundColor: HECO_NAVY, borderRadius: 12, minHeight: 120, display: "flex", alignItems: "center" }}>
        {headerDesign}
        <div className="px-4 sm:px-6 py-6" style={{ position: "relative", zIndex: 10, width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <h1 className="text-lg font-black leading-tight" style={{ color: "white", letterSpacing: "0.01em" }}>{title}</h1>
            <p className="text-[13px] mt-2 font-medium" style={{ color: "rgba(215,225,245,0.8)" }}>{subtitle}</p>
            <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[12px]" style={{ color: "rgba(215,225,245,0.5)" }}>
              <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Data source:</span> {dataSource}</span>
              <span aria-hidden="true">·</span>
              <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Last updated:</span> {syncedAt}</span>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

/** A section label above a group of panels. */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: HECO_NAVY }}>{children}</p>;
}
