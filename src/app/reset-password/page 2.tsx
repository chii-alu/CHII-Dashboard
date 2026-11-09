"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Playfair_Display } from "next/font/google";
import { createClient } from "@/lib/supabase-client";

const playfair = Playfair_Display({ subsets: ["latin"], weight: "600", display: "swap" });

const PRIMARY = "#14306B";
const HOVER = "#0B2145";
const BORDER = "#E3E0DA";
const TEXT = "#172B4D";
const SECONDARY = "#5E6C84";

const INPUT: React.CSSProperties = {
  width: "100%",
  height: 40,
  fontSize: 13,
  color: TEXT,
  border: "1px solid #D5D8E0",
  borderRadius: 6,
  padding: "0 12px",
  outline: "none",
};

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  // The emailed link signs the person in for password recovery only.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError("The password could not be changed. Request a new reset link.");
      setSaving(false);
      return;
    }
    await supabase.auth.signOut();
    setDone(true);
    setSaving(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "white" }}>
      <div
        style={{
          width: "100%",
          maxWidth: "26rem",
          borderRadius: 14,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 8px 32px rgba(20,48,107,0.10), 0 1px 2px rgba(0,0,0,0.02)",
          padding: "36px 40px",
        }}
      >
        <h1 className={playfair.className} style={{ fontSize: 30, fontWeight: 600, color: TEXT, lineHeight: 1.1, margin: 0 }}>
          Set a new password
        </h1>

        {done ? (
          <>
            <p style={{ fontSize: 14, color: SECONDARY, marginTop: 14, lineHeight: 1.5 }}>
              Your password has been changed. You can now sign in with it.
            </p>
            <Link href="/sign-in" style={{ display: "block", textAlign: "center", marginTop: 24, height: 40, lineHeight: "40px", borderRadius: 8, background: PRIMARY, color: "white", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Go to sign in
            </Link>
          </>
        ) : !ready ? (
          <>
            <p style={{ fontSize: 14, color: SECONDARY, marginTop: 14, lineHeight: 1.5 }}>
              This reset link is no longer valid. Request a new one from the sign-in page.
            </p>
            <Link href="/sign-in" style={{ display: "block", textAlign: "center", marginTop: 24, height: 40, lineHeight: "40px", borderRadius: 8, background: PRIMARY, color: "white", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Back to sign in
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: 22 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B7280", marginBottom: 6 }}>New password</label>
            <input type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} style={INPUT} />

            <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B7280", margin: "14px 0 6px" }}>Confirm password</label>
            <input type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} style={INPUT} />

            {error && <p role="alert" style={{ fontSize: 13, color: "#B42318", marginTop: 12, lineHeight: 1.4 }}>{error}</p>}

            <button
              type="submit"
              disabled={saving}
              style={{ width: "100%", height: 40, marginTop: 22, fontSize: 13, fontWeight: 700, color: "white", background: saving ? HOVER : PRIMARY, border: "none", borderRadius: 8, cursor: saving ? "not-allowed" : "pointer" }}
            >
              {saving ? "Saving…" : "Save new password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
