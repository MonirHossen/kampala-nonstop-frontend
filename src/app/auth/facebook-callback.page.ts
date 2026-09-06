import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideLoaderCircle } from '@lucide/angular';
import { extractApiError } from '../core/lib/api-error';
import { SocialLoginService } from '../core/services/social-login.service';
import { TravellerAuthService } from '../core/services/traveller-auth.service';

@Component({
  selector: 'kn-facebook-callback-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideLoaderCircle],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-ink px-5 py-16">
      <div class="w-full max-w-sm bg-paper p-7 text-center">
        @if (error()) {
          <p class="eyebrow text-muted-foreground">Facebook sign-in</p>
          <p
            role="alert"
            class="mt-5 border-l-2 border-destructive bg-destructive/5 px-3 py-2.5 text-left text-xs text-destructive"
          >
            {{ error() }}
          </p>
          <a
            routerLink="/login"
            class="eyebrow mt-7 inline-flex w-full items-center justify-center bg-primary py-4 text-primary-foreground transition-colors hover:bg-clay"
          >
            Back to sign in
          </a>
        } @else {
          <p class="eyebrow text-muted-foreground">Connecting with Facebook</p>
          <p class="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <svg lucideLoaderCircle class="h-4 w-4 animate-spin"></svg>
            Please wait&hellip;
          </p>
        }
      </div>
    </div>
  `,
})
export class FacebookCallbackPage implements OnInit {
  private readonly social = inject(SocialLoginService);
  private readonly auth = inject(TravellerAuthService);
  private readonly router = inject(Router);

  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const result = this.social.consumeFacebookRedirectResult();

    if (result.error) {
      this.error.set(result.error);
      return;
    }

    if (!result.token) {
      this.error.set(
        'Facebook did not return an access token. In Meta App Dashboard → Facebook Login → Settings, add this Exact Valid OAuth Redirect URI: ' +
          `${window.location.origin}/auth/facebook/callback`,
      );
      return;
    }

    const returnUrl = result.returnUrl || '/dashboard';

    this.auth.socialLogin({ provider: 'facebook', token: result.token }).subscribe({
      next: () => void this.router.navigateByUrl(returnUrl),
      error: (err: unknown) => {
        this.error.set(extractApiError(err, 'Unable to sign in with Facebook.'));
      },
    });
  }
}
