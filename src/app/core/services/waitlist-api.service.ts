import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { type InterestOption } from '../lib/interests';
import { collectTracking, DEFAULT_WAITLIST_SOURCE, normaliseSourceCode, querySourceParam } from '../lib/tracking';
import { DuplicateEmailError } from './waitlist.service';

export type WaitlistJoinPayload = {
  firstName: string;
  surname: string;
  email: string;
  countryCode: string;
  interestCodes: string[];
  marketingConsent: boolean;
  acquisitionSourceCode?: string;
  sourceDetails?: string | null;
};

export type WaitlistJoinResult = {
  id: string;
  first_name: string;
  surname: string;
  email: string;
  created_at: string;
};

export type WaitlistInviteResult = {
  id: string;
  invitee_email: string;
  sent_at: string;
};

export type WaitlistInviterSession = {
  id: string;
  firstName: string;
  surname: string;
  email: string;
};

export type AcquisitionSourceOption = {
  code: string;
  name: string;
  type: string;
};

type ListResponse<T> = { data: T[] };

const INVITER_SESSION_KEY = 'kn_waitlist_inviter';

@Injectable({ providedIn: 'root' })
export class WaitlistApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl.replace(/\/$/, '');

  private interestTypesPromise: Promise<InterestOption[]> | null = null;

  readonly interestTypes = signal<InterestOption[]>([]);
  readonly interestTypesLoaded = signal(false);

  async listInterestTypes(force = false): Promise<InterestOption[]> {
    if (!force && this.interestTypesLoaded() && this.interestTypes().length > 0) {
      return this.interestTypes();
    }

    if (!force && this.interestTypesPromise) {
      return this.interestTypesPromise;
    }

    this.interestTypesPromise = firstValueFrom(
      this.http.get<ListResponse<InterestOption>>(`${this.baseUrl}/interest-types`),
    )
      .then((response) => {
        const rows = response.data ?? [];
        this.interestTypes.set(rows);
        this.interestTypesLoaded.set(true);
        return rows;
      })
      .catch((error) => {
        this.interestTypesPromise = null;
        throw error;
      });

    return this.interestTypesPromise;
  }

  async listAcquisitionSources(): Promise<AcquisitionSourceOption[]> {
    const response = await firstValueFrom(
      this.http.get<ListResponse<AcquisitionSourceOption>>(`${this.baseUrl}/acquisition-sources`),
    );
    return response.data ?? [];
  }

  async join(input: WaitlistJoinPayload): Promise<WaitlistJoinResult> {
    const tracking = collectTracking();
    const rawSource =
      input.acquisitionSourceCode?.trim() ||
      querySourceParam() ||
      tracking.source?.trim() ||
      DEFAULT_WAITLIST_SOURCE;
    const sourceCode = normaliseSourceCode(rawSource);

    const sourceDetails = [
      rawSource && `source=${rawSource}`,
      input.sourceDetails,
      tracking.utm_source && `utm_source=${tracking.utm_source}`,
      tracking.utm_medium && `utm_medium=${tracking.utm_medium}`,
      tracking.utm_campaign && `utm_campaign=${tracking.utm_campaign}`,
      tracking.landing_page && `landing=${tracking.landing_page}`,
    ]
      .filter(Boolean)
      .join(' | ');

    try {
      return await firstValueFrom(
        this.http.post<WaitlistJoinResult>(`${this.baseUrl}/waitlist`, {
          first_name: input.firstName.trim(),
          surname: input.surname.trim(),
          email: input.email.trim().toLowerCase(),
          country_code: input.countryCode,
          acquisition_source_code: sourceCode,
          interest_codes: input.interestCodes,
          marketing_consent: input.marketingConsent,
          source_details: sourceDetails || null,
        }),
      );
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 422) {
        const emailErrors = error.error?.errors?.email;
        if (Array.isArray(emailErrors) && emailErrors.some((m: string) => /taken|exists|duplicate/i.test(m))) {
          throw new DuplicateEmailError();
        }
      }
      throw error;
    }
  }

  async invite(inviterId: string, inviteeEmail: string): Promise<WaitlistInviteResult> {
    return firstValueFrom(
      this.http.post<WaitlistInviteResult>(`${this.baseUrl}/waitlist/invitations`, {
        inviter_id: inviterId,
        invitee_email: inviteeEmail.trim().toLowerCase(),
      }),
    );
  }

  rememberInviter(inviter: WaitlistInviterSession): void {
    sessionStorage.setItem(INVITER_SESSION_KEY, JSON.stringify(inviter));
  }

  readInviter(): WaitlistInviterSession | null {
    const raw = sessionStorage.getItem(INVITER_SESSION_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as WaitlistInviterSession;
      if (!parsed?.id || !parsed?.email) return null;
      return parsed;
    } catch {
      return null;
    }
  }
}
