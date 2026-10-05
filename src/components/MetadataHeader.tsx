import React from 'react';
import HeaderDesign from "@/components/layout/header-design";

interface MetadataHeaderProps {
  title: string;
  subtitle: string;
  dataSource?: string;
  lastUpdated?: string;
  participantsCount?: number;
  period?: string;
  customContent?: React.ReactNode;
}

export function MetadataHeader({
  title,
  subtitle,
  dataSource = "CHII MELA Consolidated Database",
  lastUpdated = "Loading...",
  participantsCount,
  period = "2022–2026",
  customContent,
}: MetadataHeaderProps) {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-2">
      <header style={{ position: "relative", overflow: "hidden", backgroundColor: "var(--brand-primary)", borderRadius: 12, minHeight: 120, display: "flex", alignItems: "center" }}>
        <HeaderDesign />
        <div className="px-4 sm:px-6 py-6" style={{ position: "relative", zIndex: 10, width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <h1 className="text-lg font-black leading-tight" style={{ color: "white", letterSpacing: "0.01em" }}>{title}</h1>
            </div>
            <p className="text-[13px] sm:text-sm mt-2 font-medium" style={{ color: "#85B7EB" }}>{subtitle}</p>
            <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[12px] sm:text-[13px]" style={{ color: "rgba(181,212,244,0.5)" }}>
              <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Data source:</span> {dataSource}</span>
              <span aria-hidden="true">·</span>
              <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Period:</span> {period}</span>
              {participantsCount !== undefined && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{participantsCount} participants tracked</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span><span style={{ color: "rgba(181,212,244,0.8)", fontWeight: 600 }}>Last updated:</span> {lastUpdated}</span>
              {customContent}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
