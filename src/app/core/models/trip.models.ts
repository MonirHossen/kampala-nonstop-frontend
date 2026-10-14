export type TripStatusCode =
  | 'DRAFT'
  | 'PLANNING'
  | 'SUBMITTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface TripListingSummary {
  id: string;
  name: string;
  slug: string;
  summary?: string | null;
  is_live?: boolean;
}

export interface TripListing {
  id: string;
  trip_id: string;
  listing_id: string;
  created_at?: string;
  listing?: TripListingSummary | null;
}

export interface TripCustomer {
  id: string;
  trip_id: string;
  user_id: string | null;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  country_of_residence: string | null;
  is_primary_customer: boolean;
  notes: string | null;
}

export interface ItineraryItem {
  id: string;
  listing_id: string;
  source_trip_listing_id: string | null;
  scheduled_date: string | null;
  start_time: string | null;
  end_time: string | null;
  end_day_offset: number;
  sort_order: number;
  is_optional: boolean;
  notes: string | null;
  listing?: TripListingSummary | null;
}

export interface TripItinerary {
  id: string;
  trip_id: string;
  version_number: number;
  status_code: string;
  is_current: boolean;
  notes: string | null;
  items?: ItineraryItem[];
}

export interface Trip {
  id: string;
  owner_user_id: string;
  name: string | null;
  country_code: string;
  start_date: string | null;
  end_date: string | null;
  status_code: TripStatusCode;
  notes: string | null;
  listings_count?: number;
  created_at?: string;
  updated_at?: string;
  listings?: TripListing[];
  customers?: TripCustomer[];
  current_itinerary?: TripItinerary | null;
}

export interface AddListingToTripResponse {
  trip: Trip;
  trip_listing: TripListing;
  created: boolean;
  message: string;
}
