// Where each role lands after sign-in. Shared by the sign-in page and the auth callback.
import type { Role } from "@/lib/access";

export const LANDING: Record<Role, string> = {
  admin: "/executive/at-a-glance",
  HEMP: "/hemp",
  HENT: "/hent/at-a-glance",
  HECO: "/heco",
};

export const PORTAL_NAME: Record<Role, string> = {
  admin: "Executive",
  HEMP: "HEMP",
  HENT: "HENT",
  HECO: "HECO",
};

/** ALU-CHII opens for any signed-in ALU staff or intern email. */
export const ALU_CHII_LANDING = "/alu-chii/at-a-glance";
