"use client";
// Event gallery for a pillar portal (HEMP, HENT, HECO, HM). Same design as the ALU-CHII gallery.
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import PortalNav from "@/components/layout/portal-nav";
import FeaturedImpactStory from "@/components/layout/featured-impact-story";
import { MetadataHeader } from "@/components/MetadataHeader";
import { DATA_SOURCE } from "@/config/data-sources";
import type { Portal } from "@/theme/portals";
import { EventCard, ImageViewer, dummyImage } from "@/components/alu/alu-chii-page";

const NAVY = "var(--brand-secondary)";
type GalleryEvent = { title: string; date: string; location: string; type: string };

export default function PillarGallery({ portal, title, subtitle, events, withNav }: {
  portal: Exclude<Portal, "alu" | "executive">;
  title: string;
  subtitle: string;
  events: GalleryEvent[];
  /** HECO's layout already draws the portal nav; the other pillars draw it here. */
  withNav: boolean;
}) {
  const [type, setType] = useState("All");
  const types = ["All", ...Array.from(new Set(events.map(e => e.type)))];
  const shown = events.filter(e => type === "All" || e.type === type);
  const [viewing, setViewing] = useState<number | null>(null);
  const closeViewer = useCallback(() => setViewing(null), []);
  const viewed = viewing === null ? null : shown[viewing] ?? null;

  return (
    <div style={{ backgroundColor: "var(--bg-page)", minHeight: "100vh" }}>
      {withNav && <PortalNav portal={portal} />}
      <MetadataHeader title={title} subtitle={subtitle} dataSource={DATA_SOURCE[portal]} lastUpdated="Not yet updated" period="2026–2030" />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-7 space-y-10">
        <section className="space-y-4">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {types.map(t => {
              const on = t === type;
              return (
                <button key={t} type="button" onClick={() => setType(t)}
                  style={{ fontSize: 11.5, fontWeight: 700, padding: "7px 13px", borderRadius: 999, cursor: "pointer",
                    border: `1px solid ${on ? NAVY : "rgba(0,33,71,0.15)"}`,
                    backgroundColor: on ? NAVY : "var(--bg-surface)", color: on ? "white" : "#6B7280" }}>
                  {t}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 2 }}>
            <span style={{ width: 4, height: 16, borderRadius: 999, backgroundColor: "#D17A86", flexShrink: 0, alignSelf: "center" }} />
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 800, color: NAVY, letterSpacing: "0.01em" }}>Events</h2>
              <p style={{ fontSize: 11, color: "#6B7280", marginTop: 1 }}>{shown.length} {shown.length === 1 ? "event" : "events"}.</p>
            </div>
          </div>
          {shown.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No events match this filter.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 16 }}>
              {shown.map((e, i) => (
                <EventCard key={e.title} title={e.title} date={e.date} location={e.location} type={e.type} index={i} onOpen={() => setViewing(i)} />
              ))}
            </div>
          )}
        </section>

        <FeaturedImpactStory footer dataSynced="Not yet updated" dataSource={DATA_SOURCE[portal]} period="2026–2030" />
      </div>

      {viewed && viewing !== null && createPortal(
        <ImageViewer src={dummyImage(viewed.title, viewing)} title={viewed.title} date={`${viewed.date} · ${viewed.location}`} onClose={closeViewer} />,
        document.body
      )}
    </div>
  );
}
