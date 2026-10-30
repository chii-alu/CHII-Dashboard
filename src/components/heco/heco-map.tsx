"use client";
// HECO At a Glance map: the same Mapbox base map as HEMP, with a marker per country that has participants.
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useDashboardData } from "@/hooks/useDashboardData";
import { COUNTRY_COORDS } from "@/lib/country-coords";

type MapCountry = { country: string; missionStudents: number | null; interventions: Record<string, number> };
type MapData = { countries: MapCountry[] };

// Fetch the Mapbox token from the server, as the HEMP map does.
let mapboxTokenReady = false;
async function initMapboxToken() {
  if (mapboxTokenReady) return;
  const response = await fetch("/api/mapbox-token");
  if (!response.ok) throw new Error("Mapbox token unavailable");
  const data = await response.json();
  mapboxgl.accessToken = data.token;
  mapboxTokenReady = true;
}

const markerCount = (c: MapCountry) =>
  c.missionStudents ?? Object.values(c.interventions).reduce((sum, v) => sum + v, 0);

export default function HecoMap() {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const ready = useRef(false);
  const { data } = useDashboardData<MapData>(
    () => fetch("/api/dashboard-map?dashboard=HECO").then(r => r.json()),
    []
  );

  const draw = (countries: MapCountry[]) => {
    if (!map.current || !ready.current) return;
    markers.current.forEach(m => m.remove());
    markers.current = [];
    countries.filter(c => markerCount(c) > 0).forEach(c => {
      const coords = COUNTRY_COORDS[c.country];
      if (!coords) return;
      const el = document.createElement("div");
      const size = Math.min(8 + Math.log(markerCount(c)) * 2, 16) * 2;
      Object.assign(el.style, {
        width: `${size}px`, height: `${size}px`, borderRadius: "50%", background: "#479BD6",
        border: "3px solid white", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "11px", fontWeight: "700", color: "white", boxShadow: "0 2px 10px rgba(71,155,214,0.5)",
      });
      el.textContent = String(markerCount(c));
      markers.current.push(new mapboxgl.Marker({ element: el }).setLngLat([coords[1], coords[0]]).addTo(map.current!));
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
        center: [20, 3],
        zoom: 2.6,
        attributionControl: false,
        cooperativeGestures: true,
      });
      map.current.on("style.load", () => {
        ready.current = true;
        draw(latest.current);
      });
    })().catch(err => console.error("[HECO map]", err));
    return () => {
      cancelled = true;
      ready.current = false;
      map.current?.remove();
      map.current = null;
    };
    // The map is created once; markers are drawn from the data effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const latest = useRef<MapCountry[]>([]);
  useEffect(() => {
    latest.current = data?.countries ?? [];
    draw(latest.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return <div ref={container} style={{ width: "100%", height: "100%", minHeight: 420, borderRadius: 10, border: "1px solid #E5E7EB", overflow: "hidden" }} />;
}
