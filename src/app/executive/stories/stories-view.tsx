"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { COUNTRY_COORDS } from "@/lib/country-coords";
import { useDataSource, useSyncedAt } from "@/hooks/useDataSource";
import { Info, ChevronDown, FileText, Video, MapPin, BookOpen } from "lucide-react";
import FeaturedImpactStory from "@/components/layout/featured-impact-story";
import StatsKpiCard from "@/components/ui/stat-kpi-card";
import { MetadataHeader } from "@/components/MetadataHeader";

const StoriesMap = dynamic(() => import("./StoriesMap"), { ssr: false, loading: () =>
  <div style={{ width: "100%", height: "100%", minHeight: 480, borderRadius: 10, backgroundColor: "#E9EEF4", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", fontSize: 13 }}>Loading map…</div>
});

export type StoryRow = {
  story_id: number;
  story_name: string;
  story_type: string;
  story_url: string | null;
  date_captured: string | null;
  featured: boolean;
  academic_program: string | null;
  countries: { name: string } | { name: string }[] | null;
  pillars: { code: string } | { code: string }[] | null;
  academic_programs: { code: string; name: string } | { code: string; name: string }[] | null;
};

export type StorySummary = {
  total_stories: number;
  video_stories: number;
  text_stories: number;
  countries_represented: number;
  featured_stories: number;
};

/* ── palette ─────────────────────────────────────────── */
const NAVY = "#14306B";
const BAND = "#14306B";
const TICK = "#D17A86";

const first = <T,>(v: T | T[] | null | undefined): T | null => (Array.isArray(v) ? v[0] ?? null : v ?? null);

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/* ── panel (header strip + body) ─────────────────────── */
function Panel({ title, info, collapsible, collapsed, onToggle, children }: {
  title: string; info?: boolean; collapsible?: boolean; collapsed?: boolean; onToggle?: () => void; children: React.ReactNode;
}) {
  return (
    <div style={{ backgroundColor: "white", borderRadius: 10, border: "1px solid rgba(0,33,71,0.08)", overflow: "hidden" }}>
      <div onClick={collapsible ? onToggle : undefined}
        style={{ backgroundColor: BAND, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, cursor: collapsible ? "pointer" : "default" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
          <div style={{ width: 3, height: 15, borderRadius: 999, backgroundColor: TICK, flexShrink: 0 }} />
          <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "white" }}>{title}</p>
          {info && <Info size={11} color="rgba(181,212,244,0.85)" />}
        </div>
        {collapsible && <ChevronDown size={15} color="white" style={{ transform: collapsed ? "rotate(-90deg)" : "none", transition: "transform 0.15s" }} />}
      </div>
      {!collapsed && <div style={{ padding: "14px 16px 16px" }}>{children}</div>}
    </div>
  );
}

/* ── filter dropdown ─────────────────────────────────── */
function Dropdown({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", marginTop: 4, fontSize: 11.5, color: NAVY, backgroundColor: "white", border: "1px solid rgba(0,33,71,0.15)", borderRadius: 6, padding: "7px 8px", cursor: "pointer", lineHeight: 1.3, minHeight: 34 }}>
        <option value="All">All</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

export default function StoriesView({ stories, summary }: { stories: StoryRow[]; summary: StorySummary | null }) {
  const dataSource = useDataSource("EXEC");
  const syncedAt = useSyncedAt("EXEC");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [nameQuery, setNameQuery] = useState("");
  const [type, setType] = useState("All");
  const [pillar, setPillar] = useState("All");
  const [country, setCountry] = useState("All");
  const [program, setProgram] = useState("All");

  const rows = useMemo(() => stories.map(s => ({
    id: s.story_id,
    name: s.story_name,
    type: s.story_type,
    country: first(s.countries)?.name ?? "",
    pillar: first(s.pillars)?.code ?? "",
    program: s.academic_program ?? "",
    date: formatDate(s.date_captured),
    url: s.story_url,
    featured: s.featured,
  })), [stories]);

  const types = useMemo(() => Array.from(new Set(rows.map(r => r.type).filter(Boolean))).sort(), [rows]);
  const pillars = useMemo(() => Array.from(new Set(rows.map(r => r.pillar).filter(Boolean))).sort(), [rows]);
  const countries = useMemo(() => Array.from(new Set(rows.map(r => r.country).filter(Boolean))).sort(), [rows]);
  const programs = useMemo(() => Array.from(new Set(rows.map(r => r.program).filter(Boolean))).sort(), [rows]);

  const filtered = useMemo(() => {
    const q = nameQuery.trim().toLowerCase();
    return rows.filter(r =>
      (type === "All" || r.type === type) &&
      (pillar === "All" || r.pillar === pillar) &&
      (program === "All" || r.program === program) &&
      (country === "All" || r.country === country) &&
      (!q || r.name.toLowerCase().includes(q))
    );
  }, [rows, type, pillar, program, country, nameQuery]);

  const selected = filtered.find(r => r.id === selectedId) ?? null;

  // One bubble per country, showing how many stories it holds. The country filter is left out
  // so every bubble stays on the map when one is clicked.
  const mapStories = useMemo(() => {
    const q = nameQuery.trim().toLowerCase();
    const groups = new Map<string, { ids: number[] }>();
    rows.filter(r =>
      (type === "All" || r.type === type) &&
      (pillar === "All" || r.pillar === pillar) &&
      (program === "All" || r.program === program) &&
      (!q || r.name.toLowerCase().includes(q))
    ).forEach(r => {
      if (!r.country || !COUNTRY_COORDS[r.country]) return;
      const g = groups.get(r.country) ?? { ids: [] };
      g.ids.push(r.id);
      groups.set(r.country, g);
    });
    return Array.from(groups.entries()).map(([country, g]) => {
      const [lat, lng] = COUNTRY_COORDS[country];
      return { id: g.ids[0], name: country, type: "", location: country, lat, lng, count: g.ids.length };
    });
  }, [rows, type, pillar, program, nameQuery]);

  useEffect(() => {
    if (selectedId !== null && !filtered.some(r => r.id === selectedId)) setSelectedId(null);
  }, [filtered, selectedId]);

  return (
    <div style={{ backgroundColor: "var(--bg-page)", minHeight: "100vh" }}>

      {/* ── Banner + KPI strip ─────────────────────────── */}
      <MetadataHeader
        title="Impact stories"
        subtitle="Graduate journeys and enterprise spotlights across Africa"
        dataSource={dataSource}
        lastUpdated={syncedAt}
        period="2024–2030"
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-7">

        {/* ── Stats row ──────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))", gap: 12, marginBottom: 16 }}>
          <StatsKpiCard label="Stories" num={summary?.total_stories ?? null} sub="Total impact stories" Icon={BookOpen}
            tooltip="Total number of published impact stories across all programmes." />
          <StatsKpiCard label="Countries" num={summary?.countries_represented ?? null} sub="Represented" Icon={MapPin}
            tooltip="Number of countries represented across the impact stories." />
          <StatsKpiCard label="Video Stories" num={summary?.video_stories ?? null} sub="Filmed journeys" Icon={Video}
            tooltip="Impact stories told through video." />
          <StatsKpiCard label="Written Stories" num={summary?.text_stories ?? null} sub="Written features" Icon={FileText}
            tooltip="Impact stories told through written features." />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 360px) minmax(0, 1fr)", gap: 16, alignItems: "stretch" }} className="stories-grid">

          {/* LEFT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Story detail */}
            <Panel title="Story detail" info>
              {selected ? (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                    {selected.type === "Video"
                      ? <Video size={14} color="#7C3AED" />
                      : <FileText size={14} color="var(--brand-primary)" />}
                    <span style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7280" }}>{selected.type}</span>
                    {selected.featured && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#9A3412", backgroundColor: "#FFEDD5", borderRadius: 999, padding: "2px 8px", marginLeft: 4 }}>Featured</span>
                    )}
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 800, color: NAVY, lineHeight: 1.25 }}>{selected.name}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4, color: "#6B7280" }}>
                    <MapPin size={12} /><span style={{ fontSize: 11 }}>{[selected.country, selected.pillar].filter(Boolean).join(" · ")}</span>
                  </div>
                  <p style={{ fontSize: 11, color: selected.program ? "#374151" : "#9CA3AF", marginTop: 4 }}>
                    {selected.program || "In coming data"}
                  </p>
                  {selected.date && <p style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>{selected.date}</p>}
                  {selected.url && (
                    <a href={selected.url} target="_blank" rel="noopener noreferrer"
                      style={{ display: "inline-block", marginTop: 12, fontSize: 12, fontWeight: 700, color: NAVY }}>
                      Watch story →
                    </a>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "26px 12px" }}>
                  <BookOpen size={26} color="#C5D2E0" />
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: NAVY, marginTop: 10 }}>Select a story</p>
                  <p style={{ fontSize: 11.5, color: "#9CA3AF", marginTop: 4, lineHeight: 1.55 }}>
                    {rows.length === 0 ? "No stories yet" : "Click a story in the list to view it."}
                  </p>
                </div>
              )}
            </Panel>

            {/* Filters */}
            <Panel title="Filter stories" collapsible collapsed={!filtersOpen} onToggle={() => setFiltersOpen(o => !o)}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Dropdown label="Story type" value={type} options={types} onChange={setType} />
                <Dropdown label="Pillar" value={pillar} options={pillars} onChange={setPillar} />
                <Dropdown label="Country" value={country} options={countries} onChange={setCountry} />
                <Dropdown label="Academic programme" value={program} options={programs} onChange={setProgram} />
              </div>

              <label style={{ display: "block", marginTop: 12 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>Search by name:</span>
                <input value={nameQuery} onChange={e => setNameQuery(e.target.value)} placeholder="e.g., Peter"
                  style={{ width: "100%", marginTop: 4, fontSize: 11.5, color: NAVY, backgroundColor: "white", border: "1px solid rgba(0,33,71,0.15)", borderRadius: 6, padding: "7px 9px", outline: "none" }} />
              </label>
            </Panel>
          </div>

          {/* RIGHT COLUMN — map */}
          <div style={{ backgroundColor: "white", borderRadius: 10, border: "1px solid rgba(0,33,71,0.08)", overflow: "hidden", minHeight: 520 }}>
            <div style={{ height: "100%", minHeight: 520 }}>
              <StoriesMap
                stories={mapStories}
                cluster={false}
                onSelect={(s: { id: number; location: string }) => {
                  setCountry(s.location);
                  setSelectedId(s.id);
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <FeaturedImpactStory footer dataSynced={syncedAt} dataSource={dataSource} />
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .stories-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
