export interface ListingCover {
  url: string;
  alt_text: string | null;
}

export interface ListingGalleryImage extends ListingCover {
  caption: string | null;
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
  hot_pick?: boolean;
  page?: number;
  per_page?: number;
}
