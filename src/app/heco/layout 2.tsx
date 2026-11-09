import PortalNav from "@/components/layout/portal-nav";

export default function HECOLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <PortalNav portal="heco" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
