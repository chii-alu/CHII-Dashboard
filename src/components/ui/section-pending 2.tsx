// Shown in place of a section whose figures come from Supabase but have not loaded yet.
export function SectionPending({ title }: { title: string }) {
  return (
    <div style={{ backgroundColor: "white", borderRadius: 10, border: "1px solid rgba(0,33,71,0.08)", padding: "20px 24px" }}>
      <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#374151" }}>{title}</p>
      <p style={{ fontSize: 14, color: "#9CA3AF", marginTop: 10 }}>In coming data</p>
    </div>
  );
}
