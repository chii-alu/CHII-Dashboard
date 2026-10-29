"use client";
import { useState } from "react";
import { Info, type LucideIcon } from "lucide-react";
import { progressInsight, type ProgressInsight, type ProgressRow, type ProgressStatus } from "@/lib/progressInsight";
import { progressFor } from "@/lib/progressLabels";

// Color palette - HEMP blue
const BRAND = "#14306B";
const BRAND_DK = "#0C447C";
const LIGHT_BORDER = "rgba(16, 44, 94, 0.12)";

export interface HeaderStatCard {
  label: string;
  num: number | null;
  sub?: string;
  icon: LucideIcon | React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>;
  displayFmt?: (n: number) => string;
  tip?: string;
  // Live progress against target (from /api/progress). When set, its bar and caption replace the sub-text.
  progress?: ProgressInsight;
}

export interface HeaderStatsPanelProps {
  title: string;
  description?: string;
  cards: HeaderStatCard[];
  nowrap?: boolean;
  // Fixed number of cards per row. When set, cards wrap into rows of this many.
  columns?: number;
  // Live progress rows keyed by card label (from useProgress). Cards with no row show "No target set".
  progressRows?: Record<string, ProgressRow>;
}

const PROGRESS_COLOR: Record<ProgressStatus, string> = {
  met: "#16A34A",
  close: BRAND_DK,
  behind: "#F59E0B",
  "no-data": "#9CA3AF",
  "no-target": "#9CA3AF",
};

/**
 * HeaderStatsPanel - Standardized header statistics cards for HEMP pages
 *
 * Features:
 * - White background cards with blue left border
 * - Optional info tooltips on hover
 * - Optional progress bars with pace indicators
 * - Customizable number formatting
 * - Responsive layout (flex with auto-wrap)
 *
 * Props:
 * - title: section title
 * - description: optional section description
 * - cards: array of HeaderStatCard objects with label, num, icon, optional tip/sub/displayFmt
 */
export function HeaderStatsPanel({
  title,
  description,
  cards,
  nowrap,
  columns,
  progressRows,
}: HeaderStatsPanelProps) {
  // Progress for a card: an explicit card.progress wins, otherwise the row for its label from progressRows.
  const insightOf = (card: HeaderStatCard): ProgressInsight | null =>
    card.progress ?? (progressRows ? progressInsight(progressFor(progressRows, card.label)) : null);

  const [hoveredIconIdx, setHoveredIconIdx] = useState<number | null>(null);

  return (
    <div>
      {/* Section Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ width: 3, height: 16, borderRadius: 999, backgroundColor: BRAND, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: BRAND_DK, lineHeight: 1.2, margin: 0 }}>
              {title}
            </p>
            {description && <p style={{ fontSize: 11, color: "#6B7280", marginTop: 3, margin: 0 }}>{description}</p>}
          </div>
        </div>
      </div>

      {/* Cards Grid - flex row with auto-wrap and gap */}
      <div style={columns
        ? { display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 12, marginBottom: 24 }
        : {
          display: "flex",
          gap: 12,
          flexWrap: nowrap ? "nowrap" : "wrap",
          marginBottom: 24,
          overflowX: nowrap ? "auto" : "visible",
        }}>
        {cards.map((card, idx) => (
          <div key={idx} style={{
            flex: idx === cards.length - 1 && cards.length % 2 === 1 ? "0 1 auto" : "1 1 auto",
            minWidth: 160,
            minHeight: 0,
          }}>
            <div
              style={{
                backgroundColor: "var(--bg-surface, white)",
                borderRadius: 10,
                padding: "14px 16px",
                textAlign: "center",
                border: `1px solid ${LIGHT_BORDER}`,
                borderLeft: `5px solid ${BRAND}`,
                position: "relative",
                overflow: "visible",
                transition: "all 0.2s ease",
              }}
            >
              {/* Label with optional tooltip */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 8 }}>
                <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: BRAND_DK, margin: 0 }}>
                  {card.label}
                </p>
                {card.tip && (
                  <span
                    style={{ position: "relative", display: "flex", cursor: "pointer" }}
                    onMouseEnter={() => setHoveredIconIdx(idx)}
                    onMouseLeave={() => setHoveredIconIdx(null)}
                  >
                    <Info size={12} color={BRAND_DK} opacity={0.5} />
                    {hoveredIconIdx === idx && (
                      <span style={{
                        position: "absolute",
                        top: "calc(100% + 6px)",
                        left: "50%",
                        transform: "translateX(-50%)",
                        backgroundColor: "white",
                        color: BRAND_DK,
                        fontSize: 9,
                        fontWeight: 400,
                        textTransform: "none",
                        letterSpacing: 0,
                        lineHeight: 1.4,
                        padding: "7px 10px",
                        borderRadius: 6,
                        width: 140,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                        border: `1px solid ${LIGHT_BORDER}`,
                        zIndex: 100,
                        textAlign: "center",
                        pointerEvents: "none",
                        whiteSpace: "normal",
                      }}>
                        {card.tip}
                      </span>
                    )}
                  </span>
                )}
              </div>

              {/* Icon + Number */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <card.icon size={18} style={{ color: BRAND_DK, opacity: 0.85, flexShrink: 0 }} />
                <p style={{ fontSize: card.num === null ? 13 : 24, fontWeight: 700, color: BRAND_DK, lineHeight: 1, margin: 0 }}>
                  {card.num === null ? "In coming data" : card.displayFmt ? card.displayFmt(card.num) : Math.round(card.num).toLocaleString()}
                </p>
              </div>

              {/* Progress bar against target; hidden when the card has no target */}
              {insightOf(card)?.barPct != null && (
                <div style={{ height: 4, borderRadius: 2, backgroundColor: LIGHT_BORDER, marginTop: 8, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    borderRadius: 2,
                    width: `${insightOf(card)!.barPct}%`,
                    backgroundColor: PROGRESS_COLOR[insightOf(card)!.status],
                    transition: "width 300ms ease",
                  }} />
                </div>
              )}

              {/* Caption: live progress text when available, otherwise the card's sub-text */}
              {(insightOf(card)?.caption ?? card.sub) && (
                <p style={{ fontSize: 9.5, color: `rgba(14, 68, 124, 0.55)`, marginTop: 4, margin: 0 }}>{insightOf(card)?.caption ?? card.sub}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
