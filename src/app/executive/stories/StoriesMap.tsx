"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { createClient } from "@/lib/supabase-client";
// Only what the map needs: a story with a point to draw. Works for the HECO stories too.
export type MapStory = { id: number; name: string; type: string; location: string; lat: number; lng: number; count?: number };

// One city with stories, from v_story_markers. Counts only: no personal data.
export type CityMarker = {
  city_id: number; city: string; country: string; iso2: string | null; iso3: string | null;
  latitude: number; longitude: number; stories: number; video_stories: number; text_stories: number;
  hemp_stories: number; hent_stories: number; heco_stories: number; featured_stories: number;
};

type CityStory = {
  story_id: number; story_name: string; story_type: string; story_url: string | null;
  academic_program: string | null; pillars: { code: string } | { code: string }[] | null;
};

let mapboxTokenReady = false;
const initMapboxToken = async () => {
  if (mapboxTokenReady) return;
  try {
    console.log("[StoriesMap] Fetching Mapbox token from API...");
    const response = await fetch("/api/mapbox-token");

    if (!response.ok) {
      const error = await response.json();
      console.error("[StoriesMap] API error:", error);
      throw new Error(`API error: ${error.error}`);
    }

    const data = await response.json();
    console.log("[StoriesMap] Token received, setting accessToken");
    mapboxgl.accessToken = data.token;
    mapboxTokenReady = true;
    console.log("[StoriesMap] Mapbox token ready");
  } catch (error) {
    console.error("[StoriesMap] Failed to fetch Mapbox token:", error);
    throw error;
  }
};

