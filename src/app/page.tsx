import { redirect } from "next/navigation";

// The dashboard opens at sign-in. The Dashboard / Program Manager chooser lives on Program Manager.
export default function RootPage() {
  redirect("/sign-in");
}
