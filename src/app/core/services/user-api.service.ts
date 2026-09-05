import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TravellerAuthService } from './traveller-auth.service';
import {
  ApiMessageResponse,
  UserCitizenship,
  UserConsent,
  UserFavourite,
  UserNotificationPreferences,
  UserPreferences,
  UserProfile,
} from '../models/traveller.models';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(TravellerAuthService);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/$/, '')}/user`;

  getProfile(): Observable<UserProfile | null> {
    return this.http
      .get<{ profile: UserProfile | null }>(`${this.baseUrl}/profile`)
      .pipe(map((response) => response.profile));
  }

  updateProfile(payload: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<{ profile: UserProfile }>(`${this.baseUrl}/profile`, payload).pipe(
      map((response) => response.profile),
      tap((profile) => this.patchCurrentUser({ profile })),
    );
  }

  getPreferences(): Observable<UserPreferences | null> {
    return this.http
      .get<{ preferences: UserPreferences | null }>(`${this.baseUrl}/preferences`)
      .pipe(map((response) => response.preferences));
  }

  updatePreferences(payload: Partial<UserPreferences>): Observable<UserPreferences> {
    return this.http
      .put<{ preferences: UserPreferences }>(`${this.baseUrl}/preferences`, payload)
      .pipe(
        map((response) => response.preferences),
        tap((preferences) => this.patchCurrentUser({ preferences })),
      );
  }

  getNotificationPreferences(): Observable<UserNotificationPreferences | null> {
    return this.http
      .get<{ notification_preferences: UserNotificationPreferences | null }>(
        `${this.baseUrl}/notification-preferences`,
      )
      .pipe(map((response) => response.notification_preferences));
  }

  updateNotificationPreferences(
    payload: Partial<UserNotificationPreferences>,
  ): Observable<UserNotificationPreferences> {
    return this.http
      .put<{ notification_preferences: UserNotificationPreferences }>(
        `${this.baseUrl}/notification-preferences`,
        payload,
      )
      .pipe(
        map((response) => response.notification_preferences),
        tap((notification_preferences) => this.patchCurrentUser({ notification_preferences })),
      );
  }

  listCitizenships(): Observable<UserCitizenship[]> {
    return this.http
      .get<{ citizenships: UserCitizenship[] }>(`${this.baseUrl}/citizenships`)
      .pipe(map((response) => response.citizenships));
  }

  addCitizenship(payload: {
    country_code: string;
    is_primary?: boolean;
  }): Observable<UserCitizenship> {
    return this.http
      .post<{ citizenship: UserCitizenship }>(`${this.baseUrl}/citizenships`, payload)
      .pipe(map((response) => response.citizenship));
  }

  updateCitizenship(
    id: string,
    payload: Partial<Pick<UserCitizenship, 'country_code' | 'is_primary'>>,
  ): Observable<UserCitizenship> {
    return this.http
      .put<{ citizenship: UserCitizenship }>(`${this.baseUrl}/citizenships/${id}`, payload)
      .pipe(map((response) => response.citizenship));
  }

  deleteCitizenship(id: string): Observable<ApiMessageResponse> {
    return this.http.delete<ApiMessageResponse>(`${this.baseUrl}/citizenships/${id}`);
  }

  listConsents(): Observable<UserConsent[]> {
    return this.http
      .get<{ consents: UserConsent[] }>(`${this.baseUrl}/consents`)
      .pipe(map((response) => response.consents));
  }

  updateConsent(
    type: UserConsent['consent_type'],
    payload: { is_granted: boolean; policy_version?: string | null },
  ): Observable<UserConsent> {
    return this.http
      .put<{ consent: UserConsent }>(`${this.baseUrl}/consents/${type}`, payload)
      .pipe(
        map((response) => response.consent),
        tap((consent) => {
          const current = this.auth.user();
          if (!current) {
            return;
          }

          const consents = [...(current.consents ?? [])];
          const index = consents.findIndex((item) => item.consent_type === consent.consent_type);

          if (index >= 0) {
            consents[index] = consent;
          } else {
            consents.push(consent);
          }

          this.auth.setUser({ ...current, consents });
        }),
      );
  }

  listFavourites(): Observable<UserFavourite[]> {
    return this.http
      .get<{ favourites: UserFavourite[] }>(`${this.baseUrl}/favourites`)
      .pipe(map((response) => response.favourites));
  }

  addFavourite(payload: {
    favouritable_type: string;
    favouritable_id: string;
    notes?: string | null;
  }): Observable<UserFavourite> {
    return this.http
      .post<{ favourite: UserFavourite }>(`${this.baseUrl}/favourites`, payload)
      .pipe(map((response) => response.favourite));
  }

  deleteFavourite(id: string): Observable<ApiMessageResponse> {
    return this.http.delete<ApiMessageResponse>(`${this.baseUrl}/favourites/${id}`);
  }

  private patchCurrentUser(
    patch: Partial<{
      profile: UserProfile | null;
      preferences: UserPreferences | null;
      notification_preferences: UserNotificationPreferences | null;
    }>,
  ): void {
    const current = this.auth.user();

    if (!current) {
      return;
    }

    this.auth.setUser({ ...current, ...patch });
  }
}
