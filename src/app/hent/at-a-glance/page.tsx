"use client";
import { useEffect, useRef, useState } from "react";
import { useDataSource, useSyncedAt } from "@/hooks/useDataSource";
import { Users, Briefcase, TrendingUp, Zap, Target, Award, Handshake, Info, ChevronRight, type LucideIcon } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import PortalNav from "@/components/layout/portal-nav";
import PortalFooter from "@/components/layout/portal-footer";
import { useDashboardData } from "@/hooks/useDashboardData";
import { getPortalTheme } from "@/theme/portals";
import { COUNTRY_COORDS } from "@/lib/country-coords";

const theme = getPortalTheme("hent");
const HERO = "#2D6A4F";
const HEADER_NAVY = theme.deep;
const RED_FEMALE = "#DC2626";
const BLUE_MALE = "#479BD6";
const NOT_AVAILABLE = "In coming data";

const PROGRAMMES = ["Masterclasses", "Mentorship", "Hackathons", "Ventures", "Venture Funding", "Exposure & Networking", "Study Trips"];

let mapboxTokenReady = false;
const initMapboxToken = async () => {
  if (mapboxTokenReady) return;
  const response = await fetch("/api/mapbox-token");
  if (!response.ok) throw new Error("Mapbox token unavailable");
  const data = await response.json();
  mapboxgl.accessToken = data.token;
  mapboxTokenReady = true;
};

const fetchSection = (section: string) =>
  fetch(`/api/hent-section/${encodeURIComponent(section)}`).then(r => r.json());

