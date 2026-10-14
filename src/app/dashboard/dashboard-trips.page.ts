import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideMap, LucidePlus } from '@lucide/angular';
import { extractApiError } from '../core/lib/api-error';
import { Trip } from '../core/models/trip.models';
import { TripApiService } from '../core/services/trip-api.service';

@Component({
  selector: 'kn-dashboard-trips-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, LucidePlus, LucideMap],
  template: `
    <div>
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="eyebrow text-muted-foreground">Plan</p>
          <h1 class="font-display mt-2 text-3xl text-foreground sm:text-4xl">My Trips</h1>
          <p class="mt-2 max-w-xl text-sm text-muted-foreground">
            Collect listings into a trip, set dates, then submit when you want help planning.
          </p>
        </div>
        <button
          type="button"
          (click)="createTrip()"
          [disabled]="creating()"
          class="inline-flex min-h-11 items-center gap-2 bg-primary px-4 text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
        >
          <svg lucidePlus class="h-3.5 w-3.5" aria-hidden="true"></svg>
          New trip
        </button>
      </div>

      @if (message()) {
        <p role="status" class="mt-4 border-l-2 border-forest bg-forest/5 px-3 py-2.5 text-xs text-forest">
          {{ message() }}
        </p>
      }
      @if (error()) {
        <p
          role="alert"
          class="mt-4 border-l-2 border-destructive bg-destructive/5 px-3 py-2.5 text-xs text-destructive"
        >
          {{ error() }}
        </p>
      }

      <div class="mt-8 border border-hairline bg-paper">
        <div class="border-b border-hairline px-5 py-4">
          <h2 class="font-display text-xl text-foreground">Your trips</h2>
        </div>

        @if (loading()) {
          <p class="px-5 py-8 text-sm text-muted-foreground">Loading trips&hellip;</p>
        } @else if (trips().length === 0) {
          <div class="px-5 py-10 text-center">
            <svg lucideMap class="mx-auto h-8 w-8 text-muted-foreground/50" aria-hidden="true"></svg>
            <p class="mt-3 text-sm text-muted-foreground">
              No trips yet. Create one, or use Add to Trip while browsing listings.
            </p>
          </div>
        } @else {
          <ul class="divide-y divide-hairline">
            @for (trip of trips(); track trip.id) {
              <li class="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div class="min-w-0">
                  <a
                    [routerLink]="['/dashboard/trips', trip.id]"
                    class="text-sm font-medium text-foreground transition-colors hover:text-forest"
                  >
                    {{ trip.name || 'Untitled trip' }}
                  </a>
                  <p class="mt-1 text-xs text-muted-foreground">
                    {{ trip.status_code }}
                    · {{ trip.listings_count ?? trip.listings?.length ?? 0 }} listings
                    @if (trip.start_date || trip.end_date) {
                      · {{ trip.start_date || '…' }} → {{ trip.end_date || '…' }}
                    }
                  </p>
                </div>
                <a
                  [routerLink]="['/dashboard/trips', trip.id]"
                  class="eyebrow border border-hairline px-3 py-2 text-foreground transition-colors hover:border-forest hover:text-forest"
                >
                  Open
                </a>
              </li>
            }
          </ul>
        }
      </div>
    </div>
  `,
})
export class DashboardTripsPage implements OnInit {
  private readonly tripApi = inject(TripApiService);

  protected readonly loading = signal(true);
  protected readonly creating = signal(false);
  protected readonly trips = signal<Trip[]>([]);
  protected readonly error = signal<string | null>(null);
  protected readonly message = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  protected createTrip(): void {
    this.error.set(null);
    this.message.set(null);
    this.creating.set(true);

    this.tripApi.createTrip({ name: 'My Trip' }).subscribe({
      next: (trip) => {
        this.trips.update((items) => [trip, ...items]);
        this.message.set('Trip created.');
        this.creating.set(false);
      },
      error: (err: unknown) => {
        this.error.set(extractApiError(err));
        this.creating.set(false);
      },
    });
  }

  private load(): void {
    this.loading.set(true);
    this.tripApi.listTrips().subscribe({
      next: (trips) => {
        this.trips.set(trips);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(extractApiError(err));
        this.loading.set(false);
      },
    });
  }
}