const TEXT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h4"/></svg>`;
const VIDEO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="10 8 16 12 10 16 10 8"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>`;

function createMarkerElement(svg: string, bg: string): HTMLElement {
  const el = document.createElement("div");
  el.style.width = "28px";
  el.style.height = "28px";
  el.style.borderRadius = "50% 50% 50% 0";
  el.style.transform = "rotate(-45deg)";
  el.style.background = bg;
  el.style.display = "flex";
  el.style.alignItems = "center";
  el.style.justifyContent = "center";
  el.style.boxShadow = `0 2px 8px ${bg}40, 0 0 0 2px white`;
  el.style.border = "2px solid white";
  el.style.cursor = "pointer";
  el.style.transition = "all 200ms ease";
  el.innerHTML = `<div style="transform:rotate(45deg);display:flex">${svg}</div>`;
  return el;
}

// Popup for one city: the counts by pillar now, and its stories once they load.
// Built with DOM nodes so the text is never read as HTML.
function buildCityPopup(c: CityMarker): { node: HTMLElement; load: () => void } {
  const node = document.createElement("div");
  node.style.fontSize = "12px";
  node.style.lineHeight = "1.4";

  const title = document.createElement("strong");
  title.textContent = `${c.city}, ${c.country}`;
  const counts = document.createElement("div");
  counts.style.marginTop = "4px";
  counts.textContent = `HEMP ${c.hemp_stories} · HENT ${c.hent_stories} · HECO ${c.heco_stories}`;
  const list = document.createElement("div");
  node.append(title, counts, list);

  const load = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("impact_stories")
      .select("story_id, story_name, story_type, story_url, academic_program, pillars(code)")
      .eq("city_id", c.city_id);
    if (error || !data) return;

    list.replaceChildren(...(data as CityStory[]).map(s => {
      const row = document.createElement("div");
      row.style.marginTop = "8px";
      const name = document.createElement("div");
      name.style.fontWeight = "600";
      name.textContent = s.story_name;
      row.appendChild(name);

      const pillar = Array.isArray(s.pillars) ? s.pillars[0]?.code : s.pillars?.code;
      const detail = [s.academic_program, pillar].filter(Boolean).join(" · ");
      if (detail) {
        const sub = document.createElement("div");
        sub.style.color = "#6B7280";
        sub.textContent = detail;
        row.appendChild(sub);
      }
      if (s.story_url && /^https?:\/\//i.test(s.story_url)) {
        const link = document.createElement("a");
        link.href = s.story_url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Watch story →";
        link.style.color = "#14306B";
        link.style.fontWeight = "700";
        row.appendChild(link);
      }
      return row;
    }));
  };
  return { node, load };
}

const DEFAULT_CENTER: [number, number] = [20, 0];
const DEFAULT_ZOOM = 3.2;

// Numbered bubble for one country's stories.
function createCountBubble(count: number): HTMLDivElement {
  const el = document.createElement("div");
  el.textContent = String(count);
  Object.assign(el.style, {
    width: "34px", height: "34px", borderRadius: "50%", backgroundColor: "#14306B", color: "white",
    fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center",
    border: "2px solid white", boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
  });
  return el;
}

export default function StoriesMap({ stories, cluster, onSelect, cities = [] }: {
  stories: MapStory[];
  cluster: boolean;
  // Called with the story that was clicked; the caller passes its own story type.
  onSelect: (s: any) => void;
  // Optional: the Executive page passes the city markers.
  cities?: CityMarker[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  // Markers we added, so they can be removed by reference. Removing the marker's parent
  // element would also remove Mapbox's canvas container.
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  // City markers form their own layer, drawn on top of the country bubbles.
  const cityMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const citiesRef = useRef(cities);
  citiesRef.current = cities;

  const clearCityMarkers = () => {
    cityMarkersRef.current.forEach(marker => marker.remove());
    cityMarkersRef.current = [];
  };

  const renderCities = (map: mapboxgl.Map) => {
    clearCityMarkers();

    citiesRef.current.forEach(c => {
      const size = 22 + Math.min(c.stories, 10) * 2;
      const el = document.createElement("div");
      el.textContent = c.stories > 1 ? String(c.stories) : "";
      Object.assign(el.style, {
        width: `${size}px`, height: `${size}px`, borderRadius: "50%", backgroundColor: "#D17A86", color: "white",
        fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center",
        border: "2px solid white", boxShadow: "0 2px 6px rgba(0,0,0,0.35)", cursor: "pointer",
      });

      const popup = new mapboxgl.Popup({ offset: size / 2 + 4, maxWidth: "280px" });
      el.addEventListener("click", () => {
        const content = buildCityPopup(c);
        popup.setDOMContent(content.node).setLngLat([c.longitude, c.latitude]).addTo(map);
        content.load();
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([c.longitude, c.latitude])
        .addTo(map);
      cityMarkersRef.current.push(marker);
    });
  };

  /* init map once */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initMap = async () => {
      await initMapboxToken();

      const map = new mapboxgl.Map({
        container: containerRef.current!,
        style: "mapbox://styles/mapbox/dark-v11",
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        scrollZoom: true,
        cooperativeGestures: true
      });

      // style.load fires once the map style is ready; the markers are drawn then.
      map.on("style.load", () => {
        renderMarkers(map, stories, cluster);
        renderCities(map);
      });

      mapRef.current = map;
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  /* (re)render markers when data / cluster flag changes */
  const renderMarkers = (map: mapboxgl.Map, storiesToRender: MapStory[], useCluster: boolean) => {
    if (useCluster && !map.isStyleLoaded()) return;

    clearMarkers();

    // Remove existing source and layers if they exist
    if (map.getSource("stories")) {
      if (map.getLayer("story-clusters")) map.removeLayer("story-clusters");
      if (map.getLayer("story-cluster-count")) map.removeLayer("story-cluster-count");
      map.removeSource("stories");
    }

    // Create GeoJSON features from stories
    const features = storiesToRender.map((s, idx) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [s.lng, s.lat]
      },
      properties: {
        index: idx,
        name: s.name,
        location: s.location,
        type: s.type,
        id: s.id
      }
    }));

    // Add source with clustering options
    map.addSource("stories", {
      type: "geojson",
      data: {
        type: "FeatureCollection" as const,
        features
      },
      cluster: useCluster,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    // Function to add individual story markers
    const addIndividualMarkers = () => {
      storiesToRender.forEach(s => {
        const isVideo = /video/i.test(s.type);
        const svg = isVideo ? VIDEO_SVG : TEXT_SVG;
        const bgColor = isVideo ? "#D45F2C" : "#60a5fa";

        // A country bubble shows how many stories it holds; otherwise the story's type icon.
        const el = s.count !== undefined ? createCountBubble(s.count) : createMarkerElement(svg, bgColor);
        el.className = "story-marker";

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([s.lng, s.lat])
          .addTo(map);
        markersRef.current.push(marker);

        // Create popup
        const popup = new mapboxgl.Popup({ offset: [0, -15] })
          .setHTML(s.count !== undefined
            ? `<strong>${s.location}</strong><br/>${s.count} ${s.count === 1 ? "story" : "stories"}`
            : `<strong>${s.name}</strong><br/>${s.location}`);

        el.addEventListener("click", () => {
          map.flyTo({ center: [s.lng, s.lat], zoom: 6, duration: 1000 });
          popup.addTo(map);
          onSelectRef.current(s);
        });

        el.addEventListener("mouseenter", () => {
          el.style.opacity = "0.8";
          el.style.filter = "brightness(1.2)";
          popup.addTo(map);
        });

        el.addEventListener("mouseleave", () => {
          el.style.opacity = "1";
          el.style.filter = "brightness(1)";
          popup.remove();
        });

        el.style.cursor = "pointer";
        el.style.transition = "transform 200ms ease";
      });
    };

    if (useCluster) {
      // Add cluster layer
      map.addLayer({
        id: "story-clusters",
        type: "circle",
        source: "stories",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#60a5fa",
          "circle-radius": ["step", ["get", "point_count"], 20, 5, 30, 10, 40],
          "circle-opacity": 0.8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "white"
        }
      });

      // Add cluster count layer
      map.addLayer({
        id: "story-cluster-count",
        type: "symbol",
        source: "stories",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count"],
          "text-font": ["Open Sans Semibold"],
          "text-size": 14
        },
        paint: {
          "text-color": "white"
        }
      });

      // Function to remove individual markers
      const removeIndividualMarkers = clearMarkers;

      // Handle zoom to show/hide individual markers
      const handleZoom = () => {
        const currentZoom = map.getZoom();
        if (currentZoom > 5) {
          // Show individual markers at zoom > 5
          if (markersRef.current.length === 0) {
            addIndividualMarkers();
          }
        } else {
          // Hide individual markers at zoom <= 5
          removeIndividualMarkers();
        }
      };

      // Add click handler for clusters
      map.on("click", "story-clusters", (e) => {
        if (e.features && e.features.length > 0) {
          const cluster = e.features[0];
          const clusterSource = map.getSource("stories") as mapboxgl.GeoJSONSource;
          const clusterId = cluster.id;

          (clusterSource as any).getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
            if (err) return;

            // Zoom in
            map.flyTo({
              center: (cluster.geometry as any).coordinates,
              zoom: zoom + 2,
              duration: 750
            });

            // Add individual markers after zoom completes
            setTimeout(() => {
              addIndividualMarkers();
            }, 800);
          });
        }
      });

      map.on("mouseenter", "story-clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "story-clusters", () => {
        map.getCanvas().style.cursor = "";
      });

      // Add zoom handler to show/hide markers based on zoom level
      map.on("zoom", handleZoom);
    } else {
      // No clustering: one marker per item, always shown
      addIndividualMarkers();
    }
  };

  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      renderMarkers(mapRef.current, stories, cluster);
    }
  }, [stories, cluster]);

  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      renderCities(mapRef.current);
    }
  }, [cities]);

  const resetView = async () => {
    if (!mapRef.current || !containerRef.current) return;

    clearMarkers();

    clearCityMarkers();
    // Remove old map
    mapRef.current.remove();

    // Ensure token is ready
    await initMapboxToken();

    // Create fresh map
    const newMap = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      scrollZoom: true,
      cooperativeGestures: true
    });

    newMap.on("load", () => {
      renderMarkers(newMap, stories, cluster);
      renderCities(newMap);
    });

    mapRef.current = newMap;
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 480 }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: 480, borderRadius: 10 }} />
      <button
        onClick={resetView}
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
          color: "var(--brand-secondary)",
          backgroundColor: "white",
          border: "1px solid rgba(0,33,71,0.15)",
          borderRadius: 8,
          padding: "6px 11px",
          cursor: "pointer",
          boxShadow: "0 1px 4px rgba(0,0,0,0.18)"
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#042C53" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        Reset
      </button>
    </div>
  );
}
