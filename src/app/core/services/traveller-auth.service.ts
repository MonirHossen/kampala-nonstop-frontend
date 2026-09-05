import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiMessageResponse,
  AuthTokenResponse,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  TravellerUser,
} from '../models/traveller.models';

const TOKEN_KEY = 'kn_traveller_token';

/** Laravel Sanctum session for travellers — separate from Supabase admin AuthService. */
@Injectable({ providedIn: 'root' })
export class TravellerAuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/$/, '')}/auth`;

  private readonly tokenSignal = signal<string | null>(this.readToken());
  private readonly userSignal = signal<TravellerUser | null>(null);
  private readonly bootstrappedSignal = signal(false);

  readonly token = this.tokenSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenSignal());
  readonly displayName = computed(() => {
    const user = this.userSignal();
    const profile = user?.profile;

    if (profile?.first_name) {
      return [profile.first_name, profile.last_name].filter(Boolean).join(' ');
    }

    return user?.email ?? '';
  });

  register(payload: RegisterPayload): Observable<AuthTokenResponse> {
    return this.http
      .post<AuthTokenResponse>(`${this.baseUrl}/register`, payload)
      .pipe(tap((response) => this.persistSession(response)));
  }

  login(payload: LoginPayload): Observable<AuthTokenResponse> {
    return this.http
      .post<AuthTokenResponse>(`${this.baseUrl}/login`, {
        ...payload,
        device_name: payload.device_name ?? 'web',
      })
      .pipe(tap((response) => this.persistSession(response)));
  }

  logout(): Observable<ApiMessageResponse | null> {
    if (!this.tokenSignal()) {
      this.clearSession();
      return of(null);
    }

    return this.http.post<ApiMessageResponse>(`${this.baseUrl}/logout`, {}).pipe(
      tap(() => this.clearSession()),
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
    );
  }

  me(): Observable<TravellerUser> {
    return this.http.get<{ user: TravellerUser }>(`${this.baseUrl}/me`).pipe(
      map((response) => response.user),
      tap((user) => this.userSignal.set(user)),
    );
  }

  forgotPassword(payload: ForgotPasswordPayload): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(`${this.baseUrl}/forgot-password`, payload);
  }

  resetPassword(payload: ResetPasswordPayload): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(`${this.baseUrl}/reset-password`, payload);
  }

  changePassword(payload: ChangePasswordPayload): Observable<ApiMessageResponse> {
    return this.http.put<ApiMessageResponse>(`${this.baseUrl}/password`, payload);
  }

  bootstrap(): Observable<boolean> {
    if (this.bootstrappedSignal()) {
      return of(this.isAuthenticated());
    }

    const token = this.tokenSignal();

    if (!token) {
      this.bootstrappedSignal.set(true);
      return of(false);
    }

    return this.me().pipe(
      map(() => {
        this.bootstrappedSignal.set(true);
        return true;
      }),
      catchError(() => {
        this.clearSession();
        this.bootstrappedSignal.set(true);
        return of(false);
      }),
    );
  }

  setUser(user: TravellerUser): void {
    this.userSignal.set(user);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  logoutAndRedirect(returnUrl = '/login'): void {
    this.logout().subscribe({
      next: () => void this.router.navigateByUrl(returnUrl),
      error: () => void this.router.navigateByUrl(returnUrl),
    });
  }

  private persistSession(response: AuthTokenResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    this.tokenSignal.set(response.token);
    this.userSignal.set(response.user);
    this.bootstrappedSignal.set(true);
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.bootstrappedSignal.set(false);
  }

  private readToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }
}
