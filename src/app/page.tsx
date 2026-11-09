"use client";
import Link from "next/link";
import { useState } from "react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: "600", display: "swap" });

// Where the Program Manager button goes. Left empty until its address is ready.
const INTERVENTION_MANAGER_HREF: string | null = null;

// Same palette and layout as the sign-in page.
const PRIMARY = "#14306B";
const HOVER = "#0B2145";
const BORDER = "#E3E0DA";
const TEXT = "#172B4D";
const SECONDARY = "#5E6C84";

const BUTTON_BASE: React.CSSProperties = {
  height: 40,
  width: "100%",
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "0.01em",
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  transition: "background .15s, transform .15s, box-shadow .15s",
};

export default function ChooserPage() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "white" }}>
      <div
        className="w-full flex flex-col lg:flex-row overflow-hidden"
        style={{
          maxWidth: "55rem",
          maxHeight: "620px",
          borderRadius: 14,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 8px 32px rgba(20,48,107,0.10), 0 1px 2px rgba(0,0,0,0.02)",
          background: "white",
        }}
      >
        {/* ══ LEFT: choices ══════════════════════════════════════════ */}
        <div className="relative w-full lg:w-[50%] flex flex-col px-11 py-8 justify-center">
          <div style={{ maxWidth: "19rem", width: "100%", margin: "0 auto" }}>
            <h1 className={playfair.className} style={{ fontSize: 34, fontWeight: 600, color: TEXT, lineHeight: 1.05, letterSpacing: "-0.015em", marginBottom: 6 }}>
              Welcome
            </h1>
            <p style={{ fontSize: 14, color: SECONDARY, marginTop: 8, lineHeight: 1.5, marginBottom: 0, fontWeight: 400 }}>
              Choose where you want to go
            </p>

            <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
              <Link
                href="/sign-in"
                onMouseEnter={() => setHovered("dashboard")}
                onMouseLeave={() => setHovered(null)}
                style={{
                  ...BUTTON_BASE,
                  color: "white",
                  background: hovered === "dashboard" ? HOVER : PRIMARY,
                  transform: hovered === "dashboard" ? "translateY(-0.5px)" : "none",
                  boxShadow: hovered === "dashboard" ? "0 4px 12px rgba(20,48,107,0.18)" : "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                Dashboard
              </Link>

              {INTERVENTION_MANAGER_HREF ? (
                <a
                  href={INTERVENTION_MANAGER_HREF}
                  onMouseEnter={() => setHovered("manager")}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    ...BUTTON_BASE,
                    color: PRIMARY,
                    background: hovered === "manager" ? "#F3F7FF" : "white",
                    border: `1px solid #D5D8E0`,
                  }}
                >
                  Program Manager
                </a>
              ) : (
                <div
                  aria-disabled="true"
                  style={{
                    ...BUTTON_BASE,
                    color: PRIMARY,
                    background: "white",
                    border: `1px solid #D5D8E0`,
                    opacity: 0.6,
                    cursor: "default",
                  }}
                >
                  Program Manager
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══ RIGHT: brand panel ═════════════════════════════════════ */}
        <div
          className="relative w-full lg:w-[50%] flex flex-col items-center justify-between overflow-hidden px-12 py-10"
          style={{ background: "#102C5E" }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, margin: "auto 0" }}>
            <img
              src="/logos/CHII-Logo.png"
              alt="Centre for Health Innovation and Impact"
              style={{ height: 48, width: "auto", objectFit: "contain", display: "block" }}
            />
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0 }}>
            © 2026 CHII · African Leadership University
          </p>
        </div>

      </div>
    </div>
  );
}
