import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { LocalKnowledgeItem } from './local-knowledge.models';

export type LocalKnowledgeRandomParams = {
  countryCode: string;
  pageContext?: string | null;
  geographicAreaCode?: string | null;
  excludeIds?: string[];
};

@Injectable({ providedIn: 'root' })
export class LocalKnowledgeApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/$/, '')}/local-knowledge`;

  getRandom(params: LocalKnowledgeRandomParams): Observable<LocalKnowledgeItem | null> {
    let httpParams = new HttpParams()
      .set('country_code', params.countryCode.trim().toUpperCase())
      .set('limit', '1');

    if (params.pageContext) {
      httpParams = httpParams.set('page_context', params.pageContext);
    }

    if (params.geographicAreaCode) {
      httpParams = httpParams.set('geographic_area_code', params.geographicAreaCode);
    }

    if (params.excludeIds && params.excludeIds.length > 0) {
      httpParams = httpParams.set('exclude_ids', params.excludeIds.join(','));
    }

    return this.http
      .get<{ data: LocalKnowledgeItem[] }>(`${this.baseUrl}/random`, { params: httpParams })
      .pipe(map((response) => response.data[0] ?? null));
  }
}
