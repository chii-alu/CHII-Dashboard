"use client";
import { MetadataHeader } from "@/components/MetadataHeader";
import FeaturedImpactStory from "@/components/layout/featured-impact-story";

export default function FurtherEducationPage() {
  return (
    <div style={{ backgroundColor: "var(--bg-page)", minHeight: "100vh" }}>
      <MetadataHeader
        title="Further Study"
        subtitle="Further Education, Study Pathways, and Lifelong Learning"
        dataSource="In coming data"
        lastUpdated="In coming data"
        period="2022–2026"
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-7 space-y-10">
        <div style={{ backgroundColor: "white", borderRadius: 10, border: "1px solid rgba(0,33,71,0.08)", padding: "64px 18px", textAlign: "center" }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: "var(--brand-secondary)" }}>In coming data</p>
        </div>

        <FeaturedImpactStory footer />
      </div>
    </div>
  );
}
