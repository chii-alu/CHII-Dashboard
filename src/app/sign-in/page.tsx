"use client";
import { useRouter } from "next/navigation";
import { Playfair_Display } from "next/font/google";
import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase-client";
import HeaderDesign from "@/components/layout/header-design";
import { isRole, type Role } from "@/lib/access";
import { LANDING, PORTAL_NAME, ALU_CHII_LANDING } from "@/lib/landing";
import { DEMO_ACCOUNTS, DEMO_PASSWORD, validateEmail, validatePassword } from "@/lib/auth-rules";
import {
  ChevronDown, ArrowRight, FlaskConical, Check, Loader2,
  BarChart3, TrendingUp, Zap, FileText,
} from "lucide-react";


// ─── Palette ─────────────────────────────────────────────────────────────────
const PRIMARY   = "#14306B"; // buttons, focus (Executive KPI navy)
const HOVER     = "#0B2145";
const BORDER    = "#E3E0DA"; // warm neutral grey
const TEXT      = "#172B4D";
const SECONDARY = "#5E6C84"; // 5.3:1 on white — passes WCAG AA
const ERROR     = "#B42318";

// Where the Intervention Manager link goes. Left empty until its address is ready.
const INTERVENTION_MANAGER_HREF: string | null = null;

const CAPABILITIES = [
  { icon: BarChart3,  title: "Real Outcomes",       body: "Monitor progress toward your mission." },
  { icon: TrendingUp, title: "Impact Evidence",     body: "Data that proves change happens." },
  { icon: Zap,        title: "Strategic Insights",  body: "Evidence guiding better decisions." },
  { icon: FileText,   title: "Transform Stories",   body: "Reports that inspire action." },
] as const;

/** What the platform does — four capabilities, not a description of the org. */
const PARTNERS = [
  { src: "/logos/alu.png", alt: "African Leadership University" },
  { src: "/logos/ahc.jpg", alt: "Africa Health Collaborative" },
  { src: "/logos/mcf.png", alt: "Mastercard Foundation" },
];

const playfair = Playfair_Display({ subsets: ["latin"], weight: "600", display: "swap" });

const LABEL: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#6B7280",
  display: "block",
  marginBottom: 8,
};

type Phase = "form" | "verifying";

