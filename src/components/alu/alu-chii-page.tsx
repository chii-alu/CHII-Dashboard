"use client";
// ALU-CHII Executive Dashboard pages. Laid out exactly like the Executive Outreach page:
// header, navigation, KPI cards, section pills with the Filters button, section headers,
// chart panels in pairs, drill-down tables and the footer.
// Values are dummy data (src/config/alu-chii-dummy.ts) until the logs are connected.
import { Children, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  SlidersHorizontal, X, Info, ZoomIn, ZoomOut, Download, RotateCcw,
  Sparkles, ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { AluChartView, BacklogChart, PaceChart, PriorityDumbbell, PriorityPace, RateChart, monthsDone, rateTarget } from "@/components/alu/alu-charts";
import { downloadChart } from "@/lib/download-chart";
import type { ProgressInsight } from "@/lib/progressInsight";
import { FILTER_YEARS } from "@/lib/filter-years";
import { FilterSelect } from "@/components/ui/executive";
import FeaturedImpactStory from "@/components/layout/featured-impact-story";
import ImpactNav from "@/components/layout/portal-nav-executive";
import { MetadataHeader } from "@/components/MetadataHeader";
import StatsKpiCard from "@/components/ui/stat-kpi-card";
import { DATA_SOURCE } from "@/config/data-sources";
import { createClient } from "@/lib/supabase-client";
import { dashboardsFor, isRole, type Role } from "@/lib/access";
import { PORTAL_NAVS } from "@/config/navigation";
import {
  dummyCell, dummyKpi, DUMMY_HIGHLIGHTS, GALLERY_EVENTS,
} from "@/config/alu-chii-dummy";
import {
  ALU_TITLE, OVERVIEW_KPIS, SECTIONS,
  type AluSection, type AluTab, type AluChart, type AluTable,
} from "@/config/alu-chii";

/* ── palette (same as the Executive Outreach page) ───── */
const NAVY = "var(--brand-secondary)";
const BAND = "var(--brand-secondary)";
const TICK = "#D17A86";

type Filters = { year: string };

// Same general-filter logic as the Executive dashboard: "all" means every year, and the header period follows the year chosen.
const DEFAULT_FILTERS: Filters = { year: "all" };

/* ════════════════════════════════════════════════════════
   Shared UI
═══════════════════════════════════════════════════════ */

/** Section header as on Outreach: a small tick, the title, and a one-line description. */
function SectionHeader({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 2 }}>
      <span style={{ width: 4, height: 16, borderRadius: 999, backgroundColor: TICK, flexShrink: 0, alignSelf: "center" }} />
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 800, color: NAVY, letterSpacing: "0.01em" }}>{title}</h2>
        <p style={{ fontSize: 11, color: "#6B7280", marginTop: 1 }}>{blurb}</p>
      </div>
    </div>
  );
}

/** Chart and table panel, as on Outreach: navy band, pink tick, info tooltip, click to download. */
function Panel({ title, subtitle, info, children }: { title: string; subtitle: string; info?: string; children: React.ReactNode }) {
  const [tip, setTip] = useState(false);
  return (
    <div style={{ height: "100%", backgroundColor: "var(--bg-surface)", borderRadius: 10, border: "1px solid rgba(0,33,71,0.08)", overflow: "hidden" }}>
      <div style={{ backgroundColor: BAND, padding: "10px 18px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 3, height: 15, borderRadius: 999, backgroundColor: TICK, flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "white", lineHeight: 1.2 }}>{title}</p>
            {info && (
              <span style={{ position: "relative", display: "flex", cursor: "pointer" }}
                onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}>
                <Info size={11} color="rgba(181,212,244,0.85)" />
                {tip && (
                  <span style={{ position: "absolute", top: "calc(100% + 7px)", left: "50%", transform: "translateX(-50%)", backgroundColor: "white", color: "var(--brand-secondary)", fontSize: 10.5, fontWeight: 400, textTransform: "none", letterSpacing: 0, lineHeight: 1.5, padding: "8px 11px", borderRadius: 7, width: 210, boxShadow: "0 4px 12px rgba(0,0,0,0.12)", border: "1px solid #E0ECFF", zIndex: 100, textAlign: "left", pointerEvents: "none" }}>
                    {info}
                  </span>
                )}
              </span>
            )}
          </div>
          <p style={{ fontSize: 9.5, color: "rgba(181,212,244,0.7)", marginTop: 1 }}>{subtitle}</p>
        </div>
      </div>
      <div style={{ padding: "16px 18px 18px", cursor: "pointer" }}
        onClick={(e) => downloadChart(e.currentTarget, title)}
        title="Click to download as PNG">
        {children}
      </div>
    </div>
  );
}

/** Two panels to a row on desktop, one on mobile. A panel with no partner in its row spans the full width. */
function PanelGrid({ children }: { children: React.ReactNode }) {
  const items = Children.toArray(children);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
      {items.map((child, i) => (
        <div key={i} className={items.length % 2 === 1 && i === items.length - 1 ? "md:col-span-2" : undefined}>
          {child}
        </div>
      ))}
    </div>
  );
}

