import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  SupportContact,
  SupportMessage,
  SupportThread,
} from '../models/inbox.models';

@Injectable({ providedIn: 'root' })
export class InboxApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/$/, '')}`;

  listThreads(): Observable<SupportThread[]> {
    return this.http
      .get<{ threads: SupportThread[] }>(`${this.baseUrl}/user/inbox/threads`)
      .pipe(map((response) => response.threads));
  }

  getThread(id: string): Observable<SupportThread> {
    return this.http
      .get<{ thread: SupportThread }>(`${this.baseUrl}/user/inbox/threads/${id}`)
      .pipe(map((response) => response.thread));
  }

  messageAdmin(payload: {
    subject: string;
    body: string;
    trip_id?: string | null;
  }): Observable<{ thread: SupportThread; message: SupportMessage }> {
    return this.http.post<{ thread: SupportThread; message: SupportMessage }>(
      `${this.baseUrl}/user/inbox/threads`,
      payload,
    );
  }

  reply(
    threadId: string,
    body: string,
  ): Observable<{ thread: SupportThread; message: SupportMessage }> {
    return this.http.post<{ thread: SupportThread; message: SupportMessage }>(
      `${this.baseUrl}/user/inbox/threads/${threadId}/messages`,
      { body },
    );
  }

  supportContact(): Observable<SupportContact> {
    return this.http.get<SupportContact>(`${this.baseUrl}/support/contact`);
  }
}
