import PillarGallery from "@/components/gallery/pillar-gallery";
import { PILLAR_GALLERY_EVENTS } from "@/config/alu-chii-dummy";

export default function Page() {
  return (
    <PillarGallery
      portal="hemp"
      title="HEMP Event Gallery"
      subtitle="Moments from HEMP workshops, internships and employer visits"
      events={PILLAR_GALLERY_EVENTS.hemp}
      withNav={true}
    />
  );
}