/** The Executive "Filters" button and popover, shared by every ALU-CHII page. */
function FiltersMenu({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const [open, setOpen] = useState(false);
  const activeCount = (Object.keys(DEFAULT_FILTERS) as (keyof Filters)[]).filter(k => filters[k] !== DEFAULT_FILTERS[k]).length;
  const set = (key: keyof Filters) => (v: string) => onChange({ ...filters, [key]: v });
  const yearOpts = [{ value: "all", label: "All Years" }, ...FILTER_YEARS.map(y => ({ value: String(y), label: String(y) }))];

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, padding: "7px 13px", borderRadius: 999, cursor: "pointer",
          border: `1px solid ${activeCount || open ? NAVY : "rgba(0,33,71,0.15)"}`,
          backgroundColor: open ? NAVY : "var(--bg-surface)", color: open ? "white" : "#374151" }}
      >
        <SlidersHorizontal size={13} />
        Filters
        {activeCount > 0 && (
          <span style={{ fontSize: 9.5, fontWeight: 800, color: "white", backgroundColor: open ? "rgba(255,255,255,0.25)" : "#102C5E", borderRadius: 999, minWidth: 16, height: 16, padding: "0 4px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{activeCount}</span>
        )}
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 50, width: 320, backgroundColor: "var(--bg-surface)", borderRadius: 10, border: "1px solid rgba(0,33,71,0.12)", boxShadow: "0 10px 30px rgba(0,0,0,0.14)", overflow: "hidden" }}>
          <div style={{ backgroundColor: BAND, padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "white", textTransform: "uppercase", letterSpacing: "0.04em" }}>Filters</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {activeCount > 0 && (
                <button type="button" onClick={() => onChange(DEFAULT_FILTERS)} style={{ fontSize: 10, fontWeight: 600, color: "white", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 6, padding: "3px 8px", backgroundColor: "rgba(255,255,255,0.08)", cursor: "pointer" }}>Reset</button>
              )}
              <button type="button" onClick={() => setOpen(false)} title="Close" style={{ color: "white", display: "flex", cursor: "pointer", background: "none", border: "none", padding: 0 }}><X size={13} /></button>
            </div>
          </div>
          <div style={{ padding: "12px 14px", display: "grid", gridTemplateColumns: "200px", gap: 10 }}>
            <FilterSelect label="Year" value={filters.year} onChange={set("year")} options={yearOpts} />
          </div>
        </div>
      )}
    </div>
  );
}

/** The header period follows the Year filter, as on the Executive dashboard. */
function periodOf(f: Filters): string {
  return f.year === "all" ? "2026–2030" : f.year;
}

