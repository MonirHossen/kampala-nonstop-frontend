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

export interface TripRequirement {
  id: string;
  trip_customer_id: string | null;
  requirement_code: string;
  value_json: Record<string, unknown> | null;
  notes: string | null;
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
  planning_location?: string | null;
  listings_count?: number;
  created_at?: string;
  updated_at?: string;
  listings?: TripListing[];
  customers?: TripCustomer[];
  requirements?: TripRequirement[];
  current_itinerary?: TripItinerary | null;
}

export interface AddListingToTripResponse {
  trip: Trip;
  trip_listing: TripListing;
  created: boolean;
  message: string;
}

export interface TripValidationIssue {
  code: string;
  message: string;
  listing_id?: string | null;
}

export interface TripValidationResult {
  valid: boolean;
  errors: TripValidationIssue[];
  warnings: TripValidationIssue[];
}

export interface OrchestrationSequenceItem {
  listing_id: string;
  trip_listing_id: string | null;
  name: string | null;
  slug: string | null;
  listing_type_code?: string | null;
  scheduled_date: string | null;
  sort_order: number;
  stage_code: string;
}

export interface OrchestrationStage {
  stage_code: string;
  stage_label: string;
  items: OrchestrationSequenceItem[];
}

export interface TripOrchestrationResult {
  trip: Trip;
  validation: TripValidationResult;
  sequence: OrchestrationStage[];
  itinerary: TripItinerary | null;
}

export interface TripSummaryResult {
  trip: Trip;
  validation: TripValidationResult;
  sequence: OrchestrationStage[];
}
