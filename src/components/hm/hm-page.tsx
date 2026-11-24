"use client";
// Health Missions page, laid out like the HEMP pages: header, Programme Overview cards, section pills with the
// Filters button, then that section's charts in pairs, and the footer. Content comes from src/config/hm.ts.
import { useState } from "react";
import {
  Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Info } from "lucide-react";
import PortalNav from "@/components/layout/portal-nav";
import FeaturedImpactStory from "@/components/layout/featured-impact-story";
import { MetadataHeader } from "@/components/MetadataHeader";
import { ChartTip, HeaderStatsPanel, FilterButton, FilterDropdown, type HeaderStatCard } from "@/components/ui/hemp";
import { DATA_SOURCE } from "@/config/data-sources";
import { FILTER_YEARS, ALL_PERIODS, PERIOD_FILTER_OPTIONS, inPeriod, rowInPeriod, parsePeriod, periodText, halfOfMonth } from "@/lib/filter-years";
import { downloadChart } from "@/lib/download-chart";
import { progressInsight } from "@/lib/progressInsight";
import { HM_PAGES, sampleTarget, sampleValue, type HMChart, type HMUnit } from "@/config/hm";
import { PeriodPicker, isPeriodOptions } from "@/components/filters/period-picker";

/* ── HEMP palette ────────────────────────────────────── */
const BRAND = "#14306B";
const BRAND_DK = "#0C447C";
const LIGHT_BORDER = "rgba(16, 44, 94, 0.12)";
const LIGHT_BG = "#F8F9FA";
const SINGLE = "#479BD6";
const SERIES_COLOURS = ["#102C5E", "#479BD6", "#D17A86"];

const fmt = (unit: HMUnit | undefined) => (n: number) => unit === "percent" ? `${Math.round(n)}%` : Math.round(n).toLocaleString();

/** Chart panel, as on the HEMP pages: navy band, blue tick, info tooltip, click to download. */
function Panel({ title, subtitle, info, children }: { title: string; subtitle: string; info?: string; children: React.ReactNode }) {
  const [tip, setTip] = useState(false);
  return (
    <div style={{ backgroundColor: "white", borderRadius: 10, border: `1px solid ${LIGHT_BORDER}`, overflow: "hidden", height: "100%" }}>
      <div style={{ backgroundColor: BRAND, padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 3, height: 15, borderRadius: 999, backgroundColor: SINGLE, flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "white", lineHeight: 1.2 }}>{title}</p>
            {info && (
              <span style={{ position: "relative", display: "flex", cursor: "pointer" }}
                onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}>
                <Info size={12} color="white" opacity={0.6} />
                {tip && (
                  <span style={{ position: "absolute", top: "calc(100% + 7px)", left: "50%", transform: "translateX(-50%)", backgroundColor: "white", color: BRAND_DK, fontSize: 10.5, fontWeight: 400, textTransform: "none", letterSpacing: 0, lineHeight: 1.5, padding: "8px 11px", borderRadius: 7, width: 210, boxShadow: "0 4px 12px rgba(0,0,0,0.12)", border: `1px solid ${LIGHT_BORDER}`, zIndex: 100, textAlign: "left", pointerEvents: "none" }}>
                    {info}
                  </span>
                )}
              </span>
            )}
          </div>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", marginTop: 1 }}>{subtitle}</p>
        </div>
      </div>
      <div style={{ padding: "16px 18px 18px", cursor: "pointer" }} onClick={e => downloadChart(e.currentTarget, title)} title="Click to download as PNG">
        {children}
      </div>
    </div>
  );
}

/** Section header, as on the HEMP pages. */
function SectionHeader({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16 }}>
      <span style={{ width: 3, height: 16, borderRadius: 999, backgroundColor: BRAND, flexShrink: 0, alignSelf: "center" }} />
      <div>
        <p style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: BRAND_DK, lineHeight: 1.2, margin: 0 }}>{title}</p>
        <p style={{ fontSize: 11, color: "#6B7280", margin: "3px 0 0" }}>{blurb}</p>
      </div>
    </div>
  );
}