/** Page frame: navigation, header, then the content and footer in the Outreach wrapper. */
function Frame({ title, subtitle, period, children }: { title: string; subtitle: string; period: string; children: React.ReactNode }) {
  // The Portals switcher is for executive users only; anyone else (including visitors) doesn't see it.
  const [role, setRole] = useState<Role | null>(null);
  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      if (active && isRole(data?.role)) setRole(data.role);
    })();
    return () => { active = false; };
  }, []);
  const showPortals = dashboardsFor(role).includes("EXEC");

  return (
    <div style={{ backgroundColor: "var(--bg-page)", minHeight: "100vh" }}>
      <ImpactNav tabs={PORTAL_NAVS.alu.items} logoHref="/alu-chii/at-a-glance" showPortals={showPortals} />
      <MetadataHeader
        title={title}
        subtitle={subtitle}
        dataSource={DATA_SOURCE.alu}
        lastUpdated="Not yet updated"
        period={period}
      />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-7 space-y-10">
        {children}
        <FeaturedImpactStory footer dataSynced="Not yet updated" dataSource={DATA_SOURCE.alu} period={period} />
      </div>
    </div>
  );
}

/** A rate is read against its target line; a running total against where it should be by now. */
function kpiProgress(label: string, d: ReturnType<typeof dummyKpi>, year: string): ProgressInsight {
  if (d.unit === "percent") {
    const target = rateTarget(label);
    const gap = target - d.num;
    return { barPct: d.num, caption: gap > 0 ? `Target ${target}% · ${gap} pts below` : `Target ${target}% · met`, status: gap <= 0 ? "met" : gap <= 10 ? "close" : "behind" };
  }
  const expected = Math.round((d.target * monthsDone(year)) / 12);
  const ratio = d.num / expected;
  return {
    barPct: Math.min(100, (d.num / d.target) * 100),
    caption: `${ratio >= 1 ? "Ahead of pace" : "Behind pace"} · ${d.display(expected)} expected by now`,
    status: ratio >= 1 ? "met" : ratio >= 0.9 ? "close" : "behind",
  };
}

/** The KPI cards, in the same grid as Outreach. */
function KpiRow({ kpis, year }: { kpis: { label: string; definition: string; sub: string; icon: any }[]; year: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))", gap: 12 }}>
      {kpis.map(k => {
        const d = dummyKpi(k.label, k.definition, year);
        return (
          <StatsKpiCard
            key={k.label}
            label={k.label}
            num={d.num}
            displayFmt={d.display}
            progress={kpiProgress(k.label, d, year)}
            sub={k.sub}
            Icon={k.icon}
            tooltip={k.definition}
          />
        );
      })}
    </div>
  );
}

function ChartGrid({ charts, year }: { charts: AluChart[]; year: string }) {
  return (
    <PanelGrid>
      {charts.map(c => (
        <Panel key={c.title} title={c.title} subtitle={c.sub} info={c.info}>
          <AluChartView title={c.title} sub={c.sub} year={year} />
        </Panel>
      ))}
    </PanelGrid>
  );
}

