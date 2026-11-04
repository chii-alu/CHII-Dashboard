// Shape of an impact story as stored in Supabase. The rows themselves are never bundled in the code.
export type StoryType = "Text story" | "Video story";

export interface Story {
  id: number;
  name: string;
  type: StoryType;
  program: string;
  missionArea: string;
  humanitarianStatus: string;
  nationality: string;
  disabilityStatus: string;
  gender: string;
  location: string;
  lat: number;
  lng: number;
  body: string;
  videoUrl?: string;
}
