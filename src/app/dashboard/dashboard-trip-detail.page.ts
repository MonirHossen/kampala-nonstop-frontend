import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideTrash2 } from '@lucide/angular';
import { extractApiError } from '../core/lib/api-error';
import { Trip, TripStatusCode } from '../core/models/trip.models';
import { TripApiService } from '../core/services/trip-api.service';

@Component({
  selector: 'kn-dashboard-trip-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, LucideArrowLeft, LucideTrash2],
  template: `
    <div>
      <a
        routerLink="/dashboard/trips"
        class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground transition hover:text-foreground"
      >
        <svg lucideArrowLeft class="h-3.5 w-3.5" aria-hidden="true"></svg>
        All trips
      </a>

      @if (loading()) {
        <p class="mt-8 text-sm text-muted-foreground">Loading trip&hellip;</p>
      } @else if (trip(); as current) {
        <div class="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="eyebrow text-muted-foreground">{{ current.status_code }}</p>
            <h1 class="font-display mt-2 text-3xl text-foreground sm:text-4xl">
              {{ current.name || 'Untitled trip' }}
            </h1>
          </div>
          <button
            type="button"
            (click)="deleteTrip()"
            class="inline-flex min-h-10 items-center gap-2 border border-hairline px-3 text-xs font-bold uppercase tracking-[0.08em] text-destructive transition hover:border-destructive"
          >
            <svg lucideTrash2 class="h-3.5 w-3.5" aria-hidden="true"></svg>
            Delete
          </button>
        </div>

        @if (message()) {
          <p
            role="status"
            class="mt-4 border-l-2 border-forest bg-forest/5 px-3 py-2.5 text-xs text-forest"
          >
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

        <form class="mt-8 border border-hairline bg-paper p-5" (ngSubmit)="save()">
          <h2 class="font-display text-xl text-foreground">Trip details</h2>
          <div class="mt-5 grid gap-4 sm:grid-cols-2">
            <label class="block text-sm">
              <span class="text-muted-foreground">Name</span>
              <input
                class="mt-1.5 w-full border border-hairline bg-background px-3 py-2.5 text-sm"
                [(ngModel)]="formName"
                name="name"
              />
            </label>
            <label class="block text-sm">
              <span class="text-muted-foreground">Status</span>
              <select
                class="mt-1.5 w-full border border-hairline bg-background px-3 py-2.5 text-sm"
                [(ngModel)]="formStatus"
                name="status_code"
              >
                <option value="DRAFT">Draft</option>
                <option value="PLANNING">Planning</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </label>
            <label class="block text-sm">
              <span class="text-muted-foreground">Start date</span>
              <input
                type="date"
                class="mt-1.5 w-full border border-hairline bg-background px-3 py-2.5 text-sm"
                [(ngModel)]="formStart"
                name="start_date"
              />
            </label>
            <label class="block text-sm">
              <span class="text-muted-foreground">End date</span>
              <input
                type="date"
                class="mt-1.5 w-full border border-hairline bg-background px-3 py-2.5 text-sm"
                [(ngModel)]="formEnd"
                name="end_date"
              />
            </label>
            <label class="block text-sm sm:col-span-2">
              <span class="text-muted-foreground">Notes</span>
              <textarea
                rows="3"
                class="mt-1.5 w-full border border-hairline bg-background px-3 py-2.5 text-sm"
                [(ngModel)]="formNotes"
                name="notes"
              ></textarea>
            </label>
          </div>
          <button
            type="submit"
            [disabled]="saving()"
            class="mt-5 inline-flex min-h-11 items-center bg-primary px-5 text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            Save changes
          </button>
        </form>

        <div class="mt-8 border border-hairline bg-paper">
          <div class="border-b border-hairline px-5 py-4">
            <h2 class="font-display text-xl text-foreground">Listings on this trip</h2>
          </div>
          @if ((current.listings ?? []).length === 0) {
            <p class="px-5 py-8 text-sm text-muted-foreground">
              No listings yet. Browse Discover and use Add to Trip.
            </p>
          } @else {
            <ul class="divide-y divide-hairline">
              @for (item of current.listings ?? []; track item.id) {
                <li class="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                  <div>
                    @if (item.listing; as listing) {
                      @if (listing.slug) {
                        <a
                          [routerLink]="['/discover/listings', listing.slug]"
                          class="text-sm font-medium text-foreground hover:text-forest"
                        >
                          {{ listing.name || 'Listing' }}
                        </a>
                      } @else {
                        <p class="text-sm font-medium text-foreground">
                          {{ listing.name || 'Listing' }}
                        </p>
                      }
                      @if (listing.summary) {
                        <p class="mt-1 text-xs text-muted-foreground">{{ listing.summary }}</p>
                      }
                    } @else {
                      <p class="text-sm font-medium text-foreground">Listing</p>
                    }
                  </div>
                  <button
                    type="button"
                    (click)="removeListing(item.id)"
                    class="eyebrow border border-hairline px-3 py-2 text-destructive transition-colors hover:border-destructive"
                  >
                    Remove
                  </button>
                </li>
              }
            </ul>
          }
        </div>

        <div class="mt-8 border border-hairline bg-paper">
          <div class="border-b border-hairline px-5 py-4">
            <h2 class="font-display text-xl text-foreground">Customers</h2>
          </div>
          <ul class="divide-y divide-hairline">
            @for (customer of current.customers ?? []; track customer.id) {
              <li class="px-5 py-4 text-sm">
                <p class="font-medium text-foreground">
                  {{ customerDisplayName(customer.first_name, customer.last_name) }}
                  @if (customer.is_primary_customer) {
                    <span class="ml-2 text-xs uppercase tracking-wide text-muted-foreground"
                      >Primary</span
                    >
                  }
                </p>
              </li>
            }
          </ul>
        </div>

        @if (current.current_itinerary; as itinerary) {
          <div class="mt-8 border border-hairline bg-paper">
            <div class="border-b border-hairline px-5 py-4">
              <h2 class="font-display text-xl text-foreground">Current itinerary</h2>
              <p class="mt-1 text-xs text-muted-foreground">
                Version {{ itinerary.version_number }} · {{ itinerary.status_code }}
              </p>
            </div>
            @if ((itinerary.items ?? []).length === 0) {
              <p class="px-5 py-8 text-sm text-muted-foreground">
                No scheduled items yet. Your planner will add them here.
              </p>
            } @else {
              <ul class="divide-y divide-hairline">
                @for (item of itinerary.items ?? []; track item.id) {
                  <li class="px-5 py-4 text-sm">
                    <p class="font-medium text-foreground">
                      {{ item.listing?.name || 'Scheduled item' }}
                    </p>
                    <p class="mt-1 text-xs text-muted-foreground">
                      {{ item.scheduled_date || 'Date TBC' }}
                      @if (item.start_time && item.end_time) {
                        · {{ item.start_time }}–{{ item.end_time }}
                      }
                    </p>
                  </li>
                }
              </ul>
            }
          </div>
        }
      }
    </div>
  `,
})
export class DashboardTripDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tripApi = inject(TripApiService);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly trip = signal<Trip | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly message = signal<string | null>(null);

  protected formName = '';
  protected formStatus: TripStatusCode = 'DRAFT';
  protected formStart = '';
  protected formEnd = '';
  protected formNotes = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('tripId');
    if (!id) {
      void this.router.navigate(['/dashboard/trips']);
      return;
    }
    this.load(id);
  }

  protected customerDisplayName(first: string | null, last: string | null): string {
    const name = [first, last].filter(Boolean).join(' ').trim();
    return name || 'Traveller';
  }

  protected save(): void {
    const current = this.trip();
    if (!current) {
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.message.set(null);

    this.tripApi
      .updateTrip(current.id, {
        name: this.formName || null,
        status_code: this.formStatus,
        start_date: this.formStart || null,
        end_date: this.formEnd || null,
        notes: this.formNotes || null,
      })
      .subscribe({
        next: (trip) => {
          this.applyTrip(trip);
          this.message.set('Trip saved.');
          this.saving.set(false);
        },
        error: (err: unknown) => {
          this.error.set(extractApiError(err));
          this.saving.set(false);
        },
      });
  }

  protected removeListing(tripListingId: string): void {
    const current = this.trip();
    if (!current) {
      return;
    }

    this.error.set(null);
    this.tripApi.removeListing(current.id, tripListingId).subscribe({
      next: () => {
        this.message.set('Listing removed.');
        this.load(current.id);
      },
      error: (err: unknown) => this.error.set(extractApiError(err)),
    });
  }

  protected deleteTrip(): void {
    const current = this.trip();
    if (!current || !confirm('Delete this trip?')) {
      return;
    }

    this.tripApi.deleteTrip(current.id).subscribe({
      next: () => void this.router.navigate(['/dashboard/trips']),
      error: (err: unknown) => this.error.set(extractApiError(err)),
    });
  }

  private load(id: string): void {
    this.loading.set(true);
    this.tripApi.getTrip(id).subscribe({
      next: (trip) => {
        this.applyTrip(trip);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(extractApiError(err));
        this.loading.set(false);
      },
    });
  }

  private applyTrip(trip: Trip): void {
    this.trip.set(trip);
    this.formName = trip.name ?? '';
    this.formStatus = trip.status_code;
    this.formStart = trip.start_date ?? '';
    this.formEnd = trip.end_date ?? '';
    this.formNotes = trip.notes ?? '';
  }
}