function KPICard({ label, value, unit, info, Icon, secondaryText }: {
  label: string;
  value: number | null;
  unit?: string;
  info?: string;
  Icon?: LucideIcon;
  secondaryText?: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      style={{
        backgroundColor: isHovered ? "#f9fafb" : "#fff",
        borderRadius: 10,
        border: "1px solid #E5E7EB",
        borderLeft: `5px solid ${theme.brand}`,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 140,
        padding: "12px 14px",
        transition: "all 200ms ease",
        boxShadow: isHovered ? "0 4px 12px rgba(0,0,0,0.08)" : "0 1px 3px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 3, marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em", color: HEADER_NAVY, lineHeight: 1.1, margin: 0 }}>{label}</p>
          {info && (
            <div style={{ position: "relative", flexShrink: 0, cursor: "pointer" }}>
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                style={{ display: "flex", cursor: "pointer", background: "none", padding: 0, width: 11, height: 11, borderRadius: "50%", backgroundColor: "#E5E7EB", border: "1px solid #D1D5DB", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 700, color: "#6B7280" }}
                aria-label={`${label} information`}
              >
                i
              </button>
              {showTooltip && (
                <div style={{ position: "absolute", top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", backgroundColor: "#fff", color: "#111", fontSize: 10.5, lineHeight: 1.55, padding: "9px 12px", borderRadius: 7, width: 210, boxShadow: "0 4px 12px rgba(0,0,0,0.12)", border: "1px solid #E5E7EB", zIndex: 100, textAlign: "left", pointerEvents: "none" }}>
                  {info}
                </div>
              )}
            </div>
          )}
        </div>
        <ChevronRight size={16} color="#D1D5DB" style={{ flexShrink: 0 }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flex: 1 }}>
        {Icon && <Icon size={16} color={HEADER_NAVY} style={{ flexShrink: 0, strokeWidth: 2 }} />}
        <p style={{ fontSize: value === null ? 14 : 28, fontWeight: 800, color: HEADER_NAVY, lineHeight: 1, margin: 0 }}>
          {value === null ? NOT_AVAILABLE : `${value.toLocaleString()}${unit ?? ""}`}
        </p>
      </div>

      <div style={{ display: "flex", gap: 3, paddingTop: 4, borderTop: "1px solid #E5E7EB", justifyContent: "flex-start", alignItems: "center", minHeight: 14 }}>
        <p style={{ fontSize: 9, fontWeight: 600, color: "#6B7280", lineHeight: 1.2, margin: 0, textAlign: "center", width: "100%" }}>
          {secondaryText || "—"}
        </p>
      </div>
    </div>
  );
}

type HentCountry = { country: string; value: number; female?: number };

const escapeHtml = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const fmtOrNA = (v: number | null | undefined) =>
  v === null || v === undefined ? NOT_AVAILABLE : v.toLocaleString();

function HentMap({ countries }: { countries: HentCountry[] }) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const countriesRef = useRef<HentCountry[]>(countries);
  countriesRef.current = countries;

  const renderMarkers = (rows: HentCountry[]) => {
    if (!map.current) return;
    markers.current.forEach(m => m.remove());
    markers.current = [];
    rows.forEach(row => {
      const coords = COUNTRY_COORDS[row.country];
      if (!coords) return;
      const [lat, lng] = coords;
      const size = Math.min(8 + Math.log(Math.max(row.value, 1)) * 2, 16) * 2;
      const el = document.createElement("div");
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.borderRadius = "50%";
      el.style.background = "#2D6A4F";
      el.style.border = "3px solid white";
      el.style.boxShadow = "0 2px 10px rgba(45,106,79,0.5)";
      el.style.color = "white";
      el.style.fontSize = "11px";
      el.style.fontWeight = "700";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.cursor = "pointer";
      el.textContent = String(row.value);

      const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;min-width:200px">
        <strong style="color:#2D6A4F">${escapeHtml(row.country)}</strong>
        <div style="margin-top:8px;font-size:12px">
          <div style="display:flex;justify-content:space-between;padding:4px 0"><span>Ventures</span><b>${NOT_AVAILABLE}</b></div>
          <div style="display:flex;justify-content:space-between;padding:4px 0"><span>Venture Funding</span><b>${NOT_AVAILABLE}</b></div>
          <div style="display:flex;justify-content:space-between;padding:4px 0"><span>Jobs created</span><b>${NOT_AVAILABLE}</b></div>
          <div style="display:flex;justify-content:space-between;padding:4px 0"><span>Founder Diversity</span><b>${NOT_AVAILABLE}</b></div>
        </div></div>`;
      el.addEventListener("click", e => {
        e.stopPropagation();
        new mapboxgl.Popup({ offset: 12, closeButton: true }).setLngLat([lng, lat]).setHTML(html).addTo(map.current!);
      });

      markers.current.push(new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map.current!));
    });
  };

  useEffect(() => {
    if (!container.current) return;
    let cancelled = false;
    (async () => {
      await initMapboxToken();
      if (cancelled || !container.current) return;
      map.current = new mapboxgl.Map({
        container: container.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [30, 8],
        zoom: 2.6,
        attributionControl: false,
        cooperativeGestures: true,
      });
      map.current.on("style.load", () => renderMarkers(countriesRef.current));
    })();
    return () => {
      cancelled = true;
      markers.current.forEach(m => m.remove());
      markers.current = [];
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (map.current && map.current.isStyleLoaded()) renderMarkers(countries);
  }, [countries]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={container} style={{ width: "100%", height: "100%", borderRadius: 10, border: "1px solid #E5E7EB", overflow: "hidden", background: "#0B1A33" }} />
      <div style={{ position: "absolute", top: 12, left: 12, backgroundColor: "rgba(255,255,255,0.92)", borderRadius: 6, padding: "6px 10px", fontSize: 11, fontWeight: 600, color: HEADER_NAVY }}>
        Participants by country: {countries.length ? `${countries.length} countries` : NOT_AVAILABLE}
      </div>
    </div>
  );
}

export default function HENTAtAGlance() {
  const dataSource = useDataSource("HENT");
  const syncedAt = useSyncedAt("HENT");
  const { data: headlines } = useDashboardData(() => fetchSection("At a Glance").then(r => r.headlines || []), []);
  const { data: segments } = useDashboardData(() => fetchSection("At a Glance").then(r => r.segments || []), []);

  const { data: hentCountries } = useDashboardData(
    () => fetch("/api/hent-map").then(r => r.json()).then(rows => (Array.isArray(rows) ? rows : [])),
    []
  );

  const headline = (metric: string): number | null =>
    headlines?.find((h: any) => h.metric === metric)?.value ?? null;

  const segmentPct = (metric: string, segment: "female" | "male"): number | null => {
    const total = headline(metric);
    const count = segments?.find((s: any) => s.metric === metric && s.segment === segment)?.value;
    if (!total || count === undefined || count === null) return null;
    return Math.round((count / total) * 1000) / 10;
  };

  const totalParticipants = headline("Total Participants");
  const femaleShare = segmentPct("Total Participants", "female");
  const maleShare = segmentPct("Total Participants", "male");

  // Insight cards come from the workbook (v_insights), in the order set there.
  const { data: insightResult } = useDashboardData<{ insights: any[] }>(
    () => fetch("/api/insights?dashboard=HENT").then(r => r.json()),
    []
  );
  const insightRows = insightResult?.insights ?? [];
  const insights = insightRows.length > 0
    ? insightRows.map((row: any) => ({ title: row.title, figure: row.value_display ?? null, detail: row.description, copy: row.detail }))
    : [
        { title: "In coming data", figure: null, detail: "", copy: "" },
      ];

  return (
    <div style={{ backgroundColor: "#f8fafc" }}>
      <PortalNav portal="hent" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-2">
        <header style={{ position: "relative", overflow: "hidden", backgroundColor: HERO, borderRadius: 12, minHeight: 120, display: "flex", alignItems: "center" }}>
          <div style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", backgroundImage: "url('/images/Pat.png')", backgroundSize: "auto 100%", backgroundRepeat: "repeat", backgroundPosition: "center", opacity: 0.12 }} />
          <img src="/images/design1.png" alt="" aria-hidden="true"
            style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", height: "100%", width: "auto", zIndex: 1, pointerEvents: "none", userSelect: "none" }} />
          <img src="/images/design1.png" alt="" aria-hidden="true"
            style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%) scaleX(-1)", height: "100%", width: "auto", zIndex: 1, pointerEvents: "none", userSelect: "none" }} />
          <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", background: "linear-gradient(90deg, rgba(45,106,79,0) 0%, #2D6A4F 34%, #2D6A4F 66%, rgba(45,106,79,0) 100%)" }} />
          <div className="px-4 sm:px-6 py-6" style={{ position: "relative", zIndex: 10, width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <h1 className="text-lg font-black leading-tight" style={{ color: "white", letterSpacing: "0.01em" }}>HENT At a Glance</h1>
              <p className="text-[13px] mt-2 font-medium" style={{ color: "rgba(190,228,214,0.78)" }}>
                Health Entrepreneurship Programme Dashboard
              </p>
              <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[12px]" style={{ color: "rgba(190,228,214,0.5)" }}>
                <span><span style={{ color: "rgba(190,228,214,0.8)", fontWeight: 600 }}>Data source:</span> {dataSource}</span>
                <span aria-hidden="true">·</span>
                <span><span style={{ color: "rgba(190,228,214,0.8)", fontWeight: 600 }}>Period:</span> 2022–2026</span>
                <span aria-hidden="true">·</span>
                <span><span style={{ color: "rgba(190,228,214,0.8)", fontWeight: 600 }}>Last updated:</span> {syncedAt}</span>
              </div>
            </div>
          </div>
        </header>
      </div>

      <div className="max-w-[1600px] mx-auto px-10 py-7">
        <div style={{ display: "grid", gridTemplateColumns: "210px minmax(0, 1fr) 210px", gap: 24, alignItems: "stretch" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={{ fontSize: 11, fontWeight: 800, color: HEADER_NAVY, textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "center" }}>Participation</h2>
            <KPICard label="Total Participants" value={totalParticipants} Icon={Users} info="Total participants across all HENT programmes." />
            <KPICard label="Countries Reached" value={headline("Countries Reached")} Icon={Target} info="Countries where HENT participants are based." />
            <KPICard label="Ventures Supported" value={headline("Ventures Supported")} Icon={Briefcase} info="Ventures receiving HENT support." />
            <KPICard label="Ventures Funded" value={headline("Ventures Funded")} Icon={Award} info="Ventures that received capital." />
            <KPICard label="Total Jobs Created" value={headline("Total Jobs Created")} Icon={TrendingUp} info="Jobs created across HENT ventures." />
            <KPICard label="Capital Deployed" value={headline("Capital Deployed")} Icon={Zap} info="Capital deployed to HENT ventures." />
            <KPICard label="Employment Rate" value={headline("Employment Rate")} unit="%" Icon={Briefcase} info="Share of participants in employment." />
          </div>

          <HentMap countries={hentCountries || []} />

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={{ fontSize: 11, fontWeight: 800, color: HEADER_NAVY, textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "center" }}>HENT ENGAGEMENT</h2>
            {PROGRAMMES.map(name => (
              <KPICard key={name} label={name} value={headline(name)} Icon={Users} />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-10" style={{ marginTop: 24, marginBottom: 0 }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 0,
          backgroundColor: "#fff",
          borderRadius: 10,
          border: "1px solid #E5E7EB",
          padding: "20px 0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          transition: "all 200ms ease",
          overflow: "hidden",
          backgroundImage: "linear-gradient(to right, #042C53 0%, #042C53 25%, #16A34A 25%, #16A34A 50%, #3B82F6 50%, #3B82F6 75%, #9333EA 75%, #9333EA 100%)",
          backgroundSize: "100% 5px",
          backgroundPosition: "0 0",
          backgroundRepeat: "no-repeat"
        }}>
          {insights.map((insight, i) => (
            <div
              key={insight.title}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "0 16px",
                position: "relative",
                textAlign: "center",
                borderRight: i < 3 ? "1px solid #E5E7EB" : "none"
              }}
            >
              <p style={{ fontSize: insight.figure ? 28 : 14, fontWeight: 800, color: "#042C53", lineHeight: 1.2, margin: 0, marginTop: 8 }}>
                {insight.figure ?? NOT_AVAILABLE}
              </p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#042C53", lineHeight: 1.2, margin: 0 }}>
                {insight.title}
              </p>
              <p style={{ fontSize: 11, fontWeight: 500, color: "#6B7280", lineHeight: 1.3, margin: 0 }}>
                {insight.detail}
              </p>
              <p style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.4, margin: 0, marginBottom: 8 }}>
                {insight.copy}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-4 pb-10">
        <PortalFooter source={dataSource} portal="hent" synced={syncedAt} />
      </div>
    </div>
  );
}
