import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ListingDetail, ListingFilters, ListingPage } from '../models/listing.model';

@Injectable({ providedIn: 'root' })
export class ListingsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/$/, '')}/listings`;

  list(filters: ListingFilters = {}): Observable<ListingPage> {
    let params = new HttpParams();

    if (filters.type) {
      params = params.set('type', filters.type);
    }
    if (filters.interest) {
      params = params.set('interest', filters.interest);
    }
    if (filters.location) {
      params = params.set('location', filters.location);
    }
    if (filters.tag) {
      params = params.set('tag', filters.tag);
    }
    if (filters.hot_pick) {
      params = params.set('hot_pick', '1');
    }
    if (filters.page && filters.page > 1) {
      params = params.set('page', String(filters.page));
    }
    if (filters.per_page) {
      params = params.set('per_page', String(filters.per_page));
    }

    return this.http.get<ListingPage>(this.baseUrl, { params });
  }

  show(slug: string): Observable<{ data: ListingDetail }> {
    return this.http.get<{ data: ListingDetail }>(`${this.baseUrl}/${encodeURIComponent(slug)}`);
  }
}
