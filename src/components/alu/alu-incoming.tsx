"use client";
// ALU-CHII dashboard pages: open to everyone, with the navigation and page header. Content shows "In coming data" until ready.
import PortalNav from "@/components/layout/portal-nav";
import { MetadataHeader } from "@/components/MetadataHeader";
import { DATA_SOURCE } from "@/config/data-sources";

export default function ALUIncoming({ title }: { title: string }) {
  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <PortalNav portal="alu" />
      <MetadataHeader title={title} subtitle="ALU-CHII" dataSource={DATA_SOURCE.alu} period="2024–2030" />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", fontSize: 14, color: "#9CA3AF" }}>
        In coming data
      </div>
    </div>
  );
}
