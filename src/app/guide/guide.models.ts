/** DTOs for GET /api/v1/guide/{countryCode}. */

export type GuideEssential = {
  id: string;
  code: string | null;
  name: string | null;
  value_text: string | null;
  value_data: Record<string, unknown> | null;
  sort_order: number | null;
};

export type GuideTravelTopic = {
  id: string;
  code: string | null;
  name: string | null;
  description: string | null;
  content: string | null;
  image_link: string | null;
  sort_order: number | null;
};

export type GuideTravelInformation = {
  id: string;
  code: string | null;
  name: string | null;
  value_text: string | null;
  value_data: Record<string, unknown> | null;
  sort_order: number | null;
};

export type GuideRegion = {
  id: string;
  code: string | null;
  title: string;
  summary: string | null;
  image_link: string | null;
  is_featured: boolean;
};

export type CountryGuide = {
  country_code: string;
  essentials: GuideEssential[];
  travel_guide: GuideTravelTopic[];
  travel_information: GuideTravelInformation[];
  regions: GuideRegion[];
};

export type GuideLoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; guide: CountryGuide }
  | { status: 'empty' }
  | { status: 'error'; message: string };
