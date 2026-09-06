import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export type SocialProvider = 'google' | 'facebook';

/**
 * Starts Laravel Socialite OAuth (API redirect → provider → API callback → frontend).
 */
@Injectable({ providedIn: 'root' })
export class SocialLoginService {
  /** Full browser redirect into the API Socialite start URL. */
  startOAuth(provider: SocialProvider, returnUrl = '/dashboard'): void {
    const apiBase = environment.apiUrl.replace(/\/$/, '');
    const safeReturn =
      returnUrl.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/dashboard';

    const url = new URL(`${apiBase}/auth/social/${provider}/redirect`);
    url.searchParams.set('return_url', safeReturn);

    window.location.assign(url.toString());
  }
}