function DrillDown({ tables, year }: { tables: AluTable[]; year: string }) {
  if (tables.length === 0) return null;
  return (
    <section className="space-y-4">
      <SectionHeader title="Drill-down" blurb="Each item behind the numbers, with a link to its evidence." />
      <PanelGrid>
        {tables.map(t => (
          <Panel key={t.title} title={t.title} subtitle={t.sub}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    {t.columns.map(col => (
                      <th key={col} style={{ textAlign: "left", padding: "8px 10px", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", borderBottom: "1px solid var(--border-default)", whiteSpace: "nowrap" }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[0, 1, 2, 3].map(row => (
                    <tr key={row} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      {t.columns.map(col => (
                        <td key={col} style={{ padding: "8px 10px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                          {dummyCell(t, col, row, year)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        ))}
      </PanelGrid>
    </section>
  );
}

/** Section pills, the same style as Outreach. Used for the tabs of a section and for the overview panels. */
function Pills<K extends string>({ items, active, onChange }: { items: { key: K; label: string }[]; active: K; onChange: (k: K) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {items.map(t => {
        const on = t.key === active;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            style={{
              fontSize: 11.5, fontWeight: 700, padding: "7px 13px", borderRadius: 999, cursor: "pointer",
              border: `1px solid ${on ? NAVY : "rgba(0,33,71,0.15)"}`,
              backgroundColor: on ? NAVY : "var(--bg-surface)", color: on ? "white" : "#6B7280",
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/** The row of section pills on the left and the Filters button on the right, as on Outreach. */
function PillRow({ children, filters, onFilters }: { children: React.ReactNode; filters: Filters; onFilters: (f: Filters) => void }) {
  return (
    <div className="flex flex-wrap lg:flex-nowrap items-center justify-between" style={{ gap: 10 }}>
      <div className="min-w-0">{children}</div>
      <FiltersMenu filters={filters} onChange={onFilters} />
    </div>
  );
}

/** One of the five section pages (with tabs where the section has more than one). */
export function AluSectionPage({ slug }: { slug: string }) {
  const section: AluSection = SECTIONS[slug];
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [tabKey, setTabKey] = useState(section.tabs[0].key);
  const tab = section.tabs.find(t => t.key === tabKey) ?? section.tabs[0];
  // Section pills within a tab (as on Outreach): each one shows its own charts and tables.
  const groups = tab.groups ?? [];
  const [groupKey, setGroupKey] = useState(groups[0]?.key ?? "");
  // A group chosen on another tab falls back to this tab's first group.
  const group = groups.find(g => g.key === groupKey) ?? groups[0];
  const charts = group ? tab.charts.filter(c => c.group === group.key) : tab.charts;
  const tables = group ? tab.tables.filter(t => t.group === group.key) : tab.tables;

  return (
    <Frame title={section.title} subtitle={section.question} period={periodOf(filters)}>
      <section className="space-y-4">
        {section.owner && <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Data owner: {section.owner}</p>}
        <KpiRow kpis={tab.kpis} year={filters.year} />
        <PillRow filters={filters} onFilters={setFilters}>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            {section.tabs.length > 1 && (
              <Pills items={section.tabs.map(t => ({ key: t.key, label: t.label }))} active={tab.key} onChange={setTabKey} />
            )}
            {section.tabs.length > 1 && groups.length > 0 && (
              <span aria-hidden="true" style={{ width: 1, height: 22, backgroundColor: "rgba(0,33,71,0.15)", margin: "0 4px" }} />
            )}
            {groups.length > 0 && (
              <Pills items={groups.map(g => ({ key: g.key, label: g.label }))} active={group?.key ?? ""} onChange={setGroupKey} />
            )}
          </div>
        </PillRow>
      </section>

      <section className="space-y-4">
        <SectionHeader title={group?.label ?? tab.label} blurb={group?.blurb ?? "How the numbers are moving, and where they sit against the target."} />
        <ChartGrid charts={charts} year={filters.year} />
      </section>

      <DrillDown tables={tables} year={filters.year} />
    </Frame>
  );
}


/** This quarter's achievements as cards, each with a link to its evidence. */
function Highlights() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 12 }}>
      {DUMMY_HIGHLIGHTS.map((h, i) => (
        <div key={h} style={{ display: "flex", flexDirection: "column", gap: 10, padding: 14, borderRadius: 10, border: "1px solid rgba(0,33,71,0.10)", backgroundColor: "var(--bg-surface)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: "rgba(71,155,214,0.12)", color: "#0C447C", display: "grid", placeItems: "center" }}>
              <Sparkles size={15} />
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#6B7280" }}>#{i + 1}</span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4 }}>{h}</p>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#0C447C", marginTop: "auto" }}>
            View evidence <ArrowUpRight size={12} />
          </span>
        </div>
      ))}
    </div>
  );
}

// The overview's charts, by navigation page. Each metric uses the chart that suits its kind:
// pace (running total), rate (level against a target line), backlog (by age), or a named chart from that page.
type GlanceItem = string | { kind: "pace" | "rate" | "backlog"; label: string };
const GLANCE_AREAS: { title: string; href: string; blurb: string; items: GlanceItem[] }[] = [
  { title: "Talent", href: "/alu-chii/talent", blurb: "What capability we have built, and the people behind it.", items: ["Capability Timeline", "Professional Development by Type", "Research Staff Capacity"] },
  { title: "Partnerships", href: "/alu-chii/partnerships", blurb: "Whether partners are moving from identified to activated.", items: [{ kind: "pace", label: "Partnerships Activated" }, { kind: "backlog", label: "Partnerships awaiting executive engagement" }, "Partnership Funnel"] },
  { title: "Institutional Excellence", href: "/alu-chii/operations", blurb: "How well we deliver, and the risks we are carrying.", items: [{ kind: "rate", label: "Projects on Track" }, { kind: "rate", label: "SOP Compliance" }, "Risk Heat Map", { kind: "backlog", label: "Overdue donor reports" }, { kind: "backlog", label: "High risks without a mitigation" }, "Project Delivery Status"] },
  { title: "Resource Mobilisation", href: "/alu-chii/operations", blurb: "How much is secured, how much is promised, and the size of the gap.", items: ["Funding vs Target", "Funding Secured over Time", "Funding Pipeline by Stage"] },
  { title: "Health Systems Impact", href: "/alu-chii/health-systems", blurb: "What is changing in health systems, and for whom.", items: [{ kind: "pace", label: "People Reached" }, "Beneficiaries by Pillar and Year", "Reach by Country"] },
  { title: "Research & Knowledge", href: "/alu-chii/research", blurb: "What research we are producing, and how it is funded.", items: [{ kind: "pace", label: "Research Outputs" }, "Grant Pipeline", "Research Pipeline"] },
  { title: "External Recognition", href: "/alu-chii/recognition", blurb: "How visible CHII is, and who it reaches.", items: [{ kind: "pace", label: "Strategic Visibility" }, "Audience Reached over Time", "Delegate"] },
];

const ATTENTION_ITEMS = ["Projects behind schedule", "Overdue donor reports", "High risks without a mitigation", "Partnerships awaiting executive engagement", "SOP compliance under 80%"];
const ALL_CHARTS = Object.values(SECTIONS).flatMap(section => section.tabs.flatMap(tab => tab.charts));
const ALL_KPIS = [...OVERVIEW_KPIS, ...Object.values(SECTIONS).flatMap(section => section.tabs.flatMap(tab => tab.kpis))];

function GlancePanel({ item, year }: { item: GlanceItem; year: string }) {
  if (typeof item === "string") {
    const chart = ALL_CHARTS.find(c => c.title === item);
    if (!chart) return null;
    return <Panel title={chart.title} subtitle={chart.sub} info={chart.info}><AluChartView title={chart.title} sub={chart.sub} year={year} /></Panel>;
  }
  if (item.kind === "backlog") {
    return <Panel title={item.label} subtitle="Open items, by how long they have waited"><BacklogChart item={item.label} year={year} /></Panel>;
  }
  const kpi = ALL_KPIS.find(k => k.label === item.label);
  if (!kpi) return null;
  const d = dummyKpi(kpi.label, kpi.definition, year);
  return item.kind === "rate"
    ? <Panel title={kpi.label} subtitle="Month by month, against the target line" info={kpi.definition}><RateChart label={kpi.label} value={d.num} year={year} /></Panel>
    : <Panel title={kpi.label} subtitle="Running total against the path to the annual target" info={kpi.definition}><PaceChart label={kpi.label} value={d.num} target={d.target} year={year} format={d.display} /></Panel>;
}

// One pill per section, as on Outreach: priorities first, then each navigation page, then highlights.
const OVERVIEW_SECTIONS = [
  { key: "priorities", label: "Priorities" },
  ...GLANCE_AREAS.map(a => ({ key: a.title, label: a.title === "Resource Mobilisation" ? "Resources" : a.title })),
  { key: "highlights", label: "Highlights" },
];

/** Panels in the Outreach rhythm: two side by side, then one across the full width. */
function SectionRows({ items, year }: { items: GlanceItem[]; year: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
      {items.map((item, i) => (
        <div key={typeof item === "string" ? item : item.label} className={i % 3 === 2 ? "md:col-span-2" : undefined}>
          <GlancePanel item={item} year={year} />
        </div>
      ))}
    </div>
  );
}

/** CHII Overview: the headline cards, then one section at a time, chosen with the pills as on Outreach. */
export function AluOverviewPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [active, setActive] = useState("priorities");
  const area = GLANCE_AREAS.find(a => a.title === active);

  return (
    <Frame title={ALU_TITLE} subtitle="Are we on track this year, and where do we need to step in?" period={periodOf(filters)}>
      <section className="space-y-4">
        <KpiRow kpis={OVERVIEW_KPIS} year={filters.year} />
        <PillRow filters={filters} onFilters={setFilters}>
          <Pills items={OVERVIEW_SECTIONS} active={active} onChange={setActive} />
        </PillRow>
      </section>

      {active === "priorities" && (
        <>
          <section className="space-y-4">
            <SectionHeader title="Strategic Priorities" blurb="Where each priority is today, where it will finish, and the status that earns." />
            <Panel title="Today to Year-End" subtitle="Each priority's % of annual target, now and projected to 31 December">
              <PriorityDumbbell year={filters.year} />
            </Panel>
            <PriorityPace year={filters.year} />
          </section>
          <section className="space-y-4">
            <SectionHeader title="Needs Attention" blurb="Items that need executive action. Each backlog has its own scale, and a growing dark band means old items are piling up." />
            <SectionRows items={ATTENTION_ITEMS.map(label => ({ kind: "backlog" as const, label }))} year={filters.year} />
          </section>
          <section className="space-y-4">
            <SectionHeader title="Quarterly Trend" blurb="How the headline numbers are moving, quarter by quarter." />
            <Panel title="Quarterly Trend" subtitle="Headline KPIs by quarter, this year vs last">
              <AluChartView title="Quarterly Trend" sub="Headline KPIs by quarter" year={filters.year} />
            </Panel>
          </section>
        </>
      )}

      {area && (
        <section className="space-y-4">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <SectionHeader title={area.title} blurb={area.blurb} />
            <Link href={area.href} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 700, color: "#0C447C", textDecoration: "none", flexShrink: 0 }}>
              View page <ArrowUpRight size={13} />
            </Link>
          </div>
          <SectionRows items={area.items} year={filters.year} />
        </section>
      )}

      {active === "highlights" && (
        <section className="space-y-4">
          <SectionHeader title="Highlights" blurb="Three to five achievements this quarter, each linked to its evidence." />
          <Panel title="Highlights" subtitle="Three to five achievements, each linked to its evidence">
            <Highlights />
          </Panel>
        </section>
      )}
    </Frame>
  );
}

const DUMMY_COLOURS = [["#102C5E", "#479BD6"], ["#0D9488", "#A6C13C"], ["#7C3AED", "#D17A86"], ["#D45F2C", "#E0A458"]] as const;

/** A generated stand-in image for an event until its photos are shared. It is labelled as a dummy. */
export function dummyImage(title: string, index: number): string {
  const [a, b] = DUMMY_COLOURS[index % DUMMY_COLOURS.length];
  const label = title.replace(/[&<>"']/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="240" viewBox="0 0 640 240">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
<rect width="640" height="240" fill="url(#g)"/>
<polygon points="0,220 150,40 220,40 70,240 0,240" fill="rgba(255,255,255,0.10)"/>
<polygon points="440,0 640,0 640,120 540,0" fill="rgba(255,255,255,0.10)"/>
<text x="320" y="150" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="700" fill="white">${label}</text>
<text x="320" y="182" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="15" fill="rgba(255,255,255,0.85)">Dummy image</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Full-screen view of one image: zoom in and out, reset, download and close. Escape closes it. */
export function ImageViewer({ src, title, date, onClose }: { src: string; title: string; date: string; onClose: () => void }) {
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const btn: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "white",
    background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 8,
    padding: "7px 11px", cursor: "pointer",
  };
  return (
    <div role="dialog" aria-modal="true" aria-label={title}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 1000, backgroundColor: "rgba(15,23,42,0.96)", display: "flex", flexDirection: "column" }}>
      <div onClick={e => e.stopPropagation()} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", padding: "12px 16px" }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{title}</p>
          <p style={{ fontSize: 11, color: "rgba(181,212,244,0.8)", marginTop: 2 }}>{date}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button type="button" style={btn} onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} title="Zoom out" aria-label="Zoom out"><ZoomOut size={14} /></button>
          <span style={{ fontSize: 12, color: "white", minWidth: 44, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
          <button type="button" style={btn} onClick={() => setZoom(z => Math.min(4, z + 0.25))} title="Zoom in" aria-label="Zoom in"><ZoomIn size={14} /></button>
          <button type="button" style={btn} onClick={() => setZoom(1)} title="Reset zoom" aria-label="Reset zoom"><RotateCcw size={14} /></button>
          <a href={src} download={`${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.svg`} style={{ ...btn, textDecoration: "none" }} title="Download image">
            <Download size={14} /> Download
          </a>
          <button type="button" style={btn} onClick={onClose} title="Close" aria-label="Close"><X size={14} /></button>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: "auto", display: "flex", padding: 16 }}>
        <div style={{ margin: "auto", transform: `scale(${zoom})`, transformOrigin: "center", transition: "transform .15s" }}>
          <img src={src} alt={title} onClick={e => e.stopPropagation()}
            style={{ display: "block", maxWidth: "min(92vw, 1100px)", height: "auto", borderRadius: 8, background: "white" }} />
        </div>
      </div>
    </div>
  );
}

/** One event in the gallery: its name and details, and a dummy image until the photos are shared. Click the image to open it. */
export function EventCard({ title, date, location, type, index, onOpen }: { title: string; date: string; location: string; type: string; index: number; onOpen: () => void }) {
  return (
    <div style={{ backgroundColor: "var(--bg-surface)", borderRadius: 10, border: "1px solid rgba(0,33,71,0.08)", overflow: "hidden" }}>
      <div style={{ backgroundColor: BAND, padding: "10px 18px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 3, height: 15, borderRadius: 999, backgroundColor: TICK, flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "white", lineHeight: 1.2 }}>{title}</p>
          <p style={{ fontSize: 9.5, color: "rgba(181,212,244,0.7)", marginTop: 1 }}>{date} · {location}</p>
        </div>
      </div>
      <button type="button" onClick={onOpen} title="View larger" aria-label={`View ${title} larger`}
        style={{ display: "block", width: "100%", padding: 0, border: "none", cursor: "zoom-in", background: "none" }}>
        <img src={dummyImage(title, index)} alt={`${title} (dummy image)`} style={{ display: "block", width: "100%", height: 180, objectFit: "cover" }} />
      </button>
      <div style={{ padding: "10px 18px 12px" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: NAVY }}>{type}</span>
      </div>
    </div>
  );
}

/** Gallery of ALU-CHII events. The Year filter and the event-type pills choose which events show. */
export function AluGalleryPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [type, setType] = useState("All");
  const types = ["All", ...Array.from(new Set(GALLERY_EVENTS.map(e => e.type)))];
  const events = GALLERY_EVENTS.filter(e =>
    (filters.year === "all" || String(e.year) === filters.year) && (type === "All" || e.type === type)
  );
  const [viewing, setViewing] = useState<number | null>(null);
  const closeViewer = useCallback(() => setViewing(null), []);
  const viewed = viewing === null ? null : events[viewing] ?? null;

  return (
    <Frame title="Event Gallery" subtitle="Moments from ALU-CHII events, workshops and partner meetings" period={periodOf(filters)}>
      <section className="space-y-4">
        <PillRow filters={filters} onFilters={setFilters}>
          <Pills items={types.map(t => ({ key: t, label: t }))} active={type} onChange={setType} />
        </PillRow>
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="Events"
          blurb={`${events.length} ${events.length === 1 ? "event" : "events"}${filters.year === "all" ? "" : ` in ${filters.year}`}.`}
        />
        {events.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No events match these filters.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 16 }}>
            {events.map((e, i) => <EventCard key={e.title} title={e.title} date={e.date} location={e.location} type={e.type} index={i} onOpen={() => setViewing(i)} />)}
          </div>
        )}
      </section>
      {viewed && viewing !== null && createPortal(
        <ImageViewer src={dummyImage(viewed.title, viewing)} title={viewed.title} date={`${viewed.date} · ${viewed.location}`} onClose={closeViewer} />,
        document.body
      )}
    </Frame>
  );
}
