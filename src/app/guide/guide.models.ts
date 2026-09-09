/** DTOs for GET /api/v1/guide/{countryCode}/essentials. */

export type GuideEssential = {
  id: string;
  code: string | null;
  name: string | null;
  value_text: string | null;
  value_data: Record<string, unknown> | null;
  sort_order: number | null;
};

export type CountryGuideEssentials = {
  country_code: string;
  essentials: GuideEssential[];
};

export type GuideLoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; essentials: GuideEssential[] }
  | { status: 'empty' }
  | { status: 'error'; message: string };
