import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideLoaderCircle } from '@lucide/angular';
import { extractApiError } from '../core/lib/api-error';
import { TravellerAuthService } from '../core/services/traveller-auth.service';

@Component({
  selector: 'kn-social-callback-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideLoaderCircle],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-ink px-5 py-16">
      <div class="w-full max-w-sm bg-paper p-7 text-center">
        @if (error()) {
          <p class="eyebrow text-muted-foreground">Social sign-in</p>
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
          <p class="eyebrow text-muted-foreground">Finishing sign-in</p>
          <p class="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <svg lucideLoaderCircle class="h-4 w-4 animate-spin"></svg>
            Please wait&hellip;
          </p>
        }
      </div>
    </div>
  `,
})
export class SocialCallbackPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(TravellerAuthService);

  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const code = params.get('code');
    const returnUrl = params.get('return_url') || '/dashboard';
    const socialError = params.get('social_error');

    if (socialError) {
      this.error.set(socialError);
      return;
    }

    if (!code) {
      this.error.set('Missing social sign-in code. Please try again from the login page.');
      return;
    }

    this.auth.exchangeSocialCode(code).subscribe({
      next: () => {
        const safe =
          returnUrl.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/dashboard';
        void this.router.navigateByUrl(safe);
      },
      error: (err: unknown) => {
        this.error.set(extractApiError(err, 'Unable to complete social sign-in.'));
      },
    });
  }
}
