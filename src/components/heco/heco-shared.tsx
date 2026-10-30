"use client";
// Shared HECO pieces: the same header, footer, data hooks and card design as the HEMP dashboard.
import { useState } from "react";
import { Info, ChevronDown } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { progressName } from "@/lib/progressLabels";
import { FILTER_YEARS } from "@/lib/filter-years";

export const HECO_NAVY = "#042C53";
// Programme page headers use the HEMP programme header colour.
export const HECO_HERO = "#102C5E";
// Section tabs and subheadings use the HEMP brand colours.
export const HECO_BRAND = "#14306B";
export const HECO_BRAND_DK = "#0C447C";
export const HECO_LIGHT_BORDER = "rgba(16, 44, 94, 0.12)";

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

export type LegendItem = { label: string; color: string };

/** A chart panel in the HEMP design: accent bar, title with info tip, subtitle, filter pill, chart, legend. */
export function Panel({ title, subtitle, info, legend, children, filterOptions, filterValue, onFilterChange }: {
  title: string;
  subtitle: string;
  info?: string;
  legend?: LegendItem[];
  children: React.ReactNode;
  filterOptions?: string[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
}) {
  const [tip, setTip] = useState(false);
  const [open, setOpen] = useState(false);
  const [ownValue, setOwnValue] = useState("All Years");
  const options = filterOptions ?? ["All Years", ...FILTER_YEARS.map(String)];
  const value = filterValue ?? ownValue;
  const choose = onFilterChange ?? setOwnValue;
  const tipText = info ?? subtitle;

  return (
    <div style={{ backgroundColor: "white", borderRadius: 10, border: `1px solid ${HECO_LIGHT_BORDER}`, overflow: "hidden" }}>
      <div style={{ backgroundColor: HECO_BRAND, padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 2.5, minWidth: 0, flex: 1 }}>
          <div style={{ width: 3, height: 15, borderRadius: 999, backgroundColor: "#479BD6", flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "white", lineHeight: 1.2 }}>{title}</p>
              <span style={{ position: "relative", display: "flex", cursor: "pointer" }}
                onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}>
                <Info size={12} color="white" opacity={0.6} />
                {tip && (
                  <span style={{ position: "absolute", top: "calc(100% + 7px)", left: "50%", transform: "translateX(-50%)", backgroundColor: "white", color: HECO_BRAND_DK, fontSize: 10.5, fontWeight: 400, textTransform: "none", letterSpacing: 0, lineHeight: 1.5, padding: "8px 11px", borderRadius: 7, width: 210, boxShadow: "0 4px 12px rgba(0,0,0,0.12)", border: `1px solid ${HECO_LIGHT_BORDER}`, zIndex: 100, textAlign: "left", pointerEvents: "none" }}>
                    {tipText}
                  </span>
                )}
              </span>
            </div>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", marginTop: 1 }}>{subtitle}</p>
          </div>
        </div>
      </div>

      <div style={{ padding: "8px 18px", display: "flex", justifyContent: "flex-end" }}>
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setOpen(!open)}
            style={{ fontSize: 10, fontWeight: 600, padding: "5px 10px", borderRadius: 10, border: `1px solid ${HECO_LIGHT_BORDER}`, borderLeft: `5px solid ${HECO_BRAND}`, backgroundColor: "white", color: HECO_BRAND_DK, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}
          >
            {value} <ChevronDown size={12} />
          </button>
          {open && (
            <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 50, width: 200, maxHeight: 280, overflowY: "auto", backgroundColor: "white", borderRadius: 10, border: `1px solid ${HECO_LIGHT_BORDER}`, borderLeft: `5px solid ${HECO_BRAND}`, boxShadow: "0 10px 30px rgba(0,0,0,0.14)", overflow: "hidden" }}>
              {options.map(option => (
                <button
                  key={option}
                  onClick={() => { choose(option); setOpen(false); }}
                  style={{ display: "block", width: "100%", textAlign: "left", fontSize: 11, padding: "8px 12px", border: "none", background: option === value ? "rgba(20,48,107,0.08)" : "white", color: HECO_BRAND_DK, fontWeight: option === value ? 700 : 500, cursor: "pointer" }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "0 18px 18px" }}>
        {children}
        {legend && legend.length > 0 && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", paddingTop: 4 }}>
            {legend.map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, backgroundColor: item.color, borderRadius: 2 }} />
                <span style={{ fontSize: 10, color: "#6B7280" }}>{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** The programme page banner: title, subtitle, data source and last updated. */
export function ProgrammeBanner({ title, subtitle, dataSource, syncedAt, headerDesign }: { title: string; subtitle: string; dataSource: string; syncedAt: string; headerDesign: React.ReactNode }) {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-2">
      <header style={{ position: "relative", overflow: "hidden", backgroundColor: HECO_HERO, borderRadius: 12, minHeight: 120, display: "flex", alignItems: "center" }}>
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
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <span style={{ width: 3, height: 16, borderRadius: 999, backgroundColor: HECO_BRAND, flexShrink: 0 }} />
      <p style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: HECO_BRAND_DK, lineHeight: 1.2, margin: 0 }}>{children}</p>
    </div>
  );
}

export type SectionCategory = { name: string; blurb: string };

/** Section tabs with the subheading under them, in the HEMP section design. */
export function SectionTabs({ categories, active, onChange }: { categories: SectionCategory[]; active: string; onChange: (name: string) => void }) {
  const current = categories.find(c => c.name === active) ?? categories[0];
  return (
    <>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        {categories.map(category => {
          const on = current.name === category.name;
          return (
            <button
              key={category.name}
              onClick={() => onChange(category.name)}
              style={{
                fontSize: 11, fontWeight: on ? 700 : 600, padding: "8px 14px", borderRadius: 20, cursor: "pointer",
                border: `1px solid ${on ? HECO_BRAND : HECO_LIGHT_BORDER}`,
                backgroundColor: on ? HECO_BRAND : "white", color: on ? "white" : HECO_BRAND_DK,
                transition: "all 0.2s ease",
              }}
            >
              {category.name}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ width: 3, height: 16, borderRadius: 999, backgroundColor: HECO_BRAND, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: HECO_BRAND_DK, lineHeight: 1.2, margin: 0 }}>{current.name}</p>
            <p style={{ fontSize: 11, color: "#6B7280", marginTop: 3, margin: 0 }}>{current.blurb}</p>
          </div>
        </div>
      </div>
    </>
  );
}
