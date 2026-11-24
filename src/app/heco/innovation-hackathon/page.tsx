// The hackathon is now a section of the Public Sector Fellowship page; this keeps old links working.
import { redirect } from "next/navigation";

export default function Page() {
  redirect("/heco/public-sector-fellowship?section=hackathon");
}
