export interface ListingCover {
  url: string;
  alt_text: string | null;
}

export interface ListingGalleryImage extends ListingCover {
  caption: string | null;
  is_cover?: boolean;
}

export interface ListingTag {
  code: string;
  name: string;
}

export interface ListingOption {
  name: string;
  description: string | null;
  duration_minutes: number | null;
  min_participants: number | null;
  max_participants: number | null;
  is_default: boolean;
}

export interface ListingBookingHour {
  day_of_week: number;
  day_name: string | null;
  start_time: string | null;
  end_time: string | null;
  end_day_offset: number;
}

export interface ListingBookingRule {
  minimum_notice_minutes: number | null;
  maximum_advance_days: number | null;
  buffer_before_minutes: number | null;
  buffer_after_minutes: number | null;
  earliest_arrival_time: string | null;
  latest_arrival_time: string | null;
}

export interface ListingCard {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  listing_type_code: string;
  listing_type_name: string;
  category_name: string | null;
  subcategory_name: string | null;
  geographic_area_name: string | null;
  cover: ListingCover | null;
  is_hot_pick: boolean;
  is_local_gem: boolean;
}

export interface ListingDetail extends ListingCard {
  description: string | null;
  inclusions: string | null;
  exclusions: string | null;
  what_to_bring: string | null;
  important_information: string | null;
  booking_instructions: string | null;
  gallery: ListingGalleryImage[];
  tags: ListingTag[];
  options: ListingOption[];
  booking_hours: ListingBookingHour[];
  booking_rule: ListingBookingRule | null;
}

export interface ListingPageMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ListingPage {
  data: ListingCard[];
  meta: ListingPageMeta;
}

export interface ListingFilters {
  type?: string;
  interest?: string;
  location?: string;
  tag?: string;
  hot_pick?: boolean;
  page?: number;
  per_page?: number;
}
