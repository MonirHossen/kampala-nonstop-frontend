import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, map, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import { GuideEssential } from './guide.models';

@Injectable({ providedIn: 'root' })
export class GuideApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/$/, '')}/guide`;
  private readonly cache = new Map<string, Observable<GuideEssential[]>>();

  getEssentials(countryCode: string): Observable<GuideEssential[]> {
    const code = countryCode.trim().toUpperCase();
    const cached = this.cache.get(code);
    if (cached) {
      return cached;
    }

    const request$ = this.http
      .get<{ data: GuideEssential[] }>(`${this.baseUrl}/${code}/essentials`)
      .pipe(
        map((response) => response.data),
        tap({
          error: () => this.cache.delete(code),
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

    this.cache.set(code, request$);
    return request$;
  }

  invalidate(countryCode?: string): void {
    if (!countryCode) {
      this.cache.clear();
      return;
    }

    this.cache.delete(countryCode.trim().toUpperCase());
  }

  peek(countryCode: string): Observable<GuideEssential[] | null> {
    const cached = this.cache.get(countryCode.trim().toUpperCase());
    return cached ?? of(null);
  }
}
