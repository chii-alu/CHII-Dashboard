import PortalSidebar from "@/components/layout/portal-sidebar";

export default function HECOLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex" style={{ backgroundColor: "#f8fafc" }}>
      <PortalSidebar portal="heco" />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
