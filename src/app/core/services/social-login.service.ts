import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export type SocialProvider = 'google' | 'facebook';

type GoogleCredentialResponse = {
  credential?: string;
  select_by?: string;
};

type GoogleButtonConfig = {
  type?: string;
  theme?: string;
  size?: string;
  text?: string;
  shape?: string;
  logo_alignment?: string;
  width?: number;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            use_fedcm_for_prompt?: boolean;
            itp_support?: boolean;
          }) => void;
          renderButton: (parent: HTMLElement, config: GoogleButtonConfig) => void;
          cancel: () => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
            error_callback?: (error: { type?: string; message?: string }) => void;
          }) => { requestAccessToken: (overrideConfig?: { prompt?: string }) => void };
        };
      };
    };
    FB?: {
      init: (params: {
        appId: string;
        cookie?: boolean;
        xfbml?: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: {
          authResponse?: { accessToken?: string };
          status?: string;
        }) => void,
        options?: {
          scope?: string;
          return_scopes?: boolean;
          config_id?: string;
        },
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

@Injectable({ providedIn: 'root' })
export class SocialLoginService {
  private googleScriptPromise: Promise<void> | null = null;
  private facebookScriptPromise: Promise<void> | null = null;
  private facebookInitialized = false;
  private googleButtonMountedFor: HTMLElement | null = null;

  /**
   * Renders Google's official Sign in button into `host`.
   * Returns an ID token (JWT) via onCredential — preferred over the OAuth popup.
   */
  async mountGoogleButton(
    host: HTMLElement,
    onCredential: (idToken: string) => void,
    onError?: (message: string) => void,
  ): Promise<void> {
    const clientId = environment.googleClientId?.trim();
    if (!clientId) {
      onError?.('Google sign-in is not configured.');
      return;
    }

    await this.loadGoogleSdk();

    const google = window.google;
    if (!google?.accounts?.id) {
      onError?.('Google sign-in failed to load.');
      return;
    }

    // Avoid double-mounting into the same host.
    if (this.googleButtonMountedFor === host && host.childElementCount > 0) {
      return;
    }

    host.replaceChildren();

    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response.credential) {
          onCredential(response.credential);
          return;
        }
        onError?.(this.originHint('Google did not return a credential.'));
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      use_fedcm_for_prompt: true,
      itp_support: true,
    });

    const width = Math.max(240, Math.floor(host.clientWidth || host.parentElement?.clientWidth || 320));

    google.accounts.id.renderButton(host, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width,
    });

    this.googleButtonMountedFor = host;
  }

  /** Fallback: OAuth access-token popup (less reliable; kept for manual triggers). */
  async signInWithGoogle(): Promise<string> {
    const clientId = environment.googleClientId?.trim();
    if (!clientId) {
      throw new Error('Google sign-in is not configured.');
    }

    await this.loadGoogleSdk();

    return new Promise<string>((resolve, reject) => {
      const google = window.google;
      if (!google?.accounts?.oauth2) {
        reject(new Error('Google sign-in failed to load.'));
        return;
      }

      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: (response) => {
          if (response.error || !response.access_token) {
            reject(
              new Error(
                response.error === 'access_denied'
                  ? 'Google sign-in was cancelled.'
                  : this.originHint('Google sign-in failed.'),
              ),
            );
            return;
          }
          resolve(response.access_token);
        },
        error_callback: (error) => {
          const detail = error?.message || error?.type || 'unknown error';
          reject(new Error(this.originHint(`Google sign-in failed (${detail}).`)));
        },
      });

      client.requestAccessToken({ prompt: 'select_account' });
    });
  }

  /**
   * Starts Facebook OAuth via full-page redirect (more reliable than the JS SDK popup).
   * Completes on `/auth/facebook/callback`.
   *
   * Prefer `facebookLoginConfigId` (Meta Login Configuration).
   * Without it, falls back to classic scopes including one Login-for-Business
   * compatible permission so unpublished apps can still open the dialog.
   * @see https://developers.facebook.com/docs/facebook-login/facebook-login-for-business
   */
  startFacebookLogin(returnUrl?: string): void {
    const appId = environment.facebookAppId?.trim();
    if (!appId) {
      throw new Error('Facebook sign-in is not configured.');
    }

    const redirectUri = `${window.location.origin}/auth/facebook/callback`;
    const state =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    sessionStorage.setItem('kn_fb_oauth_state', state);
    sessionStorage.setItem(
      'kn_fb_oauth_return',
      returnUrl || `${window.location.pathname}${window.location.search}` || '/dashboard',
    );

    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      state,
      response_type: 'token',
      display: 'page',
    });

    const configId = environment.facebookLoginConfigId?.trim();
    if (configId) {
      // Permissions come from the Login Configuration — do not also send scope.
      params.set('config_id', configId);
    } else {
      // Fallback for Development mode without a config_id.
      // Meta Login for Business rejects public_profile/email alone; pages_show_list
      // is a commonly accepted extra supported permission for opening the dialog.
      params.set('scope', 'public_profile,email,pages_show_list');
    }

    window.location.assign(`https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`);
  }

  /**
   * Parses the Facebook OAuth redirect hash/query on the callback page.
   */
  consumeFacebookRedirectResult(): {
    token: string | null;
    returnUrl: string | null;
    error: string | null;
  } {
    const expectedState = sessionStorage.getItem('kn_fb_oauth_state');
    const returnUrl = sessionStorage.getItem('kn_fb_oauth_return');
    sessionStorage.removeItem('kn_fb_oauth_state');
    sessionStorage.removeItem('kn_fb_oauth_return');

    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash;
    const query = window.location.search.startsWith('?')
      ? window.location.search.slice(1)
      : window.location.search;

    const hashParams = new URLSearchParams(hash);
    const queryParams = new URLSearchParams(query);

    const error =
      hashParams.get('error_description') ||
      hashParams.get('error') ||
      queryParams.get('error_description') ||
      queryParams.get('error');

    if (error) {
      return {
        token: null,
        returnUrl,
        error: decodeURIComponent(error.replace(/\+/g, ' ')),
      };
    }

    const state = hashParams.get('state') || queryParams.get('state');
    if (expectedState && state && state !== expectedState) {
      return {
        token: null,
        returnUrl,
        error: 'Facebook sign-in state mismatch. Please try again.',
      };
    }

    const token = hashParams.get('access_token') || queryParams.get('access_token');

    return {
      token,
      returnUrl: returnUrl && returnUrl.startsWith('/') ? returnUrl : '/dashboard',
      error: null,
    };
  }

  /** @deprecated Prefer startFacebookLogin() redirect flow. */
  async signInWithFacebook(): Promise<string> {
    this.startFacebookLogin();
    // Redirect navigates away; keep the promise pending until unload.
    return new Promise(() => undefined);
  }

  private originHint(prefix: string): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4201';
    return `${prefix} In Google Cloud Console → your OAuth Web client → Authorized JavaScript origins, add exactly: ${origin}`;
  }

  private loadGoogleSdk(): Promise<void> {
    if (window.google?.accounts?.id && window.google?.accounts?.oauth2) {
      return Promise.resolve();
    }

    if (!this.googleScriptPromise) {
      this.googleScriptPromise = this.loadScript(
        'https://accounts.google.com/gsi/client',
        'google-gsi-client',
      );
    }

    return this.googleScriptPromise;
  }

  private loadFacebookSdk(appId: string): Promise<void> {
    if (this.facebookInitialized && window.FB) {
      return Promise.resolve();
    }

    if (!this.facebookScriptPromise) {
      this.facebookScriptPromise = new Promise<void>((resolve, reject) => {
        window.fbAsyncInit = () => {
          try {
            window.FB?.init({
              appId,
              cookie: true,
              xfbml: false,
              version: 'v19.0',
            });
            this.facebookInitialized = true;
            resolve();
          } catch (error) {
            reject(error instanceof Error ? error : new Error('Facebook SDK init failed.'));
          }
        };

        this.loadScript('https://connect.facebook.net/en_US/sdk.js', 'facebook-jssdk').catch(
          reject,
        );
      });
    }

    return this.facebookScriptPromise;
  }

  private loadScript(src: string, id: string): Promise<void> {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      return existing.dataset['loaded'] === 'true'
        ? Promise.resolve()
        : new Promise((resolve, reject) => {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), {
              once: true,
            });
          });
    }

    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = true;
      script.defer = true;
      script.addEventListener(
        'load',
        () => {
          script.dataset['loaded'] = 'true';
          resolve();
        },
        { once: true },
      );
      script.addEventListener(
        'error',
        () => reject(new Error(`Failed to load ${src}`)),
        { once: true },
      );
      document.body.appendChild(script);
    });
  }
}
