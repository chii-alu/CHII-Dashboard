"use client";
// Side navigation for a portal. Spans the page height, from the top of the page to where the footer ends.
// Opens when the cursor is over it and closes when the cursor leaves. The arrow pins it open (remembered).
// The expanded panel overlays the page, so the content does not shift.
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { getPortalTheme, type Portal } from "@/theme/portals";
import { PORTAL_NAVS } from "@/config/navigation";

const STORAGE_KEY = "portal-sidebar-pinned";
const EXPANDED = 232;
const COLLAPSED = 64;

// Initials for a nav label: first letter of each word, skipping small connecting words.
const SMALL_WORDS = new Set(["in", "and", "of", "the", "a", "&"]);
export function navInitials(label: string): string {
  return label
    .split(/\s+/)
    .filter(word => word && !SMALL_WORDS.has(word.toLowerCase()))
    .map(word => word[0].toUpperCase())
    .join("");
}

export default function PortalSidebar({ portal }: { portal: Portal }) {
  const pathname = usePathname();
  const config = PORTAL_NAVS[portal];
  const accent = getPortalTheme(portal).brand;
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const open = pinned || hovered;

  // Read the pinned choice after mount so the server and client markup match.
  useEffect(() => {
    try {
      setPinned(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // Storage can be blocked; the sidebar then starts unpinned.
    }
  }, []);

  const togglePin = () => {
    setPinned(p => {
      const next = !p;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // The choice just won't persist.
      }
      return next;
    });
  };

  const activeHref = resolveActiveHref(pathname, config.items.map(i => i.href), config.rootHref);

  return (
    // Stretches to the height of the page row, so it ends where the footer ends.
    <aside
      aria-label={`${config.wordmark} navigation`}
      className="relative self-stretch flex-shrink-0 z-40"
      style={{ width: COLLAPSED }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Stays in view while the page scrolls, within the aside's height. */}
      <div className="sticky top-0" style={{ height: "100%", maxHeight: "100vh" }}>
        <div
          className="absolute top-0 left-0 h-full flex flex-col border-r border-gray-200"
          style={{
            width: open ? EXPANDED : COLLAPSED,
            backgroundColor: "var(--bg-surface)",
            transition: "width 200ms ease, box-shadow 200ms ease",
            boxShadow: open ? "4px 0 16px rgba(0,0,0,0.12)" : "none",
            overflow: "hidden",
          }}
        >
          <div className="flex items-center justify-between gap-2 px-3 h-16 border-b border-gray-200 flex-shrink-0">
            {open && (
              <Link href={config.rootHref} className="flex items-center gap-1.5" style={{ color: accent }}>
                <span className="text-[30px] font-semibold tracking-tight leading-none">{config.wordmark}</span>
                <span className="flex flex-col" style={{ lineHeight: 1.05 }}>
                  {config.wordmarkLines.map(line => (
                    <span key={line} className="text-[9px] font-medium tracking-tight whitespace-nowrap">{line}</span>
                  ))}
                </span>
              </Link>
            )}
            <button
              onClick={togglePin}
              aria-label={pinned ? "Unpin navigation" : "Pin navigation open"}
              aria-pressed={pinned}
              title={pinned ? "Unpin" : "Pin open"}
              className="flex items-center justify-center w-8 h-8 rounded-md border flex-shrink-0 mx-auto"
              style={{ borderColor: "var(--border-default)", color: accent, backgroundColor: "var(--bg-surface)" }}
            >
              {open ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-1">
            {config.items.map(({ label, href }) => {
              const isActive = href === activeHref;
              return (
                <Link
                  key={href}
                  href={href}
                  title={open ? undefined : label}
                  aria-current={isActive ? "page" : undefined}
                  className="flex items-center gap-3 min-h-10 rounded-md px-2 py-1.5 transition-colors"
                  style={{
                    color: isActive ? accent : "var(--text-secondary)",
                    backgroundColor: isActive ? `${accent}14` : "transparent",
                    fontWeight: isActive ? 700 : 600,
                  }}
                >
                  <span
                    className="flex items-center justify-center w-8 h-8 rounded-md flex-shrink-0 text-[11px] font-extrabold"
                    style={{
                      backgroundColor: isActive ? accent : `${accent}1F`,
                      color: isActive ? "#FFFFFF" : accent,
                    }}
                  >
                    {navInitials(label)}
                  </span>
                  {open && <span className="text-[13px] leading-snug whitespace-normal">{label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-gray-200 p-2 flex-shrink-0">
            <Link href="/" title="Sign out" className="flex items-center gap-3 h-10 rounded-md px-2.5 whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
              <LogOut size={16} className="flex-shrink-0" />
              {open && <span className="text-[12px] font-bold uppercase tracking-wide">Logout</span>}
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

/** Longest matching href wins, so nested routes don't light up the root item. */
function resolveActiveHref(pathname: string, hrefs: string[], rootHref: string): string {
  const matches = hrefs
    .filter(href => href !== rootHref && pathname.startsWith(href))
    .sort((a, b) => b.length - a.length);
  return matches[0] ?? rootHref;
}
