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

/* ── story media ─────────────────────────────────────── */
// Turns a story link into something playable on the page. Returns null for anything that is
// not a recognised video address (for example the sheet's "No" placeholder).
type MediaSource = { kind: "iframe" | "file"; src: string };

function videoSource(url: string | null): MediaSource | null {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    const lastSegment = u.pathname.split("/").filter(Boolean).pop();
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v") ?? lastSegment;
      return id ? { kind: "iframe", src: `https://www.youtube.com/embed/${id}` } : null;
    }
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      return id ? { kind: "iframe", src: `https://www.youtube.com/embed/${id}` } : null;
    }
    if (host === "vimeo.com" && lastSegment) return { kind: "iframe", src: `https://player.vimeo.com/video/${lastSegment}` };
    // Asset-library links carry the file name in a `path` query value, e.g. ...&path=PRAISE.mp4
    const file = decodeURIComponent(u.searchParams.get("path") ?? u.pathname);
    if (/\.(mp4|webm|mov)$/i.test(file)) return { kind: "file", src: url };
  } catch {
    return null;
  }
  return null;
}

function StoryMedia({ url, isVideo }: { url: string | null; isVideo: boolean }) {
  const source = videoSource(url);
  if (source?.kind === "iframe") {
    return (
      <iframe src={source.src} title="Story video" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen
        style={{ width: "100%", aspectRatio: "16 / 9", border: 0, borderRadius: 8, marginTop: 12, backgroundColor: "#000" }} />
    );
  }
  if (source?.kind === "file") {
    return <video src={source.src} controls preload="metadata" style={{ width: "100%", borderRadius: 8, marginTop: 12, backgroundColor: "#000" }} />;
  }
  const hasLink = !!url && /^https?:\/\//i.test(url);
  if (!hasLink) {
    return isVideo ? <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 12 }}>In coming data</p> : null;
  }
  // Links that are not direct media files open in a new tab, where the asset library plays them.
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      style={{ display: "inline-block", marginTop: 12, fontSize: 12, fontWeight: 700, color: NAVY }}>
      {isVideo ? "Watch video →" : "Read story →"}
    </a>
  );
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
  // Country whose bubble was clicked: its stories are shown as separate markers on the map.
  const [expanded, setExpanded] = useState<string | null>(null);

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
    const groups = new Map<string, typeof rows>();
    rows.filter(r =>
      (type === "All" || r.type === type) &&
      (pillar === "All" || r.pillar === pillar) &&
      (program === "All" || r.program === program) &&
      (!q || r.name.toLowerCase().includes(q))
    ).forEach(r => {
      if (!r.country || !COUNTRY_COORDS[r.country]) return;
      const list = groups.get(r.country) ?? [];
      list.push(r);
      groups.set(r.country, list);
    });
    return Array.from(groups.entries()).flatMap(([country, list]) => {
      const [lat, lng] = COUNTRY_COORDS[country];
      // Clicked country: one marker per story, spread on a small circle around the country.
      if (country === expanded) {
        return list.map((r, i) => {
          const angle = (2 * Math.PI * i) / list.length;
          return { id: r.id, name: r.name, type: r.type, location: country, lat: lat + 1.2 * Math.sin(angle), lng: lng + 1.2 * Math.cos(angle) };
        });
      }
      return [{ id: list[0].id, name: country, type: "", location: country, lat, lng, count: list.length }];
    });
  }, [rows, type, pillar, program, nameQuery, expanded]);

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
                  <StoryMedia url={selected.url} isVideo={selected.type === "Video"} />
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
                onSelect={(s: { id: number; location: string; count?: number }) => {
                  // A country bubble opens the country and shows one marker per story.
                  if (s.count !== undefined) {
                    setCountry(s.location);
                    setExpanded(s.location);
                  }
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
