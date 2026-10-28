"use client";
import React, { useState, useRef, useEffect } from "react";
import { useDataSource, useSyncedAt } from "@/hooks/useDataSource";
import { Users, BookOpen, Briefcase, TrendingUp, Target, Award, Zap, MessageCircle, Info, ChevronRight, Accessibility, type LucideIcon } from "lucide-react";
import Link from "next/link";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import PortalNav from "@/components/layout/portal-nav";
import FeaturedImpactStory from "@/components/layout/featured-impact-story";
import HeaderDesign from "@/components/layout/header-design";
import { getHeadlines } from "@/lib/dashboardData";
import { useDashboardData } from "@/hooks/useDashboardData";
import { COUNTRY_COORDS } from "@/lib/country-coords";

// Fallback data for components
const missionStudents: any[] = [];
const hempParticipations: any[] = [];

// Fetch Mapbox token from server-side API on mount
let mapboxTokenReady = false;
const initMapboxToken = async () => {
  if (mapboxTokenReady) return;
  try {
    console.log("[HEMP] Fetching Mapbox token from API...");
    const response = await fetch("/api/mapbox-token");

    if (!response.ok) {
      const error = await response.json();
      console.error("[HEMP] API error:", error);
      throw new Error(`API error: ${error.error}`);
    }

    const data = await response.json();
    console.log("[HEMP] Token received, setting accessToken");
    mapboxgl.accessToken = data.token;
    mapboxTokenReady = true;
    console.log("[HEMP] Mapbox token ready");
  } catch (error) {
    console.error("[HEMP] Failed to fetch Mapbox token:", error);
    throw error;
  }
};

const HEADER_NAVY = "#042C53";
const RED_FEMALE = "#DC2626";
const BLUE_MALE = "#479BD6";

// Pace toward the 2025–2030 target period, from today's date and the database values
function calculatePace(current: number | null, target: number | null): { status: string; needed: number | null; color: string } {
  if (current === null || target === null || target === 0) {
    return { status: "In coming data", needed: null, color: "#9CA3AF" };
  }
  const start = Date.UTC(2025, 0, 1);
  const end = Date.UTC(2030, 0, 1);
  const elapsed = Math.min(1, Math.max(0, (Date.now() - start) / (end - start)));
  const requiredNow = target * elapsed;
  const progressRatio = requiredNow > 0 ? current / requiredNow : 1;
  const yearsRemaining = (1 - elapsed) * 5;
  const needed = yearsRemaining > 0 ? (target - current) / yearsRemaining : null;

  let status = "On Pace";
  let color = "#3B82F6";
  if (progressRatio >= 1.15) {
    status = "Ahead of Schedule";
    color = "#16A34A";
  } else if (progressRatio < 0.85) {
    status = "Behind Schedule";
    color = "#EA580C";
  }
  return { status, needed, color };
}


