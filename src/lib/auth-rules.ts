// Sign-in rules shared by the sign-in page and the reset link.

export const DEMO_PASSWORD = "Health@ALU#2026";

/** Staff and interns sign in with an ALU address: alueducation.com (staff) or si.alueducation.com (interns). */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ALU_DOMAIN = /@(si\.)?alueducation\.com$/i; // staff: alueducation.com, interns: si.alueducation.com

export function validateEmail(value: string): string | null {
  const v = value.trim();
  if (!v) return "Enter your email address.";
  if (!EMAIL_SHAPE.test(v)) return "Enter a valid email, like name@alueducation.com.";
  if (!ALU_DOMAIN.test(v)) return "Use your ALU staff or intern email.";
  return null;
}

/** Any ALU staff or intern email, for the ALU-CHII portal (no portal role needed). */
export function isAluEmail(email: string): boolean {
  return ALU_DOMAIN.test(email.trim());
}

export function validatePassword(value: string): string | null {
  if (!value) return "Enter your password.";
  if (value.length < 8) return `Passwords are at least 8 characters (${value.length} so far).`;
  return null;
}

/**
 * Demo accounts for the "Try a demo account" menu. Each needs a matching Supabase
 * user with DEMO_PASSWORD and a profiles row with that role.
 */
export const DEMO_ACCOUNTS = [
  { email: "health@alueducation.com", name: "health@alueducation.com", initials: "EX", label: "Executive", scope: "All dashboards", role: "admin" },
  { email: "amarieishimwe@alueducation.com", name: "amarieishimwe@alueducation.com", initials: "AI", label: "HENT", scope: "HENT only", role: "HENT" },
  { email: "dkithome@alueducation.com", name: "dkithome@alueducation.com", initials: "DK", label: "HECO", scope: "HECO only", role: "HECO" },
  { email: "lmugambi@alueducation.com", name: "lmugambi@alueducation.com", initials: "LM", label: "HEMP", scope: "HEMP only", role: "HEMP" },
] as const;
