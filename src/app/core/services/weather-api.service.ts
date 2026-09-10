import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export type KampalaWeather = {
  temperature_c: number;
  condition: string;
  location: string;
  timezone: string;
  fetched_at: string;
};

@Injectable({ providedIn: 'root' })
export class WeatherApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/$/, '')}/weather`;

  getKampala(): Observable<KampalaWeather> {
    return this.http
      .get<{ data: KampalaWeather }>(`${this.baseUrl}/kampala`)
      .pipe(map((response) => response.data));
  }
}
