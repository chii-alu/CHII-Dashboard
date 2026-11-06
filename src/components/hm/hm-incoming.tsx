"use client";
// Health Missions pages show this until their data is ready: the navigation and page header stay, the content is "In coming data".
import PortalNav from "@/components/layout/portal-nav";
import { MetadataHeader } from "@/components/MetadataHeader";
import { DATA_SOURCE } from "@/config/data-sources";

export default function HMIncoming({ title }: { title: string }) {
  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <PortalNav portal="hm" />
      <MetadataHeader title={title} subtitle="Health Missions" dataSource={DATA_SOURCE.hm} period="2024–2030" />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", fontSize: 14, color: "#9CA3AF" }}>
        In coming data
      </div>
    </div>
  );
}
