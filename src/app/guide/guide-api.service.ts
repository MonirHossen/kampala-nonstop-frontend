import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, map, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import { CountryGuide } from './guide.models';

@Injectable({ providedIn: 'root' })
export class GuideApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/$/, '')}/guide`;
  private readonly cache = new Map<string, Observable<CountryGuide>>();

  /** Single composition fetch per country; subsequent calls reuse in-memory cache. */
  getGuide(countryCode: string): Observable<CountryGuide> {
    const code = countryCode.trim().toUpperCase();
    const cached = this.cache.get(code);
    if (cached) {
      return cached;
    }

    const request$ = this.http.get<{ data: CountryGuide }>(`${this.baseUrl}/${code}`).pipe(
      map((response) => response.data),
      tap({
        error: () => this.cache.delete(code),
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.cache.set(code, request$);
    return request$;
  }

  /** Drop cached composition (e.g. after admin edits in future). */
  invalidate(countryCode?: string): void {
    if (!countryCode) {
      this.cache.clear();
      return;
    }

    this.cache.delete(countryCode.trim().toUpperCase());
  }

  /** Peek without network — used by pages that already triggered a load. */
  peek(countryCode: string): Observable<CountryGuide | null> {
    const cached = this.cache.get(countryCode.trim().toUpperCase());
    return cached ?? of(null);
  }
}
