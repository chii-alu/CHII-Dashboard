"use client";
import { useEffect, useState } from "react";

export function sourceLabel(workbook: string): string {
  return workbook.replace(/\.xlsx$/i, "").split("_").slice(0, 3).join(" ");
}

export function useDataSource(dashboard: "EXEC" | "HEMP" | "HENT" | "HECO"): string {
  const [label, setLabel] = useState<string>("Loading...");
  useEffect(() => {
    fetch(`/api/data-source?dashboard=${dashboard}`)
      .then(r => r.json())
      .then(result => setLabel(result.workbook ? sourceLabel(result.workbook) : "In coming data"))
      .catch(() => setLabel("In coming data"));
  }, [dashboard]);
  return label;
}

export function formatSynced(iso: string): string {
  const date = new Date(iso);
  const dateStr = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "Africa/Kigali" }).format(date);
  const timeStr = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Africa/Kigali" }).format(date);
  return `${dateStr}, ${timeStr} CAT`;
}

export function useSyncedAt(dashboard: "EXEC" | "HEMP" | "HENT" | "HECO"): string {
  const [synced, setSynced] = useState<string>("Loading...");
  useEffect(() => {
    fetch(`/api/data-source?dashboard=${dashboard}`)
      .then(r => r.json())
      .then(result => setSynced(result.lastSynced ? formatSynced(result.lastSynced) : "In coming data"))
      .catch(() => setSynced("In coming data"));
  }, [dashboard]);
  return synced;
}