/** Colour legend under a chart with more than one series, as on the HEMP pages. */
function Legend({ series }: { series: string[] }) {
  if (series.length < 2) return null;
  return (
    <div className="flex flex-wrap justify-center gap-4 text-[10px] text-gray-400 mt-3 pt-2">
      {series.map((s, i) => (
        <span key={s} className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-sm inline-block" style={{ backgroundColor: SERIES_COLOURS[i % SERIES_COLOURS.length] }} /> {s}
        </span>
      ))}
    </div>
  );
}

/** One chart, drawn in the HEMP chart style. Values are sample data that change with the year. */
function HMChartView({ slug, chart, year }: { slug: string; chart: HMChart; year: string }) {
  const { title, kind, categories, series, unit, range } = chart;
  const rows = categories.map(cat => {
    const row: Record<string, string | number> = { name: cat };
    let total = 0;
    series.forEach(s => {
      const v = sampleValue(`${slug}|${title}|${s}|${cat}|${year}`, range);
      row[s] = v;
      total += v;
    });
    row.Total = total;
    return row;
  });
  const f = fmt(unit);
  const pctAxis = unit === "percent" ? { domain: [0, 100] as [number, number], tickFormatter: (v: number) => `${v}%` } : {};
  const grid = <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,33,71,0.06)" vertical={kind === "hbar"} horizontal={kind !== "hbar"} />;
  const tooltip = <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,33,71,0.04)" }} />;
  const xCat = <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} interval={0} />;
  const yNum = <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} allowDecimals={false} axisLine={false} tickLine={false} {...pctAxis} />;

  if (kind === "hbar") {
    const s = series[0];
    const height = Math.max(240, categories.length * 46);
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 44, bottom: 0, left: 0 }}>
          {grid}
          <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} allowDecimals={false} axisLine={false} tickLine={false} {...pctAxis} />
          <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 10.5, fill: "#374151", fontWeight: 500 }} axisLine={false} tickLine={false} />
          {tooltip}
          <Bar dataKey={s} name={s} fill={SINGLE} radius={[0, 4, 4, 0]} barSize={22}>
            <LabelList dataKey={s} position="right" fontSize={10} fill={BRAND_DK} fontWeight={700} formatter={f} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (kind === "line") {
    return (
      <>
        <ResponsiveContainer width="100%" height={270}>
          <LineChart data={rows} margin={{ top: 20, right: 16, bottom: 0, left: -12 }}>
            {grid}
            {xCat}
            {yNum}
            {tooltip}
            {series.map((s, i) => (
              <Line key={s} type="monotone" dataKey={s} name={s} stroke={series.length > 1 ? SERIES_COLOURS[i % SERIES_COLOURS.length] : SINGLE}
                strokeWidth={2.5} dot={{ r: 3.5, strokeWidth: 0, fill: series.length > 1 ? SERIES_COLOURS[i % SERIES_COLOURS.length] : SINGLE }} activeDot={{ r: 5 }}>
                {series.length === 1 && <LabelList dataKey={s} position="top" fontSize={10} fill={BRAND_DK} fontWeight={700} formatter={f} />}
              </Line>
            ))}
          </LineChart>
        </ResponsiveContainer>
        <Legend series={series} />
      </>
    );
  }

  const stacked = kind === "stack";
  const grouped = kind === "group";
  return (
    <>
      <ResponsiveContainer width="100%" height={270}>
        <BarChart data={rows} margin={{ top: 26, right: 12, bottom: 0, left: -12 }} barCategoryGap={grouped ? "24%" : "36%"}>
          {grid}
          {xCat}
          {yNum}
          {tooltip}
          {series.map((s, i) => {
            const last = i === series.length - 1;
            const colour = series.length > 1 ? SERIES_COLOURS[i % SERIES_COLOURS.length] : SINGLE;
            return (
              <Bar key={s} dataKey={s} name={s} fill={colour} stackId={stacked ? "s" : undefined}
                barSize={grouped ? 18 : 44} radius={!stacked || last ? [4, 4, 0, 0] : undefined}>
                {stacked && last && <LabelList dataKey="Total" position="top" fontSize={10} fill={BRAND_DK} fontWeight={700} formatter={f} />}
                {!stacked && <LabelList dataKey={s} position="top" fontSize={grouped ? 9 : 10} fill={BRAND_DK} fontWeight={700} formatter={f} />}
              </Bar>
            );
          })}
        </BarChart>
      </ResponsiveContainer>
      <Legend series={series} />
    </>
  );
}

