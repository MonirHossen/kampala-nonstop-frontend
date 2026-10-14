import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowRight, LucidePlus } from '@lucide/angular';
import { ListingCard } from '../core/models/listing.model';
import { AuthModalService } from '../core/services/auth-modal.service';
import { ListingsApiService } from '../core/services/listings-api.service';
import { TravellerAuthService } from '../core/services/traveller-auth.service';
import { TripApiService } from '../core/services/trip-api.service';

@Component({
  selector: 'kn-home-nyenge-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideArrowRight, LucidePlus],
  template: `
    @if (listings().length) {
      <section
        class="mx-auto max-w-[1400px] px-5 pb-14 sm:px-8 sm:pb-20"
        aria-labelledby="nyenge-nyege-heading"
      >
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="eyebrow text-primary">Festival packages</p>
            <h2
              id="nyenge-nyege-heading"
              class="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl"
            >
              Nyenge Nyenge Event
            </h2>
            <p class="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Four Magma experiences around the festival — stay close, recover well, and keep the
              shuttle sorted.
            </p>
          </div>
          <a
            routerLink="/discover/catalogue"
            [queryParams]="{ type: 'Experiences' }"
            class="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary underline underline-offset-4"
          >
            See all experiences
            <svg lucideArrowRight class="h-4 w-4" aria-hidden="true"></svg>
          </a>
        </div>

        <ul
          class="mx-auto mt-10 grid max-w-[1100px] grid-cols-1 justify-items-center gap-8 sm:grid-cols-2 sm:gap-x-7 sm:gap-y-10"
        >
          @for (listing of listings(); track listing.id) {
            <li class="w-full max-w-[520px] min-w-0">
              <article class="group flex h-full flex-col overflow-hidden bg-ink text-ink-foreground shadow-[0_18px_40px_-22px_rgba(40,28,16,0.55)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_28px_50px_-24px_rgba(40,28,16,0.6)]">
                <div class="relative h-64 overflow-hidden sm:h-72">
                  <a
                    [routerLink]="['/discover/listings', listing.slug]"
                    class="absolute inset-0 block focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-primary"
                  >
                    @if (listing.cover) {
                      <img
                        [src]="listing.cover.url"
                        [alt]="listing.cover.alt_text || listing.name"
                        loading="lazy"
                        decoding="async"
                        class="h-full w-full object-cover object-center transition duration-700 ease-out group-hover:scale-110"
                      />
                    } @else {
                      <div class="h-full w-full bg-sand" aria-hidden="true"></div>
                    }
                    <span
                      class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10"
                      aria-hidden="true"
                    ></span>
                    <span
                      class="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-clay to-primary"
                      aria-hidden="true"
                    ></span>
                  </a>

                  <div class="pointer-events-none absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    @if (listing.category_name || listing.listing_type_name) {
                      <p class="eyebrow text-primary-foreground/75">
                        {{ listing.category_name || listing.listing_type_name }}
                      </p>
                    }
                    <h3 class="mt-2 font-display text-2xl font-bold leading-tight text-ink-foreground sm:text-[1.65rem]">
                      <a
                        [routerLink]="['/discover/listings', listing.slug]"
                        class="pointer-events-auto transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        {{ listing.name }}
                      </a>
                    </h3>
                  </div>
                </div>

                <div class="flex flex-1 flex-col bg-paper px-5 py-5 text-foreground sm:px-6">
                  @if (listing.summary) {
                    <p class="line-clamp-3 text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
                      {{ listing.summary }}
                    </p>
                  }

                  <div class="mt-auto flex flex-wrap items-center gap-2.5 pt-5">
                    <a
                      [routerLink]="['/discover/listings', listing.slug]"
                      class="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      View experience
                      <svg lucideArrowRight class="h-3.5 w-3.5" aria-hidden="true"></svg>
                    </a>
                    <button
                      type="button"
                      (click)="onAddToTripClick($event, listing)"
                      [disabled]="busyListingId() === listing.id"
                      class="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 bg-ink px-4 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-ink-foreground transition hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60"
                    >
                      <svg lucidePlus class="h-3.5 w-3.5" aria-hidden="true"></svg>
                      {{ busyListingId() === listing.id ? 'Adding…' : 'Add to Trip' }}
                    </button>
                  </div>
                </div>
              </article>
            </li>
          }
        </ul>
      </section>
    }
  `,
})
export class HomeNyengePanelComponent implements OnInit {
  private readonly api = inject(ListingsApiService);
  private readonly tripApi = inject(TripApiService);
  private readonly auth = inject(TravellerAuthService);
  private readonly authModal = inject(AuthModalService);
  private readonly router = inject(Router);

  protected readonly listings = signal<ListingCard[]>([]);
  protected readonly busyListingId = signal<string | null>(null);

  ngOnInit(): void {
    this.api.list({ tag: 'NYENGE_NYEGE', per_page: 4 }).subscribe({
      next: (page) => this.listings.set(page.data),
      error: () => this.listings.set([]),
    });
  }

  protected onAddToTripClick(event: Event, listing: ListingCard): void {
    event.stopPropagation();
    this.addToTrip(listing);
  }

  protected addToTrip(listing: ListingCard): void {
    if (this.busyListingId()) {
      return;
    }

    if (!this.auth.isAuthenticated()) {
      this.authModal.open('login', {
        returnUrl: this.router.url || '/',
      });
      return;
    }

    this.busyListingId.set(listing.id);
    this.tripApi.addListing({ listing_id: listing.id }).subscribe({
      next: (response) => {
        this.busyListingId.set(null);
        void this.router.navigate(['/dashboard/trips', response.trip.id]);
      },
      error: () => this.busyListingId.set(null),
    });
  }
}
