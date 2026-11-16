import PillarGallery from "@/components/gallery/pillar-gallery";
import { PILLAR_GALLERY_EVENTS } from "@/config/alu-chii-dummy";

export default function Page() {
  return (
    <PillarGallery
      portal="hent"
      title="HENT Event Gallery"
      subtitle="Moments from HENT pitch nights, hackathons and mentorship"
      events={PILLAR_GALLERY_EVENTS.hent}
      withNav={true}
    />
  );
}