/** A Health Missions page: At a Glance or one intervention. */
export default function HMPage({ page }: { page: keyof typeof HM_PAGES }) {
  const config = HM_PAGES[page];
  const [section, setSection] = useState(config.sections[0].name);
  const [year, setYear] = useState(ALL_PERIODS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const yearKey = year === ALL_PERIODS ? "all" : year;
  const period = periodText(year);

  const cards: HeaderStatCard[] = config.kpis.map(k => {
    const key = `${config.slug}|${k.label}|${yearKey}`;
    const num = sampleValue(key, k.range);
    const target = sampleTarget(key, num, k.unit);
    return {
      label: k.label,
      num,
      icon: k.icon,
      displayFmt: fmt(k.unit),
      tip: k.tip,
      progress: progressInsight({ metric: k.label, unit: k.unit === "percent" ? "percent" : "count", actual: num, target, progress_pct: null }),
    };
  });
  const active = config.sections.find(s => s.name === section) ?? config.sections[0];

  return (
    <div style={{ backgroundColor: LIGHT_BG, minHeight: "100vh" }}>
      <PortalNav portal="hm" />
      <MetadataHeader
        title={config.title}
        subtitle={config.subtitle}
        dataSource={DATA_SOURCE.hm}
        lastUpdated="Not yet updated"
        period={period}
        customContent={<><span aria-hidden="true">·</span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Sample data</span></>}
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-7">
        <HeaderStatsPanel title="Programme Overview" nowrap={false} cards={cards} />

        {/* Section pills (left) and the Filters button (right), as on the HEMP pages */}
        <div style={{ marginBottom: 32, display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", flex: 1 }}>
            {config.sections.map(s => {
              const on = s.name === active.name;
              return (
                <button key={s.name} type="button" onClick={() => setSection(s.name)}
                  style={{ fontSize: 11, fontWeight: on ? 700 : 600, padding: "8px 14px", borderRadius: 20, border: `1px solid ${on ? BRAND : LIGHT_BORDER}`, backgroundColor: on ? BRAND : "white", color: on ? "white" : BRAND_DK, cursor: "pointer", transition: "all 0.2s ease" }}>
                  {s.name}
                </button>
              );
            })}
          </div>
          <div style={{ position: "relative" }}>
            <FilterButton activeFilterCount={year === ALL_PERIODS ? 0 : 1} isOpen={filtersOpen} onClick={() => setFiltersOpen(o => !o)} />
            <FilterDropdown isOpen={filtersOpen} onResetFilters={() => setYear(ALL_PERIODS)}>
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: BRAND_DK, margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.02em" }}>Year</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  <PeriodPicker value={year} onChange={setYear} accent={BRAND} dark={BRAND_DK} border={LIGHT_BORDER} hideYearHeading />{false && PERIOD_FILTER_OPTIONS.map(opt => (
                    <button key={opt} type="button" onClick={() => setYear(opt)}
                      style={{ fontSize: 10, fontWeight: year === opt ? 700 : 500, padding: "5px 10px", borderRadius: 6, border: `1px solid ${year === opt ? BRAND : LIGHT_BORDER}`, backgroundColor: year === opt ? BRAND : "white", color: year === opt ? "white" : BRAND_DK, cursor: "pointer" }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </FilterDropdown>
          </div>
        </div>

        <section style={{ marginBottom: 48 }}>
          <SectionHeader title={active.name} blurb={active.blurb} />
          <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16 }}>
            {active.charts.map(c => (
              <Panel key={c.title} title={c.title} subtitle={c.sub} info={c.info}>
                <HMChartView slug={config.slug} chart={c} year={yearKey} />
              </Panel>
            ))}
          </div>
        </section>

        <FeaturedImpactStory footer dataSynced="Not yet updated" dataSource={DATA_SOURCE.hm} period={period} />
      </div>
    </div>
  );
}
