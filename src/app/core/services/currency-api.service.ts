import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';

export type CurrencyOption = {
  code: string;
  name: string;
  display_order: number;
};

type ListResponse<T> = { data: T[] };

@Injectable({ providedIn: 'root' })
export class CurrencyApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl.replace(/\/$/, '');

  private currencies$: Observable<CurrencyOption[]> | null = null;

  listCurrencies(force = false): Observable<CurrencyOption[]> {
    if (force || !this.currencies$) {
      this.currencies$ = this.http
        .get<ListResponse<CurrencyOption>>(`${this.baseUrl}/currencies`)
        .pipe(
          map((response) => response.data ?? []),
          shareReplay(1),
        );
    }

    return this.currencies$;
  }
}
