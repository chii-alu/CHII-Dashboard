"use client";
// Horizontal bar chart in the "Participants by Health Interest Area" design:
// a fixed label column on the left, one row per item, and the value at the end of each bar.
// With one series the three largest bars are dark and the rest light. With several series
// the bars are stacked, and a small legend sits below.
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { ChartWithPlaceholder } from "@/components/ChartWithPlaceholder";

export type RankedSeries = { key: string; label: string; color: string };

const TOP_COLOR = "#122B5E";
const OTHER_COLOR = "#9FB4E0";
const BRAND_DK = "#0C447C";
const LIGHT_BORDER = "rgba(16, 44, 94, 0.12)";

export default function RankedBars({
  data,
  nameKey = "name",
  series,
  rowHeight = 32,
}: {
  data: Record<string, any>[] | null;
  nameKey?: string;
  series: RankedSeries[];
  rowHeight?: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const rows = data ?? [];
  const single = series.length === 1;

  const totals = rows.map(r => series.reduce((sum, s) => sum + (Number(r[s.key]) || 0), 0));
  const grand = totals.reduce((a, b) => a + b, 0);
  const axisMax = Math.ceil(Math.max(...totals, 0) * 1.2) || 1;

  // Three largest single-series bars get the dark colour
  const topIndexes = new Set(
    totals.map((t, i) => ({ t, i })).sort((a, b) => b.t - a.t).slice(0, 3).map(x => x.i)
  );

  const CustomLabel = (props: any) => {
    const { x, y, width, height, index } = props;
    const total = totals[index];
    if (total === undefined) return null;
    const text = single ? `${total} · ${grand > 0 ? Math.round((total / grand) * 100) : 0}%` : `${total}`;
    return (
      <text x={x + width + 8} y={y + height / 2} fill={BRAND_DK} fontSize={10} fontWeight={700} textAnchor="start" dominantBaseline="middle">
        {text}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;
    const row = payload[0].payload;
    return (
      <div style={{ backgroundColor: "white", border: `1px solid ${LIGHT_BORDER}`, borderRadius: 6, padding: "8px 12px", fontSize: 11, color: BRAND_DK, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <p style={{ margin: 0, fontWeight: 600 }}>{row[nameKey]}</p>
        {series.map(s => (
          <p key={s.key} style={{ margin: "4px 0 0 0" }}>{s.label}: {row[s.key] ?? 0}</p>
        ))}
      </div>
    );
  };

  const chartHeight = Math.max(200, rows.length * (rowHeight + 12));
  const lastKey = series[series.length - 1]?.key;

  return (
    <ChartWithPlaceholder data={data && data.length ? data : null} height={chartHeight}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 220, flexShrink: 0 }}>
          {rows.map((row, idx) => (
            <div
              key={idx}
              style={{
                height: rowHeight, display: "flex", alignItems: "center", paddingRight: 12,
                fontSize: 11, fontWeight: 500, color: "#374151", lineHeight: 1.3,
                overflow: "hidden", textOverflow: "ellipsis",
                marginBottom: idx < rows.length - 1 ? 12 : 0,
              }}
            >
              {String(row[nameKey] ?? "")}
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }}>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 120, bottom: 0, left: 0 }} barCategoryGap={12}>
              <XAxis type="number" hide domain={[0, axisMax]} />
              <YAxis dataKey={nameKey} type="category" hide width={0} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(18, 43, 94, 0.05)" }} />
              {series.map(s => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.label}
                  stackId={single ? undefined : "stack"}
                  fill={s.color}
                  radius={s.key === lastKey ? [0, 4, 4, 0] : undefined}
                  onMouseEnter={(_: any, index: number) => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {single && rows.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={topIndexes.has(index) ? TOP_COLOR : OTHER_COLOR}
                      opacity={hovered !== null && index !== hovered ? 0.4 : 1}
                    />
                  ))}
                  {s.key === lastKey && <LabelList content={CustomLabel} />}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {!single && (
        <div style={{ display: "flex", gap: 14, marginTop: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {series.map(s => (
            <span key={s.key} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#6B7280" }}>
              <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, backgroundColor: s.color, flexShrink: 0 }} />
              {s.label}
            </span>
          ))}
        </div>
      )}
    </ChartWithPlaceholder>
  );
}
