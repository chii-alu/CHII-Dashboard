// Who may open which dashboard. Shared by the server middleware and the sign-in page.
//
// Roles are stored in the `profiles` table in Supabase:
//   admin  -> every dashboard (HEMP, HENT, HECO and EXECUTIVE)
//   HEMP   -> HEMP only
//   HENT   -> HENT only
//   HECO   -> HECO only
// A signed-in user with no profile, or a role not listed here, has no access.

export const ROLES = ["admin", "HEMP", "HENT", "HECO"] as const;
export type Role = (typeof ROLES)[number];

export type DashboardCode = "HEMP" | "HENT" | "HECO" | "EXEC";

// Dashboards each role may open. EXECUTIVE is admin-only.
const ROLE_DASHBOARDS: Record<Role, DashboardCode[]> = {
  admin: ["HEMP", "HENT", "HECO", "EXEC"],
  HEMP: ["HEMP"],
  HENT: ["HENT"],
  HECO: ["HECO"],
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function canOpen(role: Role | null | undefined, dashboard: DashboardCode): boolean {
  if (!role) return false;
  return ROLE_DASHBOARDS[role].includes(dashboard);
}

export function dashboardsFor(role: Role | null | undefined): DashboardCode[] {
  return role ? ROLE_DASHBOARDS[role] : [];
}

// Page paths -> dashboard
export function dashboardForPage(pathname: string): DashboardCode | null {
  if (pathname.startsWith("/hemp")) return "HEMP";
  if (pathname.startsWith("/hent")) return "HENT";
  if (pathname.startsWith("/heco")) return "HECO";
  if (pathname.startsWith("/executive")) return "EXEC";
  return null;
}

// Data API routes -> dashboard. Routes not listed here (and without a `dashboard`
// query value) only need a signed-in user with a valid role.
const API_PREFIX_DASHBOARD: [string, DashboardCode][] = [
  ["/api/hent-", "HENT"],
  ["/api/hemp-", "HEMP"],
  ["/api/internships-", "HEMP"],
  ["/api/exec-", "EXEC"],
  ["/api/outreach-", "EXEC"],
  ["/api/youth-in-work-", "EXEC"],
  ["/api/debug-", "EXEC"],
];

export function dashboardForApi(pathname: string, dashboardParam: string | null): DashboardCode | null | "ANY" {
  for (const [prefix, dashboard] of API_PREFIX_DASHBOARD) {
    if (pathname.startsWith(prefix)) return dashboard;
  }
  if (dashboardParam === "HEMP" || dashboardParam === "HENT" || dashboardParam === "HECO" || dashboardParam === "EXEC") {
    return dashboardParam;
  }
  return "ANY";
}
