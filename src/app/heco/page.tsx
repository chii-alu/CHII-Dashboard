"use client";
// HECO At a Glance: the HEMP At a Glance layout, with HEMP's card list for now.
import { useState } from "react";
import { Users, Briefcase, GraduationCap, FileText, Info } from "lucide-react";
import { useDataSource, useSyncedAt } from "@/hooks/useDataSource";
import { useProgress } from "@/hooks/useProgress";
import { progressFor } from "@/lib/progressLabels";
import { progressInsight, type ProgressInsight, type ProgressStatus } from "@/lib/progressInsight";
import HeaderDesign from "@/components/layout/header-design";
import FeaturedImpactStory from "@/components/layout/featured-impact-story";
import { HECO_NAVY, formatPercent, useHecoHeadlines, useHecoInsights } from "@/components/heco/heco-shared";
import HecoMap from "@/components/heco/heco-map";

const PROGRESS_COLOR: Record<ProgressStatus, string> = {
  met: "#16A34A", close: HECO_NAVY, behind: "#F59E0B", "no-data": "#9CA3AF", "no-target": "#9CA3AF",
};
const INSIGHT_ACCENTS = ["#042C53", "#16A34A", "#3B82F6", "#9333EA"];

type CardSpec = { label: string; icon: any; format: "count" | "percent"; info: string; href?: string };

const CARDS: CardSpec[] = [
  { label: "Total Beneficiaries Reached", icon: Users, format: "count", info: "Everyone reached across all five interventions, each person counted once." },
  { label: "Countries Reached", icon: Users, format: "count", info: "African countries with at least one beneficiary." },
  { label: "PSF Fellows Graduated", icon: GraduationCap, format: "count", info: "Public Sector Fellowship fellows who graduated, against the target of 72." },
  { label: "Female Participation (%)", icon: Users, format: "percent", info: "Share of women across all interventions." },
  { label: "Partner Organisations Engaged", icon: Briefcase, format: "count", info: "Governments, hospitals, institutions and funders engaged across every programme." },
  { label: "Research Outputs", icon: FileText, format: "count", info: "Research papers produced." },
];

function KpiCard({ spec, value, insight }: { spec: CardSpec; value: number | null; insight: ProgressInsight }) {
  const [tip, setTip] = useState(false);
  const shown = value === null ? "In coming data" : spec.format === "percent" ? formatPercent(value) : Math.round(value).toLocaleString();
  return (
    <div style={{ backgroundColor: "#fff", borderRadius: 10, border: "1px solid #E5E7EB", borderLeft: `5px solid ${HECO_NAVY}`, padding: "12px 14px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em", color: HECO_NAVY, margin: 0 }}>{spec.label}</p>
        <span style={{ position: "relative", display: "flex", cursor: "pointer" }} onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}>
          <Info size={11} color={HECO_NAVY} opacity={0.5} />
          {tip && <span style={{ position: "absolute", top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", backgroundColor: "white", color: HECO_NAVY, fontSize: 10, padding: "6px 9px", borderRadius: 6, width: 180, boxShadow: "0 4px 12px rgba(0,0,0,0.12)", zIndex: 50 }}>{spec.info}</span>}
        </span>
      </div>
      <p style={{ fontSize: value === null ? 14 : 28, fontWeight: 800, color: HECO_NAVY, lineHeight: 1, margin: 0 }}>{shown}</p>
      <div style={{ marginTop: 8 }}>
        {insight.barPct != null && (
          <div style={{ height: 6, borderRadius: 2, backgroundColor: "#E5E7EB", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${insight.barPct}%`, backgroundColor: PROGRESS_COLOR[insight.status], transition: "width 300ms ease" }} />
          </div>
        )}
        <p style={{ fontSize: 9.5, color: "#6B7280", marginTop: 4, marginBottom: 0 }}>{insight.caption}</p>
      </div>
    </div>
  );
}

export default function HecoAtAGlance() {
  const dataSource = useDataSource("HECO");
  const syncedAt = useSyncedAt("HECO");
  const progressRows = useProgress("HECO");
  const headline = useHecoHeadlines();
  const insights = useHecoInsights();

  const column = (cards: CardSpec[]) => cards.map(spec => (
    <KpiCard
      key={spec.label}
      spec={spec}
      value={headline(spec.label)}
      insight={progressInsight(progressFor(progressRows, spec.label))}
    />
  ));

  return (
    <div style={{ backgroundColor: "#f8fafc" }}>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-2">
        <header style={{ position: "relative", overflow: "hidden", backgroundColor: HECO_NAVY, borderRadius: 12, minHeight: 120, display: "flex", alignItems: "center" }}>
          <HeaderDesign />
          <div className="px-4 sm:px-6 py-6" style={{ position: "relative", zIndex: 10, width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <h1 className="text-lg font-black leading-tight" style={{ color: "white", letterSpacing: "0.01em" }}>CHII Health Ecosystems (HECO) Dashboard</h1>
              <p className="text-[13px] mt-2 font-medium" style={{ color: "rgba(215,225,245,0.8)" }}>Health ecosystem programmes across Africa</p>
              <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[12px]" style={{ color: "rgba(215,225,245,0.5)" }}>
                <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Data source:</span> {dataSource}</span>
                <span aria-hidden="true">·</span>
                <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Last updated:</span> {syncedAt}</span>
              </div>
            </div>
          </div>
        </header>
      </div>

      <div className="max-w-[1600px] mx-auto px-10 py-7">
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 220px", gap: 24, alignItems: "stretch" }}>
          <div style={{ display: "flex", minHeight: 420 }}>
            <HecoMap />
          </div>
          <div>
            <h2 style={{ fontSize: 11, fontWeight: 800, color: HECO_NAVY, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 14, textAlign: "center" }}>Programme Overview</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>{column(CARDS)}</div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-10" style={{ marginTop: 8 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", backgroundColor: "#fff", borderRadius: 10, border: "1px solid #E5E7EB", padding: "20px 0", overflow: "hidden" }}>
          {(insights.length > 0 ? insights : [null, null, null, null]).map((row: any, i: number) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "0 16px", textAlign: "center", borderRight: i < 3 ? "1px solid #E5E7EB" : "none" }}>
              <div style={{ width: 60, height: 4, backgroundColor: INSIGHT_ACCENTS[i % INSIGHT_ACCENTS.length], borderRadius: 2 }} />
              <p style={{ fontSize: row?.value_display ? 28 : 14, fontWeight: 800, color: HECO_NAVY, margin: 0 }}>{row?.value_display ?? "In coming data"}</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: HECO_NAVY, margin: 0 }}>{row?.title ?? "In coming data"}</p>
              {row?.description && <p style={{ fontSize: 11, color: "#6B7280", margin: 0 }}>{row.description}</p>}
              {row?.detail && <p style={{ fontSize: 11, color: "#6B7280", margin: 0 }}>{row.detail}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-4 pb-10">
        <FeaturedImpactStory footer dataSynced={syncedAt} dataSource={dataSource} />
      </div>
    </div>
  );
}
