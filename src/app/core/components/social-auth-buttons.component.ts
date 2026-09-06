import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { LucideLoaderCircle } from '@lucide/angular';
import { environment } from '../../../environments/environment';
import { extractApiError } from '../lib/api-error';
import { SocialLoginService, SocialProvider } from '../services/social-login.service';
import { TravellerAuthService } from '../services/traveller-auth.service';

@Component({
  selector: 'kn-social-auth-buttons',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideLoaderCircle],
  template: `
    <div class="mt-7">
      <div class="flex items-center gap-3">
        <div class="h-px flex-1 bg-input"></div>
        <span class="eyebrow shrink-0 text-muted-foreground">or continue with</span>
        <div class="h-px flex-1 bg-input"></div>
      </div>

      @if (error()) {
        <p
          role="alert"
          class="mt-5 border-l-2 border-destructive bg-destructive/5 px-3 py-2.5 text-xs text-destructive"
        >
          {{ error() }}
        </p>
      }

      <div class="mt-5 grid gap-3">
        @if (googleConfigured) {
          <div class="min-h-11 w-full overflow-hidden [&_iframe]:!w-full">
            <div #googleButtonHost class="flex w-full justify-center"></div>
          </div>
          @if (pending() === 'google') {
            <p class="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <svg lucideLoaderCircle class="h-4 w-4 animate-spin"></svg>
              Connecting with Google&hellip;
            </p>
          }
        }

        <button
          type="button"
          [disabled]="busy()"
          (click)="signIn('facebook')"
          class="flex h-11 w-full items-center justify-center gap-3 border border-foreground/20 bg-paper text-sm font-medium text-foreground transition-colors hover:border-foreground/40 hover:bg-foreground/[0.04] disabled:opacity-70"
        >
          @if (pending() === 'facebook') {
            <svg lucideLoaderCircle class="h-4 w-4 animate-spin"></svg>
            Connecting&hellip;
          } @else {
            <svg class="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#1877F2"
                d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07"
              />
            </svg>
            Continue with Facebook
          }
        </button>
      </div>
    </div>
  `,
})
export class SocialAuthButtonsComponent {
  private readonly social = inject(SocialLoginService);
  private readonly auth = inject(TravellerAuthService);

  private readonly googleButtonHost = viewChild<ElementRef<HTMLElement>>('googleButtonHost');

  /** When true, parent form submit loading should also disable these buttons. */
  readonly disabled = input(false);
  /** Post-login path for Facebook redirect (defaults to /dashboard). */
  readonly returnUrl = input('/dashboard');
  readonly succeeded = output<void>();

  protected readonly pending = signal<SocialProvider | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly googleConfigured = !!environment.googleClientId?.trim();

  constructor() {
    afterNextRender(() => {
      void this.mountGoogle();
    });
  }

  protected busy(): boolean {
    return this.disabled() || this.pending() !== null;
  }

  protected async signIn(provider: SocialProvider): Promise<void> {
    if (provider !== 'facebook' || this.busy()) {
      return;
    }

    this.error.set(null);
    this.pending.set('facebook');

    try {
      // Full-page OAuth redirect — completes on /auth/facebook/callback
      this.social.startFacebookLogin(this.returnUrl() || '/dashboard');
    } catch (err: unknown) {
      this.error.set(
        err instanceof Error ? err.message : 'Unable to sign in with facebook.',
      );
      this.pending.set(null);
    }
  }

  private async mountGoogle(): Promise<void> {
    if (!this.googleConfigured) {
      return;
    }

    const host = this.googleButtonHost()?.nativeElement;
    if (!host) {
      return;
    }

    try {
      await this.social.mountGoogleButton(
        host,
        (idToken) => {
          this.error.set(null);
          this.pending.set('google');
          this.completeSocialLogin('google', idToken);
        },
        (message) => this.error.set(message),
      );
    } catch (err: unknown) {
      this.error.set(
        err instanceof Error
          ? err.message
          : `Google button failed to load. Add ${window.location.origin} to Authorized JavaScript origins.`,
      );
    }
  }

  private completeSocialLogin(provider: SocialProvider, token: string): void {
    this.auth.socialLogin({ provider, token }).subscribe({
      next: () => {
        this.pending.set(null);
        this.succeeded.emit();
      },
      error: (err: unknown) => {
        this.error.set(extractApiError(err, `Unable to sign in with ${provider}.`));
        this.pending.set(null);
      },
    });
  }
}