export default function LoginPage() {
  const router = useRouter();
  const [phase, setPhase]               = useState<Phase>("form");
  const [foundRole, setFoundRole]       = useState<Role | null>(null);
  const [loading, setLoading]           = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused]           = useState<string | null>(null);
  const [hovered, setHovered]           = useState(false);
  const [demoOpen, setDemoOpen]         = useState(false);
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [touched, setTouched]           = useState({ email: false, password: false });
  const [submitted, setSubmitted]       = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [notice, setNotice]             = useState<string | null>(null);
  const emailRef    = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const messages: Record<string, string> = {
      "no-access": "Your account does not have access to a dashboard. Ask an administrator.",
      "link-expired": "That link has expired or was already used. Request a new one.",
      "session": "Please sign in to continue.",
    };
    const code = new URLSearchParams(window.location.search).get("error");
    if (code && messages[code]) setError(messages[code]);
  }, []);

  // Field checks. A field's error shows once it has been left (blurred) or Sign in was pressed.
  const emailProblem    = validateEmail(email);
  const passwordProblem = validatePassword(password);
  const emailMessage    = (touched.email || submitted) ? emailProblem : null;
  const passwordMessage = (touched.password || submitted) ? passwordProblem : null;

  // Emails a reset link to the address typed above. The link opens /reset-password.
  async function sendResetLink() {
    setError(null);
    setNotice(null);
    setTouched(t => ({ ...t, email: true }));
    if (validateEmail(email)) {
      emailRef.current?.focus();
      return;
    }
    const { error: resetError } = await createClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    if (resetError) {
      setError("The reset link could not be sent. Try again shortly.");
      return;
    }
    setNotice("If this email has an account, a reset link has been sent to it.");
  }

  // Checks the fields, moves focus to the first wrong one, and signs in only when both are right.
  function submit(e?: React.FormEvent, override?: { email: string; password: string }) {
    e?.preventDefault();
    const em = (override?.email ?? email).trim();
    const pw = override?.password ?? password;
    setSubmitted(true);
    setNotice(null);
    if (validateEmail(em)) {
      emailRef.current?.focus();
      return;
    }
    if (validatePassword(pw)) {
      passwordRef.current?.focus();
      return;
    }
    void signIn(em, pw);
  }

  async function signIn(em: string, pw: string) {
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: em, password: pw });
    if (signInError) {
      setError("Email or password is not correct.");
      setLoading(false);
      return;
    }
    // The staff role decides where the user goes. Shown step by step on the verifying screen.
    const { data: { user } } = await supabase.auth.getUser();
    let role: Role | null = null;
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      const value = profile?.role;
      role = isRole(value) ? value : null;
    }
    setFoundRole(role);
    setLoading(false);
    setPhase("verifying");
  }

  const finishVerifying = useCallback(() => {
    // A portal role goes to that portal; any other ALU staff or intern email opens ALU-CHII.
    router.push(foundRole ? LANDING[foundRole] : ALU_CHII_LANDING);
  }, [foundRole, router]);

  // Signs in with Google. Google returns to /auth/callback, which checks the role.
  async function signInWithGoogle() {
    setError(null);
    setNotice(null);
    setGoogleLoading(true);
    const { error: oauthError } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) {
      setError("Google sign-in could not start. Try again shortly.");
      setGoogleLoading(false);
    }
  }

  const field = (name: string, invalid: boolean): React.CSSProperties => ({
    width: "100%",
    height: 36,
    fontSize: 16, // 16px stops iOS and Android zooming in on focus
    fontWeight: 500,
    color: TEXT,
    background: "white",
    border: `1px solid ${invalid ? ERROR : focused === name ? PRIMARY : "#D5D8E0"}`,
    boxShadow: focused === name
      ? `0 0 0 2px rgba(20,48,107,0.1), inset 0 0 0 1px ${invalid ? ERROR : PRIMARY}`
      : "none",
    borderRadius: 6,
    padding: "0 12px",
    outline: "none",
    transition: "border-color .15s, box-shadow .15s",
  });

  if (phase === "verifying") {
    // Same split card as the Dashboard / Program Manager chooser: steps on the left, navy brand panel on the right.
    return (
      <div className="min-h-screen flex items-center justify-center p-0 sm:p-4" style={{ background: "white" }}>
        <div
          className="w-full flex flex-col lg:flex-row overflow-hidden lg:max-h-[620px] sm:rounded-[14px] sm:border"
          style={{
            maxWidth: "55rem",
            borderColor: BORDER,
            boxShadow: "0 8px 32px rgba(20,48,107,0.10), 0 1px 2px rgba(0,0,0,0.02)",
            background: "white",
          }}
        >
          <div className="relative w-full lg:w-[50%] flex flex-col justify-center">
            <Verifying email={email.trim()} role={foundRole} onDone={finishVerifying} />
          </div>
          <div
            className="relative hidden lg:flex w-[50%] flex-col items-center justify-between overflow-hidden px-12 py-10"
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

  return (
    <Shell>
      {/* ══ LEFT (form panel) ════════════════════════════════════════ */}
      <div className="chii-signin relative w-full lg:w-[50%] flex flex-col px-6 sm:px-11 py-6 sm:py-8 justify-center lg:justify-between">
        <div style={{ maxWidth: "19rem", width: "100%", margin: "0 auto" }}>

          <h1 className={`${playfair.className} chii-title`} style={{ fontSize: 34, fontWeight: 600, color: TEXT, lineHeight: 1.05, letterSpacing: "-0.015em", marginBottom: 6 }}>
            Welcome Back
          </h1>
          <p className="chii-gap" style={{ fontSize: 14, color: SECONDARY, marginTop: 8, lineHeight: 1.5, marginBottom: 0, fontWeight: 400 }}>
            Please sign in to access the dashboard
          </p>

          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={loading || googleLoading}
            className="chii-gap w-full flex items-center justify-center gap-2.5"
            style={{
              marginTop: 24,
              height: 40,
              fontSize: 13,
              fontWeight: 600,
              color: TEXT,
              background: "white",
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              cursor: loading || googleLoading ? "not-allowed" : "pointer",
              opacity: loading || googleLoading ? 0.6 : 1,
              transition: "background .15s",
            }}
          >
            {googleLoading ? (
              <span
                className="animate-spin"
                style={{ width: 16, height: 16, border: "2px solid #D5D8E0", borderTopColor: PRIMARY, borderRadius: "50%", display: "inline-block" }}
              />
            ) : (
              <svg viewBox="0 0 48 48" width="16" height="16" aria-hidden>
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
              </svg>
            )}
            {googleLoading ? "Connecting to Google…" : "Continue with Google"}
          </button>

          <div className="chii-gap" style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18, fontSize: 12, color: SECONDARY }}>
            <span style={{ flex: 1, height: 1, background: BORDER }} />
            or with email
            <span style={{ flex: 1, height: 1, background: BORDER }} />
          </div>

          <form noValidate onSubmit={submit} className="chii-gap" style={{ marginTop: 18 }}>

            <div style={{ marginBottom: 14 }} className="chii-gap">
              <label htmlFor="email" style={{ ...LABEL, marginBottom: 6 }}>Email address</label>
              <input
                ref={emailRef}
                id="email"
                type="email"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => { setFocused(null); setTouched(t => ({ ...t, email: true })); }}
                placeholder="you@alueducation.com"
                aria-invalid={!!emailMessage}
                aria-describedby={emailMessage ? "email-error" : undefined}
                style={field("email", !!emailMessage)}
              />
              <FieldError id="email-error" message={emailMessage} />
            </div>

            <div style={{ marginBottom: 16 }} className="chii-gap">
              <label htmlFor="password" style={{ ...LABEL, marginBottom: 6 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  ref={passwordRef}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => { setFocused(null); setTouched(t => ({ ...t, password: true })); }}
                  placeholder="••••••••"
                  aria-invalid={!!passwordMessage}
                  aria-describedby={passwordMessage ? "password-error" : undefined}
                  style={{ ...field("password", !!passwordMessage), paddingRight: 66 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    fontSize: 13, fontWeight: 500, color: "#9CA3AF",
                    background: "none", border: "none", cursor: "pointer", padding: 0,
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <FieldError id="password-error" message={passwordMessage} />
            </div>

            <div className="flex items-center justify-between chii-gap" style={{ marginBottom: 18 }}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked style={{ accentColor: PRIMARY, width: 16, height: 16 }} />
                <span style={{ fontSize: 13, color: SECONDARY }}>Remember me</span>
              </label>
              <button
                type="button"
                onClick={sendResetLink}
                className="hover:underline"
                style={{ fontSize: 13, fontWeight: 500, color: PRIMARY, background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <p role="alert" style={{ fontSize: 13, color: ERROR, marginBottom: 12, lineHeight: 1.4 }}>{error}</p>
            )}
            {notice && (
              <p role="status" style={{ fontSize: 13, color: "#166534", marginBottom: 12, lineHeight: 1.4 }}>{notice}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              className="w-full flex items-center justify-center gap-2"
              style={{
                height: 40,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.01em",
                color: "white",
                background: hovered && !loading ? HOVER : PRIMARY,
                border: "none",
                borderRadius: 8,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transform: hovered && !loading ? "translateY(-0.5px)" : "none",
                boxShadow: hovered && !loading
                  ? "0 4px 12px rgba(20,48,107,0.18)"
                  : "0 1px 3px rgba(0,0,0,0.08)",
                transition: "background .15s, transform .15s, box-shadow .15s",
              }}
            >
              {loading ? (
                <span
                  className="animate-spin"
                  style={{
                    width: 18, height: 18,
                    border: "2px solid rgba(255,255,255,0.35)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    display: "inline-block",
                  }}
                />
              ) : (
                <>Sign in <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          {/* Demo accounts — one menu. Picking one fills the form and signs in the normal way. */}
          <div className="chii-gap" style={{ position: "relative", marginTop: 14 }}>
            <button
              type="button"
              onClick={() => setDemoOpen(o => !o)}
              disabled={loading}
              aria-expanded={demoOpen}
              className="flex h-10 w-full items-center gap-2 px-3"
              style={{
                fontSize: 13, fontWeight: 500, color: TEXT, background: "white",
                border: "1px dashed #C9CED8", borderRadius: 8,
                cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
              }}
            >
              <FlaskConical size={15} color={PRIMARY} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, textAlign: "left" }}>Try a demo account</span>
              <ChevronDown size={15} color={SECONDARY} style={{ transform: demoOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
            </button>
            {demoOpen && (
              <div
                className="absolute left-0 right-0 z-20 p-1.5"
                style={{ bottom: "calc(100% + 6px)", background: "white", border: `1px solid ${BORDER}`, borderRadius: 10, boxShadow: "0 8px 24px rgba(20,48,107,0.14)" }}
              >
                <p style={{ fontSize: 11, color: SECONDARY, padding: "4px 8px 6px" }}>
                  Fills the form and signs in. Password <strong>{DEMO_PASSWORD}</strong>
                </p>
                <ul>
                  {DEMO_ACCOUNTS.map(d => (
                    <li key={d.email}>
                      <button
                        type="button"
                        onClick={() => {
                          setDemoOpen(false);
                          setEmail(d.email);
                          setPassword(DEMO_PASSWORD);
                          submit(undefined, { email: d.email, password: DEMO_PASSWORD });
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-gray-50"
                      >
                        <span
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
                          style={{ background: "#E6F1FB", color: PRIMARY, fontSize: 11, fontWeight: 600 }}
                        >
                          {d.initials}
                        </span>
                        <span style={{ minWidth: 0, flex: 1 }}>
                          <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: TEXT }}>{d.label}</span>
                          <span style={{ display: "block", fontSize: 11.5, color: SECONDARY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {d.name} · {d.scope}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Intervention Manager link — shown once its address is set */}
          {INTERVENTION_MANAGER_HREF && (
            <p style={{ fontSize: 13, textAlign: "center", marginTop: 10 }}>
              <a href={INTERVENTION_MANAGER_HREF} className="hover:underline" style={{ color: PRIMARY, fontWeight: 600 }}>
                Go to Intervention Manager →
              </a>
            </p>
          )}

          {/* Partners — centred under a rule. They sit on the white panel because
              the logo files have an opaque white background baked in. */}
          <div className="chii-partners" style={{ borderTop: `1px solid ${BORDER}`, marginTop: 16, paddingTop: 14 }}>
            <p style={{ ...LABEL, textAlign: "center", marginBottom: 12 }}>
              In partnership with
            </p>
            <div className="flex items-center justify-center gap-8">
              {PARTNERS.map(p => (
                <img
                  key={p.src}
                  src={p.src}
                  alt={p.alt}
                  className="chii-partner-logo"
                  style={{ height: 48, width: "auto", objectFit: "contain", display: "block" }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ RIGHT (brand panel) — desktop only; phones get the single form column ══ */}
      <div
        className="relative hidden lg:flex w-[50%] flex-col overflow-hidden px-12 py-10"
        style={{ background: "#102C5E" }}
      >
        <div className="relative z-10 flex flex-col h-full justify-between">
          {/* Logo */}
          <img
            src="/logos/CHII-Logo.png"
            alt="Centre for Health Innovation and Impact"
            style={{ height: 40, width: "auto", objectFit: "contain", display: "block", flexShrink: 0, marginBottom: 28 }}
          />

          {/* Mission narrative */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "white", fontWeight: 500, maxWidth: "340px", margin: 0 }}>
              Explore how CHII builds the evidence base for health innovation across Africa, tracking how young people move through programmes into dignified work, ventures, and lasting impact on health systems across the continent.
            </p>
          </div>

          {/* Capabilities */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>
              Platform Capabilities
            </p>
            <ul className="flex flex-col" style={{ listStyle: "none", margin: 0, padding: 0, gap: 18, maxWidth: "340px" }}>
              {CAPABILITIES.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex items-start gap-3">
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      minWidth: 32,
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 1,
                    }}
                  >
                    <Icon size={16} color="white" strokeWidth={1.5} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "white", lineHeight: 1.3, margin: 0, marginBottom: 2 }}>{title}</p>
                    <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.7)", lineHeight: 1.5, margin: 0 }}>{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Copyright */}
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", flexShrink: 0, margin: 0 }}>
            © 2026 CHII · African Leadership University
          </p>
        </div>
      </div>
    </Shell>
  );
}

/** The card and page frame. Phones show one column, full screen. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="chii-screen flex items-center justify-center p-0 sm:p-4" style={{ background: "var(--bg-page, #F4F6FA)" }}>
      <div
        className="chii-card w-full flex flex-col lg:flex-row overflow-hidden lg:max-h-[700px] sm:rounded-[14px] sm:border"
        style={{
          maxWidth: "55rem",
          borderColor: BORDER,
          boxShadow: "0 8px 32px rgba(20,48,107,0.10), 0 1px 2px rgba(0,0,0,0.02)",
          background: "white",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Inline error under a field. */
function FieldError({ id, message }: { id: string; message: string | null }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" style={{ fontSize: 12, color: ERROR, marginTop: 6, lineHeight: 1.4 }}>
      {message}
    </p>
  );
}

/** The step screen after sign-in: credentials, then role, then the portal. */
function Verifying({ email, role, onDone }: { email: string; role: Role | null; onDone: () => void }) {
  const [done, setDone] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setDone(1), 350),
      setTimeout(() => setDone(2), 750),
      setTimeout(() => setDone(3), 1150),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (done === 3) onDone();
  }, [done, onDone]);

  const steps = [
    "Credentials verified",
    "Role found",
    role ? `Opening the ${PORTAL_NAME[role]} portal` : "Opening the ALU-CHII portal",
  ];

  return (
    <div className="chii-signin flex flex-1 flex-col justify-center px-6 sm:px-11 py-8" style={{ maxWidth: "24rem", width: "100%", margin: "0 auto" }}>
      <h1 style={{ fontSize: 30, fontWeight: 600, color: TEXT, lineHeight: 1.1 }}>
        Signing you in
      </h1>
      <p style={{ fontSize: 13, color: SECONDARY, marginTop: 8, wordBreak: "break-all" }}>{email}</p>

      <ul className="chii-gap" style={{ listStyle: "none", padding: 0, margin: "28px 0 0", display: "flex", flexDirection: "column", gap: 16 }}>
        {steps.map((label, i) => {
          const complete = done > i;
          const active = done === i;
          return (
            <li key={label} style={{ display: "flex", alignItems: "center", gap: 12, opacity: complete || active ? 1 : 0.4 }}>
              <span
                style={{
                  width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                  display: "grid", placeItems: "center",
                  background: complete ? "#16A34A" : "white",
                  border: complete ? "none" : `2px solid ${active ? PRIMARY : "#D5D8E0"}`,
                }}
              >
                {complete ? (
                  <Check size={14} color="white" strokeWidth={3} />
                ) : active ? (
                  <Loader2 size={14} color={PRIMARY} className="animate-spin" />
                ) : null}
              </span>
              <span style={{ fontSize: 14, fontWeight: complete || active ? 600 : 500, color: TEXT }}>{label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
