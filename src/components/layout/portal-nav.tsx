"use client";
// One nav for every portal. Replaces HENTNav / HEMPNav / HECONav, which were
// identical apart from their colour, wordmark and nav items.

import { downloadDashboard } from "@/lib/download-dashboard";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Download, LayoutGrid, LogOut, Menu, X } from "lucide-react";
import { getPortalTheme, type Portal } from "@/theme/portals";
import { PORTAL_NAVS } from "@/config/navigation";
import { signOutToSignIn } from "@/lib/sign-out";
import { createClient } from "@/lib/supabase-client";
import { dashboardsFor, isRole, type DashboardCode, type Role } from "@/lib/access";

// Every portal the Portals switcher can open. Each user sees only the ones their role allows.
const SWITCH_TO: { portal: Portal; code: DashboardCode; label: string; desc: string }[] = [
  { portal: "executive", code: "EXEC", label: "Executive", desc: "Executive Dashboard" },
  { portal: "hent", code: "HENT", label: "HENT", desc: "Entrepreneurship Pillar" },
  { portal: "hemp", code: "HEMP", label: "Health Missions & HEMP", desc: "Employment Pillar" },
  { portal: "heco", code: "HECO", label: "HECO", desc: "Ecosystems Pillar" },
];

export default function PortalNav({ portal }: { portal: Portal }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [switchOpen, setSwitchOpen] = useState(false);
  const switchRef = useRef<HTMLDivElement>(null);

  const theme = getPortalTheme(portal);
  const config = PORTAL_NAVS[portal];
  const accent = portal === "hent" ? theme.deep : theme.brand;
  // HEMP's tab labels match the executive dashboard's navy exactly.
  const tabAccent = portal === "hemp" ? "#042C53" : accent;
  const activeHref = resolveActiveHref(pathname, config.items.map(i => i.href), config.rootHref);

  // Route changes should close any open mobile menu.
  useEffect(() => {
    setMenuOpen(false);
    setSwitchOpen(false);
  }, [pathname]);

  // Read the signed-in user's role, to decide which portals the switcher offers.
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

  const switchChoices = SWITCH_TO.filter(c => c.portal !== portal && dashboardsFor(role).includes(c.code));

  return (
    <div data-export-ignore className="border-b border-gray-200 sticky top-0 z-50" style={{ backgroundColor: "var(--bg-surface)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 flex items-center h-16 gap-2 sm:gap-3">

        {/* Wordmark */}
        <Link href={config.rootHref} className="flex items-center gap-2.5 flex-shrink-0 group">
          {portal === "hemp" ? (
            <span className="flex flex-col gap-0.5" style={{ color: accent }}>
              <span className="flex items-center gap-1">
                <span className="text-[22px] font-semibold tracking-tight leading-none">HM</span>
                <span className="flex flex-col" style={{ lineHeight: 1.05 }}>
                  <span className="text-[7px] font-medium tracking-tight whitespace-nowrap">HEALTH</span>
                  <span className="text-[7px] font-medium tracking-tight whitespace-nowrap">MISSIONS</span>
                </span>
              </span>
              <span className="flex items-center gap-1">
                <span className="text-[22px] font-semibold tracking-tight leading-none">HEMP</span>
                <span className="flex flex-col" style={{ lineHeight: 1.05 }}>
                  <span className="text-[7px] font-medium tracking-tight whitespace-nowrap">HEALTH</span>
                  <span className="text-[7px] font-medium tracking-tight whitespace-nowrap">EMPLOYMENT</span>
                </span>
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5" style={{ color: accent }}>
              <span className="text-[30px] font-semibold tracking-tight leading-none">{config.wordmark}</span>
              <span className="flex flex-col" style={{ lineHeight: 1.05 }}>
                {config.wordmarkLines.map(line => (
                  <span key={line} className="text-[9px] font-medium tracking-tight whitespace-nowrap">{line}</span>
                ))}
              </span>
            </span>
          )}
        </Link>

        <div className="h-6 w-px bg-gray-200 flex-shrink-0" />

        {/* Tabs — full row once there's room for the longest portal's items, collapses to a hamburger menu below */}
        <nav className="hidden xl:flex items-stretch justify-center flex-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {config.items.map(({ label, href }) => {
            const isActive = href === activeHref;
            return (
              <Link
                key={href}
                href={href}
                className="relative flex flex-col items-center justify-center px-2 h-16 transition-colors group flex-shrink-0"
                style={{ color: isActive ? tabAccent : `${tabAccent}80` }}
              >
                {!isActive && (
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: "var(--bg-surface-raised)" }} />
                )}
                <span className="relative text-[11px] font-bold leading-tight whitespace-nowrap">{label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2.5px] rounded-t-full" style={{ backgroundColor: tabAccent }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
          <button
            onClick={() => setMenuOpen(open => !open)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            className="xl:hidden flex items-center justify-center w-8 h-8 rounded-md border transition-colors flex-shrink-0"
            style={{ borderColor: "var(--border-default)", color: accent, backgroundColor: "var(--bg-surface)" }}
          >
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

          {switchChoices.length > 0 && (
            <div className="relative flex-shrink-0" ref={switchRef}>
              <button
                onClick={() => setSwitchOpen(v => !v)}
                className="hidden sm:flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border font-medium transition-colors"
                style={{ borderColor: "var(--border-default)", color: "var(--text-muted)", backgroundColor: "var(--bg-surface)" }}
              >
                <LayoutGrid size={10} />
                Portals
                <ChevronDown size={9} style={{ transform: switchOpen ? "rotate(180deg)" : "none" }} />
              </button>
              {switchOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden z-50">
                  <div className="px-3 py-2 border-b border-gray-50">
                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-gray-400">Switch Portal</p>
                  </div>
                  {switchChoices.map(c => (
                    <Link key={c.code} href={PORTAL_NAVS[c.portal].rootHref} onClick={() => setSwitchOpen(false)}
                      className="flex items-center px-3 py-2.5 hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="text-[12px] font-bold text-gray-900 leading-none">{c.label}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{c.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            title="Download this dashboard as PNG"
            onClick={() => downloadDashboard(document.title || "dashboard")}
            className="hidden sm:flex items-center justify-center w-7 h-7 rounded-md border transition-colors flex-shrink-0"
            style={{ borderColor: "var(--border-default)", color: "var(--text-muted)", backgroundColor: "var(--bg-surface)" }}
          >
            <Download size={12} />
          </button>

          <Link
            href="/sign-in"
            title="Sign out"
            onClick={e => { e.preventDefault(); signOutToSignIn(); }}
            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border font-bold uppercase tracking-wide transition-colors flex-shrink-0"
            style={{ borderColor: "var(--border-default)", color: "var(--text-muted)", backgroundColor: "var(--bg-surface)" }}
          >
            <LogOut size={10} />
            <span className="hidden sm:inline">Logout</span>
          </Link>
        </div>
      </div>

      {/* Mobile/tablet menu — mirrors the desktop tabs as a vertical list */}
      {menuOpen && (
        <nav className="xl:hidden border-t border-gray-200 px-3 py-2 flex flex-col max-h-[calc(100vh-4rem)] overflow-y-auto" style={{ backgroundColor: "var(--bg-surface)" }}>
          {config.items.map(({ label, href }) => {
            const isActive = href === activeHref;
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center px-3 py-3 rounded-md text-[13px] font-bold transition-colors"
                style={{
                  color: isActive ? tabAccent : "var(--text-secondary)",
                  backgroundColor: isActive ? `${tabAccent}14` : "transparent",
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}

/** Longest matching href wins, so nested routes don't light up the root tab. */
function resolveActiveHref(pathname: string, hrefs: string[], rootHref: string): string {
  const matches = hrefs
    .filter(href => href !== rootHref && pathname.startsWith(href))
    .sort((a, b) => b.length - a.length);
  return matches[0] ?? rootHref;
}
