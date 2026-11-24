import PillarGallery from "@/components/gallery/pillar-gallery";
import { PILLAR_GALLERY_EVENTS } from "@/config/alu-chii-dummy";

export default function Page() {
  return (
    <PillarGallery
      portal="hm"
      title="HM Event Gallery"
      subtitle="Moments from across the Health Missions interventions and partner meetings"
      events={PILLAR_GALLERY_EVENTS.hm}
      withNav={true}
    />
  );
}
