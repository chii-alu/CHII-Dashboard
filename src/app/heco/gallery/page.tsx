import PillarGallery from "@/components/gallery/pillar-gallery";
import { PILLAR_GALLERY_EVENTS } from "@/config/alu-chii-dummy";

export default function Page() {
  return (
    <PillarGallery
      portal="heco"
      title="HECO Event Gallery"
      subtitle="Moments from HECO hackathons, residencies and courses"
      events={PILLAR_GALLERY_EVENTS.heco}
      withNav={false}
    />
  );
}
