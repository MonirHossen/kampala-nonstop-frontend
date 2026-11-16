import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AddListingToTripResponse,
  Trip,
  TripCustomer,
  TripOrchestrationResult,
  TripStatusCode,
  TripSummaryResult,
  TripValidationResult,
} from '../models/trip.models';
import { SupportThread } from '../models/inbox.models';
import { ListingCard } from '../models/listing.model';
import { ApiMessageResponse } from '../models/traveller.models';

export interface UpsertTripPayload {
  name?: string | null;
  country_code?: string;
  start_date?: string | null;
  end_date?: string | null;
  status_code?: TripStatusCode;
  notes?: string | null;
  planning_location?: string | null;
}

@Injectable({ providedIn: 'root' })
export class TripApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/$/, '')}/user/trips`;

  listTrips(): Observable<Trip[]> {
    return this.http.get<{ trips: Trip[] }>(this.baseUrl).pipe(map((response) => response.trips));
  }

  getTrip(id: string): Observable<Trip> {
    return this.http
      .get<{ trip: Trip }>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => response.trip));
  }

  createTrip(payload: UpsertTripPayload = {}): Observable<Trip> {
    return this.http
      .post<{ trip: Trip }>(this.baseUrl, payload)
      .pipe(map((response) => response.trip));
  }

  updateTrip(id: string, payload: UpsertTripPayload): Observable<Trip> {
    return this.http
      .put<{ trip: Trip }>(`${this.baseUrl}/${id}`, payload)
      .pipe(map((response) => response.trip));
  }

  deleteTrip(id: string): Observable<ApiMessageResponse> {
    return this.http.delete<ApiMessageResponse>(`${this.baseUrl}/${id}`);
  }

  addListing(payload: { listing_id: string; trip_id?: string | null }): Observable<AddListingToTripResponse> {
    return this.http.post<AddListingToTripResponse>(`${this.baseUrl}/listings`, payload);
  }

  removeListing(tripId: string, tripListingId: string): Observable<ApiMessageResponse> {
    return this.http.delete<ApiMessageResponse>(
      `${this.baseUrl}/${tripId}/listings/${tripListingId}`,
    );
  }

  addCustomer(
    tripId: string,
    payload: Partial<TripCustomer> & { first_name?: string | null; last_name?: string | null },
  ): Observable<TripCustomer> {
    return this.http
      .post<{ customer: TripCustomer }>(`${this.baseUrl}/${tripId}/customers`, payload)
      .pipe(map((response) => response.customer));
  }

  removeCustomer(tripId: string, customerId: string): Observable<ApiMessageResponse> {
    return this.http.delete<ApiMessageResponse>(
      `${this.baseUrl}/${tripId}/customers/${customerId}`,
    );
  }

  suggestions(tripId: string, limit = 12): Observable<ListingCard[]> {
    return this.http
      .get<{ data: ListingCard[] }>(`${this.baseUrl}/${tripId}/suggestions`, {
        params: { limit: String(limit) },
      })
      .pipe(map((response) => response.data));
  }

  validateTrip(tripId: string): Observable<TripValidationResult> {
    return this.http.post<TripValidationResult>(`${this.baseUrl}/${tripId}/validate`, {});
  }

  orchestrate(tripId: string): Observable<TripOrchestrationResult> {
    return this.http.post<TripOrchestrationResult>(`${this.baseUrl}/${tripId}/orchestrate`, {});
  }

  summary(tripId: string): Observable<TripSummaryResult> {
    return this.http.get<TripSummaryResult>(`${this.baseUrl}/${tripId}/summary`);
  }

  requestBooking(
    tripId: string,
    notes?: string | null,
  ): Observable<{
    trip: Trip;
    thread: SupportThread;
    validation: TripValidationResult;
    message: string;
  }> {
    return this.http.post<{
      trip: Trip;
      thread: SupportThread;
      validation: TripValidationResult;
      message: string;
    }>(`${this.baseUrl}/${tripId}/request-booking`, { notes: notes ?? null });
  }
}