function KPICard({
  label,
  value,
  femalePct,
  malePct,
  info,
  Icon,
  href,
  secondaryText,
  yoy,
  progress,
  progressTarget,
  detail,
  progressLabel,
  paceStatus,
  paceColor,
  secondaryTextColor,
  programmeText,
}: {
  label: string;
  value: number | string;
  femalePct?: number;
  malePct?: number;
  info?: string;
  Icon?: React.ComponentType<any>;
  href?: string;
  secondaryText?: string;
  yoy?: number;
  progress?: number;
  progressTarget?: number;
  detail?: string;
  progressLabel?: string;
  paceStatus?: string;
  paceColor?: string;
  secondaryTextColor?: string;
  programmeText?: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: 10,
        border: "1px solid #E5E7EB",
        borderLeft: `5px solid ${HEADER_NAVY}`,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 140,
        padding: "12px 14px",
        transition: "all 200ms ease",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#f9fafb";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#fff";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 3, marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em", color: HEADER_NAVY, lineHeight: 1.1, margin: 0 }}>{label}</p>
          {info && (
            <div style={{ position: "relative", flexShrink: 0, cursor: "pointer" }}>
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                style={{ display: "flex", cursor: "pointer", background: "none", padding: 0, width: 11, height: 11, borderRadius: "50%", backgroundColor: "#E5E7EB", border: "1px solid #D1D5DB", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 800, color: HEADER_NAVY, lineHeight: 1 }}
              >
                i
              </button>
              {showTooltip && (
                <div style={{position: "absolute", top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", backgroundColor: "#fff", color: "#111", fontSize: 10.5, lineHeight: 1.55, padding: "9px 12px", borderRadius: 7, width: 200, boxShadow: "0 4px 12px rgba(0,0,0,0.12)", border: "1px solid #E5E7EB", zIndex: 50, pointerEvents: "none", textAlign: "center"}}>
                  {info}
                </div>
              )}
            </div>
          )}
        </div>
        {href ? (
          <Link href={href} style={{ display: "flex", cursor: "pointer", flexShrink: 0, transition: "all 200ms ease" }}>
            <ChevronRight size={16} color={HEADER_NAVY} style={{ flexShrink: 0 }} />
          </Link>
        ) : (
          <ChevronRight size={16} color="#D1D5DB" style={{ flexShrink: 0 }} />
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flex: 1 }}>
        {Icon && <Icon size={16} color={HEADER_NAVY} style={{ flexShrink: 0, strokeWidth: 2 }} />}
        <p style={{ fontSize: value === "In coming data" ? 13 : 28, fontWeight: 800, color: HEADER_NAVY, lineHeight: 1, margin: 0 }}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
      </div>

      {paceStatus ? (
        <p style={{ fontSize: 10, fontWeight: 700, color: paceColor, lineHeight: 1, marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 800 }}>●</span>
          <span>{paceStatus}</span>
        </p>
      ) : yoy !== undefined && yoy !== null && (
        <p style={{ fontSize: 10, fontWeight: 700, color: yoy >= 0 ? "#16A34A" : "#DC2626", lineHeight: 1, marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 12 }}>{yoy >= 0 ? "↑" : "↓"}</span>
          <span>{Math.abs(yoy)}% vs last year</span>
        </p>
      )}

      {/* Progress bar is always shown; it stays empty with "In coming data" until both values exist */}
      {(() => {
        const hasProgress = progress != null && progressTarget != null && progressTarget > 0;
        return (
          <div style={{ marginBottom: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2, alignItems: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 600, color: "#9CA3AF", flex: 1 }}>Progress to 2030</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: HEADER_NAVY, textAlign: "right" }}>
                {progressLabel ? progressLabel : hasProgress ? `${Math.round((progress / progressTarget) * 100)}% of ${progressTarget.toLocaleString()}` : "In coming data"}
              </span>
            </div>
            <div style={{ width: "100%", height: 6, backgroundColor: "#E5E7EB", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", backgroundColor: "#16A34A", width: hasProgress ? `${Math.min((progress / progressTarget) * 100, 100)}%` : "0%", transition: "width 200ms ease" }} />
            </div>
          </div>
        );
      })()}

      <div style={{ display: "flex", gap: 3, paddingTop: 4, borderTop: "1px solid #E5E7EB", justifyContent: "flex-start", alignItems: "center", minHeight: 14, flexWrap: "nowrap", overflow: "visible" }}>
        {femalePct !== undefined ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={RED_FEMALE} strokeWidth="2.2">
                <circle cx="12" cy="8" r="4" />
                <path d="M12 14v8M8 18h8" />
              </svg>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#6B7280" }}>{femalePct}%</span>
            </div>
            {malePct !== undefined && (
              <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={BLUE_MALE} strokeWidth="2.2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M12 14v8" />
                  <path d="M8 18h8" />
                </svg>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#6B7280" }}>{malePct}%</span>
              </div>
            )}
            {programmeText && (
              <>
                <span style={{ fontSize: 8, fontWeight: 500, color: "#D1D5DB" }}>·</span>
                <span style={{ fontSize: 9, fontWeight: 600, color: "#6B7280", whiteSpace: "nowrap" }}>{programmeText}</span>
              </>
            )}
          </>
        ) : (
          <p style={{ fontSize: 9, fontWeight: 600, color: secondaryTextColor || "#6B7280", lineHeight: 1.2, margin: 0, textAlign: "center" }}>
            {secondaryText}
          </p>
        )}
      </div>
    </div>
  );
}

type MapCountry = { country: string; value: number };

function MapContainer({ countries }: { countries: MapCountry[] }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const mapReady = useRef(false);

  // Draws one marker per country with participants. Runs once the map has loaded.
  const drawMarkers = (list: MapCountry[]) => {
    if (!map.current || !mapReady.current) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    list.filter(c => c.value > 0).forEach(({ country, value }) => {
      const count = value;
      const coords = COUNTRY_COORDS[country];
      if (!coords) return;

      const el = document.createElement("div");
      const size = Math.min(8 + Math.log(count) * 2, 16) * 2;

      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.borderRadius = "50%";
      el.style.background = "#479BD6";
      el.style.border = "3px solid white";
      el.style.cursor = "pointer";
      el.style.boxShadow = "0 2px 10px rgba(71, 155, 214, 0.5)";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.fontSize = "11px";
      el.style.fontWeight = "700";
      el.style.color = "white";
      el.style.transition = "all 200ms ease";
      el.textContent = count.toString();

      const marker = new mapboxgl.Marker({ element: el }).setLngLat([coords[1], coords[0]]).addTo(map.current!);
      markersRef.current.push(marker);

      el.addEventListener("click", () => {
        const point = map.current!.project([coords[1], coords[0]]);
        map.current!.flyTo({ center: [coords[1], coords[0]], zoom: 4, duration: 1000 });
        setSelectedCountry({ name: country, students: count });
        setPopupPos({ top: point.y + 20, left: point.x + 20 });
      });

      el.addEventListener("mouseenter", () => {
        el.style.opacity = "0.8";
        el.style.filter = "brightness(1.2)";
      });

      el.addEventListener("mouseleave", () => {
        el.style.opacity = "1";
        el.style.filter = "brightness(1)";
      });
    });
  };

  const countriesRef = useRef<MapCountry[]>(countries);
  useEffect(() => {
    countriesRef.current = countries;
    drawMarkers(countries);
  }, [countries]);

  useEffect(() => {
    if (!mapContainer.current) return;
    // Development mounts effects twice; a cancelled run must not create a second map.
    let cancelled = false;

    const initMap = async () => {
      await initMapboxToken();

      if (cancelled || !mapContainer.current) return;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [20, 3],
        zoom: 2.6,
        attributionControl: false,
        cooperativeGestures: true,
      });

      map.current.on("style.load", () => {
        mapReady.current = true;
        drawMarkers(countriesRef.current);
      });
    };

    initMap();

    return () => {
      cancelled = true;
      mapReady.current = false;
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%", borderRadius: 10, border: "1px solid #E5E7EB", overflow: "hidden" }} />

      {selectedCountry && popupPos && (
        <div style={{ position: "absolute", top: popupPos.top, left: popupPos.left, backgroundColor: "#fff", borderRadius: 10, padding: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", border: "1px solid #E5E7EB", width: 420, zIndex: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: HEADER_NAVY }}>{selectedCountry.name}</h2>
            <button onClick={() => { setSelectedCountry(null); setPopupPos(null); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#9CA3AF", padding: 0, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", marginBottom: 2 }}>Mission Students</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: HEADER_NAVY }}>{selectedCountry.students ?? "In coming data"}</div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #E5E7EB" }}>
                  <th style={{ textAlign: "left", padding: "5px 6px", fontWeight: 600, color: "#6B7280", fontSize: 11 }}></th>
                  <th style={{ textAlign: "left", padding: "5px 6px", fontWeight: 600, color: "#6B7280", fontSize: 11 }}>Career Workshops</th>
                  <th style={{ textAlign: "left", padding: "5px 6px", fontWeight: 600, color: "#6B7280", fontSize: 11 }}>Exposure Events</th>
                  <th style={{ textAlign: "left", padding: "5px 6px", fontWeight: 600, color: "#6B7280", fontSize: 11 }}>Internships</th>
                  <th style={{ textAlign: "left", padding: "5px 6px", fontWeight: 600, color: "#6B7280", fontSize: 11 }}>SIE</th>
                  <th style={{ textAlign: "left", padding: "5px 6px", fontWeight: 600, color: "#6B7280", fontSize: 11 }}>Courses</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                  <td style={{ padding: "4px 6px", color: "#6B7280", fontWeight: 600, fontSize: 11 }}>Participants</td>
                  <td style={{ padding: "4px 6px", color: HEADER_NAVY, fontWeight: 500, fontSize: 11 }}>{"In coming data"}</td>
                  <td style={{ padding: "4px 6px", color: HEADER_NAVY, fontWeight: 500, fontSize: 11 }}>{"In coming data"}</td>
                  <td style={{ padding: "4px 6px", color: HEADER_NAVY, fontWeight: 500, fontSize: 11 }}>{"In coming data"}</td>
                  <td style={{ padding: "4px 6px", color: HEADER_NAVY, fontWeight: 500, fontSize: 11 }}>{"In coming data"}</td>
                  <td style={{ padding: "4px 6px", color: HEADER_NAVY, fontWeight: 500, fontSize: 11 }}>{"In coming data"}</td>
                </tr>
                <tr>
                  <td style={{ padding: "4px 6px", color: "#6B7280", fontWeight: 600, fontSize: 11 }}>% of Total</td>
                  <td style={{ padding: "4px 6px", color: HEADER_NAVY, fontWeight: 600, fontSize: 11 }}>{"In coming data"}</td>
                  <td style={{ padding: "4px 6px", color: HEADER_NAVY, fontWeight: 600, fontSize: 11 }}>{"In coming data"}</td>
                  <td style={{ padding: "4px 6px", color: HEADER_NAVY, fontWeight: 600, fontSize: 11 }}>{"In coming data"}</td>
                  <td style={{ padding: "4px 6px", color: HEADER_NAVY, fontWeight: 600, fontSize: 11 }}>{"In coming data"}</td>
                  <td style={{ padding: "4px 6px", color: HEADER_NAVY, fontWeight: 600, fontSize: 11 }}>{"In coming data"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          if (map.current) {
            map.current.flyTo({ center: [20, 3], zoom: 2.6, duration: 1000 });
            setSelectedCountry(null);
          }
        }}
        title="Reset map view"
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 500,
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          fontSize: 11.5,
          fontWeight: 700,
          color: HEADER_NAVY,
          backgroundColor: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 8,
          padding: "6px 11px",
          cursor: "pointer",
          boxShadow: "0 1px 4px rgba(0,0,0,0.18)"
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        Reset
      </button>
    </div>
  );
}

export default function HEMPPage() {
  const dataSource = useDataSource("HEMP");
  const syncedAt = useSyncedAt("HEMP");
  // Fetch headline data from Supabase
  const { data: headlineResult, loading, error } = useDashboardData(
    () => fetch('/api/hemp-section/At%20a%20Glance').then(r => r.json()),
    []
  );
  const headlines = headlineResult?.headlines;
  const headlineValue = (metric: string): number | null => headlines?.find((h: any) => h.metric === metric)?.value ?? null;
  const targetValue = (metric: string): number | null => headlineResult?.targets?.find((h: any) => h.metric === metric)?.value ?? null;
  const { data: workshopResult } = useDashboardData(
    () => fetch('/api/hemp-intervention?intervention=Career%20Workshops').then(r => r.json()),
    []
  );
  const workshopParticipants = workshopResult?.headlines?.find((h: any) => h.metric === "Total Participants")?.value ?? null;
  // At a Glance insight cards come from the workbook (v_insights), in the order set there.
  const { data: mapCountries } = useDashboardData<MapCountry[]>(
    () => fetch('/api/hemp-map').then(r => r.json()),
    []
  );
  const { data: insightResult } = useDashboardData(
    () => fetch('/api/insights?dashboard=HEMP').then(r => r.json()),
    []
  );
  const INSIGHT_ACCENTS = ["#042C53", "#16A34A", "#3B82F6", "#9333EA"];
  const insightRows: any[] = insightResult?.insights ?? [];
  const insights = insightRows.length > 0
    ? insightRows.map((row: any, i: number) => ({
        title: row.title,
        figure: row.value_display ?? null,
        detail: row.description,
        copy: row.detail,
        accentColor: INSIGHT_ACCENTS[i % INSIGHT_ACCENTS.length],
      }))
    : [{ title: "In coming data", figure: null, detail: "", copy: "", accentColor: "#9CA3AF" }];

  const totalStudents = headlineValue("Total Enrolled");
  const femaleStudentsPct = headlineValue("Female %");
  const maleStudentsPct = headlineValue("Male %");
  const inclusionReachValue = headlineValue("Inclusion Reach");

  const uniqueHempStudents = null as number | null;

  const byInclusion = {
    pwd: missionStudents.filter(s => s.disability === "Yes").length,
    refugee: missionStudents.filter(s => s.humanitarianStatus === "Refugee").length,
  };

  const byAcademicStanding = {
    excellent: missionStudents.filter(s => s.academicStanding === "excellent").length,
    good: missionStudents.filter(s => s.academicStanding === "good").length,
    atRisk: missionStudents.filter(s => s.academicStanding === "at-risk").length,
  };

  const byEnrollmentStatus = {
    active: missionStudents.filter(s => s.enrollmentStatus === "active").length,
    completed: missionStudents.filter(s => s.enrollmentStatus === "completed").length,
  };

  // Calculate female % for HEMP activities
  const careerWorkshopsParticipants = hempParticipations.filter(p => p.activity === "Career Workshops");
  const careerWorkshopsCount: number | null = workshopParticipants;
  const careerWorkshopsFemale = careerWorkshopsParticipants.filter(p => {
    const student = missionStudents.find(s => s.id === p.studentId);
    return student?.gender === "Female";
  }).length;
  const careerWorkshopsFemalePercent = careerWorkshopsCount ? Math.round((careerWorkshopsFemale / careerWorkshopsCount) * 100) : null;

  const internshipsParticipants = hempParticipations.filter(p => p.activity === "Internships");
  const internshipsCount: number | null = null;
  const internshipsFemale = internshipsParticipants.filter(p => {
    const student = missionStudents.find(s => s.id === p.studentId);
    return student?.gender === "Female";
  }).length;
  const internshipsFemalePercent = internshipsCount ? Math.round((internshipsFemale / internshipsCount) * 100) : null;

  const sieParticipants = hempParticipations.filter(p => p.activity === "Student Immersive Experience");
  const sieCount: number | null = null;
  const sieFemale = sieParticipants.filter(p => {
    const student = missionStudents.find(s => s.id === p.studentId);
    return student?.gender === "Female";
  }).length;
  const sieFemalePercent = sieCount ? Math.round((sieFemale / sieCount) * 100) : null;

  const coursesParticipants = hempParticipations.filter(p => p.activity === "Courses");
  const coursesCount: number | null = null;
  const coursesFemale = coursesParticipants.filter(p => {
    const student = missionStudents.find(s => s.id === p.studentId);
    return student?.gender === "Female";
  }).length;
  const coursesFemalePercent = coursesCount ? Math.round((coursesFemale / coursesCount) * 100) : null;

  const studentsByCountry = new Map<string, number>();
  missionStudents.forEach(s => {
    studentsByCountry.set(s.countryOfResidence, (studentsByCountry.get(s.countryOfResidence) || 0) + 1);
  });

  const countries = headlineValue("Countries Reached");

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);

  if (loading) {
    return (
      <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 16, color: "#666" }}>Loading HEMP dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 16, color: "#d32f2f" }}>Failed to load data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <PortalNav portal="hemp" />

      {/* Header */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-2">
        <header style={{ position: "relative", overflow: "hidden", backgroundColor: HEADER_NAVY, borderRadius: 12, minHeight: 120, display: "flex", alignItems: "center" }}>
          <HeaderDesign />
          <div className="px-4 sm:px-6 py-6" style={{ position: "relative", zIndex: 10, width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <h1 className="text-lg font-black leading-tight" style={{ color: "white", letterSpacing: "0.01em" }}>CHII Health Missions and HEMP Programme Dashboard</h1>
              <p className="text-[13px] mt-2 font-medium" style={{ color: "rgba(215,225,245,0.8)" }}>
                Programme reach across Africa
              </p>
              <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[12px]" style={{ color: "rgba(215,225,245,0.5)" }}>
                <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Data source:</span> {dataSource}</span>
                <span aria-hidden="true">·</span>
                <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Period:</span> 2024–2030</span>
                <span aria-hidden="true">·</span>
                <span>{countries === null ? "In coming data" : `${countries} countries active`}</span>
                <span aria-hidden="true">·</span>
                <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Last updated:</span> {syncedAt}</span>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Stats Cards Section */}
      <div className="max-w-[1600px] mx-auto px-10 py-7">
        <div style={{ display: "grid", gridTemplateColumns: "220px minmax(0, 1fr) 220px", gap: 24, alignItems: "end", overflowX: "hidden" }}>

          {/* Left Column: Mission Students */}
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <h2 style={{ fontSize: 11, fontWeight: 800, color: HEADER_NAVY, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 14, flexShrink: 0, textAlign: "center" }}>Mission Students</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1, justifyContent: "space-between" }}>
              <KPICard
                label="Total Enrolled"
                value={totalStudents ?? "In coming data"}
                femalePct={femaleStudentsPct ?? undefined}
                malePct={maleStudentsPct ?? undefined}
                info="Active health professions students."
                Icon={Users}
                secondaryText={femaleStudentsPct === null ? "In coming data" : undefined}
              />
              <KPICard
                label="Countries Reached"
                value={countries ?? "In coming data"}
                info="Geographic distribution across Africa."
                Icon={Users}
                secondaryText={countries === null ? "In coming data" : undefined}
              />
              {(() => {
                const employmentRate = headlineValue("Employment Rate");
                return (
                  <KPICard
                    label="Employment Rate"
                    value={employmentRate === null ? "In coming data" : `${employmentRate}%`}
                    info="Graduates securing employment or self-employment."
                    Icon={Briefcase}
                    secondaryText={employmentRate === null ? "In coming data" : "Graduates in employment or self-employment"}
                  />
                );
              })()}
              {(() => {
                const venturesCount = headlineValue("Students with ventures");
                return (
                  <KPICard
                    label="Students w/ Ventures"
                    value={venturesCount ?? "In coming data"}
                    info="Founders or co-founders of health ventures."
                    Icon={Zap}
                    secondaryText="Health ventures"
                  />
                );
              })()}
              {(() => {
                const inclusionReach = headlineValue("Inclusion Reach");
                return (
                  <KPICard
                    label="Inclusion Reach"
                    value={inclusionReach === null ? "In coming data" : `${Math.round(inclusionReach * 10) / 10}%`}
                    info="PWD and Refugee students. Deliberate focus on underrepresented populations."
                    Icon={Accessibility}
                    secondaryText={inclusionReach === null ? "In coming data" : "PWD and Refugee students"}
                  />
                );
              })()}
            </div>
          </div>

          {/* Center Column: Map */}
          <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1 }}>
            <MapContainer countries={mapCountries ?? []} />
          </div>

          {/* Right Column: HEMP Engagement */}
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <h2 style={{ fontSize: 11, fontWeight: 800, color: HEADER_NAVY, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 14, flexShrink: 0, textAlign: "center" }}>HEMP Engagement</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1, justifyContent: "space-between" }}>
              {(() => {
                const pace = calculatePace(uniqueHempStudents, totalStudents);
                return (
                  <KPICard
                    label="HEMP Engagement Rate"
                    value={uniqueHempStudents === null ? "In coming data" : uniqueHempStudents.toLocaleString()}
                    progress={uniqueHempStudents ?? undefined}
                    progressTarget={totalStudents ?? undefined}
                    progressLabel={uniqueHempStudents === null || !totalStudents ? "In coming data" : `${Math.round((uniqueHempStudents / totalStudents) * 100)}% of all students`}
                    info="Students engaged in at least one HEMP activity."
                    Icon={Briefcase}
                    secondaryText={pace.status}
                    paceColor={pace.color}
                  />
                );
              })()}
              {(() => {
                const pace = calculatePace(careerWorkshopsCount, null);
                return (
                  <KPICard
                    label="Career Exposure"
                    value={careerWorkshopsCount ?? "In coming data"}
                    progress={careerWorkshopsCount ?? undefined}
                    progressLabel={"In coming data"}
                    info="Exposure events and workshop participation toward 2030 target."
                    Icon={BookOpen}
                    href="/hemp/career-workshops"
                    secondaryText={pace.status}
                    secondaryTextColor={pace.color}
                  />
                );
              })()}
              {(() => {
                const pace = calculatePace(internshipsCount, targetValue("Internships"));
                return (
                  <KPICard
                    label="Internships"
                    value={internshipsCount ?? "In coming data"}
                    progress={internshipsCount ?? undefined}
                    progressLabel={internshipsCount === null || targetValue("Internships") === null ? "In coming data" : `${Math.round((internshipsCount / (targetValue("Internships") ?? 1)) * 100)}%`}
                    info="Internship placements toward 2030 target."
                    Icon={Briefcase}
                    href="/hemp/internships"
                    secondaryText={pace.status}
                    secondaryTextColor={pace.color}
                  />
                );
              })()}
              {(() => {
                const pace = calculatePace(sieCount, targetValue("SIE placements"));
                return (
                  <KPICard
                    label="SIE Placements"
                    value={sieCount ?? "In coming data"}
                    progress={sieCount ?? undefined}
                    progressLabel={sieCount === null || targetValue("SIE placements") === null ? "In coming data" : `${Math.round((sieCount / (targetValue("SIE placements") ?? 1)) * 100)}%`}
                    info="SIE programme placements toward 2030 target."
                    Icon={TrendingUp}
                    href="/hemp/sie"
                    secondaryText={pace.status}
                    secondaryTextColor={pace.color}
                  />
                );
              })()}
              {(() => {
                const pace = calculatePace(coursesCount, null);
                return (
                  <KPICard
                    label="Courses"
                    value={coursesCount ?? "In coming data"}
                    progress={coursesCount ?? undefined}
                    progressLabel={"In coming data"}
                    info="Course enrollments toward 2030 target."
                    Icon={BookOpen}
                    href="/hemp/course"
                    secondaryText={pace.status}
                    secondaryTextColor={pace.color}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Insights Section */}
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
              key={i}
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
              <p style={{ fontSize: insight.figure === null ? 14 : 32, fontWeight: 800, color: "#042C53", lineHeight: 1, margin: 0, marginTop: 8 }}>
                {insight.figure ?? "In coming data"}
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

      <div className="max-w-[1600px] mx-auto px-10" style={{ paddingTop: 16, paddingBottom: 16 }}>
        {/* Footer placeholder */}
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-4 pb-10">
        <FeaturedImpactStory footer dataSynced={syncedAt} dataSource={dataSource} />
      </div>
    </div>
  );
}
