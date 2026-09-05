import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { extractApiError } from '../core/lib/api-error';
import { TravellerAuthService } from '../core/services/traveller-auth.service';
import { UserApiService } from '../core/services/user-api.service';

@Component({
  selector: 'kn-dashboard-overview-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div>
      <p class="eyebrow text-muted-foreground">Overview</p>
      <h1 class="font-display mt-2 text-3xl text-foreground sm:text-4xl">
        Hello, {{ displayName() || 'Traveller' }}
      </h1>
      <p class="mt-2 max-w-xl text-sm text-muted-foreground">
        Your account is active. Complete your profile to personalise trip planning.
      </p>

      @if (error()) {
        <p
          role="alert"
          class="mt-6 border-l-2 border-destructive bg-destructive/5 px-3 py-2.5 text-xs text-destructive"
        >
          {{ error() }}
        </p>
      }

      <div class="mt-8 grid gap-4 sm:grid-cols-3">
        <div class="border border-hairline bg-paper p-5">
          <p class="eyebrow text-muted-foreground">Profile complete</p>
          <p class="font-display mt-3 text-3xl text-foreground">{{ profileComplete() }}%</p>
        </div>
        <div class="border border-hairline bg-paper p-5">
          <p class="eyebrow text-muted-foreground">Saved favourites</p>
          <p class="font-display mt-3 text-3xl text-foreground">
            {{ loadingFavourites() ? '…' : favouritesCount() }}
          </p>
        </div>
        <div class="border border-hairline bg-paper p-5">
          <p class="eyebrow text-muted-foreground">Marketing emails</p>
          <p class="font-display mt-3 text-3xl text-foreground">
            {{ marketingConsent() ? 'On' : 'Off' }}
          </p>
        </div>
      </div>

      <div class="mt-8 grid gap-4 lg:grid-cols-2">
        <div class="border border-hairline bg-paper p-6">
          <h2 class="font-display text-xl text-foreground">Account</h2>
          <p class="mt-4 text-sm"><span class="text-muted-foreground">Email:</span> {{ user()?.email }}</p>
          <p class="mt-2 text-sm"><span class="text-muted-foreground">Status:</span> {{ user()?.status }}</p>
          <a
            routerLink="/dashboard/profile"
            class="eyebrow mt-6 inline-flex bg-primary px-4 py-2.5 text-primary-foreground transition-colors hover:bg-clay"
          >
            Edit profile
          </a>
        </div>
        <div class="border border-hairline bg-paper p-6">
          <h2 class="font-display text-xl text-foreground">Favourites</h2>
          @if (favouritesCount() === 0 && !loadingFavourites()) {
            <p class="mt-4 text-sm text-muted-foreground">
              You have not saved any places yet. Favourites will show up here.
            </p>
          } @else {
            <p class="mt-4 text-sm text-muted-foreground">
              You have {{ favouritesCount() }} saved item{{ favouritesCount() === 1 ? '' : 's' }}.
            </p>
          }
          <a
            routerLink="/dashboard/favourites"
            class="eyebrow mt-6 inline-flex border border-hairline px-4 py-2.5 text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Manage favourites
          </a>
        </div>
      </div>
    </div>
  `,
})
export class DashboardOverviewPage implements OnInit {
  private readonly auth = inject(TravellerAuthService);
  private readonly userApi = inject(UserApiService);

  protected readonly user = this.auth.user;
  protected readonly displayName = this.auth.displayName;
  protected readonly favouritesCount = signal(0);
  protected readonly loadingFavourites = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly profileComplete = computed(() => {
    const profile = this.user()?.profile;
    if (!profile) {
      return 0;
    }

    const fields = [
      profile.first_name,
      profile.last_name,
      profile.phone_number,
      profile.city_of_residence,
      profile.country_of_residence,
    ];
    const filled = fields.filter((value) => !!value && String(value).trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  });

  protected readonly marketingConsent = computed(() => {
    const consent = this.user()?.consents?.find((item) => item.consent_type === 'marketing');
    return consent?.is_granted ?? false;
  });

  ngOnInit(): void {
    this.auth.me().subscribe({ error: () => undefined });

    this.userApi.listFavourites().subscribe({
      next: (items) => {
        this.favouritesCount.set(items.length);
        this.loadingFavourites.set(false);
      },
      error: (err: unknown) => {
        this.error.set(extractApiError(err, 'Unable to load favourites.'));
        this.loadingFavourites.set(false);
      },
    });
  }
}
