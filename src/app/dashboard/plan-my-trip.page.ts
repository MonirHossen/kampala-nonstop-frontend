import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideArrowRight, LucideCheck, LucidePlus, LucideTrash2 } from '@lucide/angular';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { extractApiError } from '../core/lib/api-error';
import {
  CatalogueFilterInterest,
  CatalogueFilterLocation,
  ListingCard,
} from '../core/models/listing.model';
import {
  OrchestrationStage,
  Trip,
  TripListing,
  TripValidationResult,
} from '../core/models/trip.models';
import { UserFavourite } from '../core/models/traveller.models';
import { SupportContact } from '../core/models/inbox.models';
import { InboxApiService } from '../core/services/inbox-api.service';
import { ListingsApiService } from '../core/services/listings-api.service';
import { TripApiService } from '../core/services/trip-api.service';
import { UserApiService } from '../core/services/user-api.service';

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

const STEP_LABELS: Record<WizardStep, string> = {
  1: 'Location & dates',
  2: 'Your trip basket',
  3: 'Favourites',
  4: 'Explore by interest',
  5: 'Suggestions',
  6: 'Support services',
  7: 'Feasibility',
  8: 'Orchestration',
  9: 'Trip summary',
};

@Component({
  selector: 'kn-plan-my-trip-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, LucideArrowLeft, LucideArrowRight, LucideCheck, LucidePlus, LucideTrash2],
  template: `
    <div>
      <a
        routerLink="/dashboard/trips"
        class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground transition hover:text-foreground"
      >
        <svg lucideArrowLeft class="h-3.5 w-3.5" aria-hidden="true"></svg>
        All trips
      </a>

      <div class="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="eyebrow text-muted-foreground">Plan My Trip</p>
          <h1 class="font-display mt-2 text-3xl text-foreground sm:text-4xl">
            {{ trip()?.name || 'Build your trip' }}
          </h1>
          <p class="mt-2 max-w-2xl text-sm text-muted-foreground">
            Build your basket, then we check feasibility, offer an orchestration sequence, and show a trip summary.
          </p>
        </div>
        @if (trip(); as current) {
          <a
            [routerLink]="['/dashboard/trips', current.id]"
            class="eyebrow border border-hairline px-3 py-2 text-foreground transition hover:border-forest hover:text-forest"
          >
            Open trip detail
          </a>
        }
      </div>

      <ol class="mt-8 flex flex-wrap gap-2" aria-label="Plan My Trip steps">
        @for (item of steps; track item) {
          <li>
            <button
              type="button"
              (click)="goToStep(item)"
              [disabled]="!trip() && item !== 1"
              class="inline-flex items-center gap-2 border px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] transition disabled:opacity-40"
              [class]="
                step() === item
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-hairline bg-paper text-muted-foreground hover:border-forest hover:text-forest'
              "
            >
              <span>{{ item }}</span>
              <span class="hidden sm:inline">{{ stepLabels[item] }}</span>
            </button>
          </li>
        }
      </ol>

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

      @if (bootstrapping()) {
        <p class="mt-8 text-sm text-muted-foreground">Preparing your trip planner&hellip;</p>
      } @else {
        <div class="mt-8 border border-hairline bg-paper p-5">
          @switch (step()) {
            @case (1) {
              <h2 class="font-display text-xl text-foreground">{{ stepLabels[1] }}</h2>
              <p class="mt-2 text-sm text-muted-foreground">
                Choose where you are planning for and the dates you expect to travel.
              </p>
              <form class="mt-6 grid gap-4 sm:grid-cols-2" (ngSubmit)="saveBasics()">
                <label class="block text-sm sm:col-span-2">
                  <span class="text-muted-foreground">Trip name</span>
                  <input
                    class="mt-1.5 w-full border border-hairline bg-background px-3 py-2.5 text-sm"
                    [(ngModel)]="formName"
                    name="name"
                    required
                  />
                </label>
                <label class="block text-sm sm:col-span-2">
                  <span class="text-muted-foreground">Location</span>
                  <select
                    class="mt-1.5 w-full border border-hairline bg-background px-3 py-2.5 text-sm"
                    [(ngModel)]="formLocation"
                    name="planning_location"
                  >
                    <option value="">All Uganda / undecided</option>
                    @for (area of locations(); track area.code) {
                      <option [value]="area.name">{{ area.name }}</option>
                    }
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
                <div class="sm:col-span-2">
                  <button
                    type="submit"
                    [disabled]="saving()"
                    class="inline-flex min-h-11 items-center gap-2 bg-primary px-5 text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                  >
                    Save & continue
                    <svg lucideArrowRight class="h-3.5 w-3.5" aria-hidden="true"></svg>
                  </button>
                </div>
              </form>
            }

            @case (2) {
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 class="font-display text-xl text-foreground">{{ stepLabels[2] }}</h2>
                  <p class="mt-2 text-sm text-muted-foreground">
                    Everything you have already added to this trip appears here as your starting itinerary.
                  </p>
                </div>
                <p class="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  {{ basketCount() }} item{{ basketCount() === 1 ? '' : 's' }}
                </p>
              </div>

              @if (basketCount() === 0) {
                <p class="mt-6 text-sm text-muted-foreground">
                  No listings yet. Continue to Favourites or Explore to add some, or browse
                  <a routerLink="/discover" class="text-forest underline-offset-2 hover:underline">Discover</a>.
                </p>
              } @else {
                <ul class="mt-6 divide-y divide-hairline border border-hairline">
                  @for (item of trip()?.listings ?? []; track item.id) {
                    <li class="flex flex-wrap items-center justify-between gap-4 px-4 py-3">
                      <div class="min-w-0">
                        @if (item.listing; as listing) {
                          <a
                            [routerLink]="['/discover/listings', listing.slug]"
                            class="text-sm font-medium text-foreground hover:text-forest"
                          >
                            {{ listing.name || 'Listing' }}
                          </a>
                          @if (listing.summary) {
                            <p class="mt-1 text-xs text-muted-foreground">{{ listing.summary }}</p>
                          }
                        } @else {
                          <p class="text-sm font-medium text-foreground">Listing</p>
                        }
                      </div>
                      <button
                        type="button"
                        (click)="removeFromTrip(item)"
                        [disabled]="busyListingId() === item.listing_id"
                        class="inline-flex items-center gap-2 border border-hairline px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-destructive transition hover:border-destructive disabled:opacity-60"
                      >
                        <svg lucideTrash2 class="h-3.5 w-3.5" aria-hidden="true"></svg>
                        Remove
                      </button>
                    </li>
                  }
                </ul>
              }

              <div class="mt-6 flex flex-wrap gap-3">
                <button type="button" (click)="goToStep(1)" class="eyebrow border border-hairline px-4 py-2.5">
                  Back
                </button>
                <button
                  type="button"
                  (click)="goToStep(3)"
                  class="inline-flex min-h-11 items-center gap-2 bg-primary px-5 text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground transition hover:bg-primary/90"
                >
                  Continue
                  <svg lucideArrowRight class="h-3.5 w-3.5" aria-hidden="true"></svg>
                </button>
              </div>
            }

            @case (3) {
              <h2 class="font-display text-xl text-foreground">{{ stepLabels[3] }}</h2>
              <p class="mt-2 text-sm text-muted-foreground">
                Add saved favourites into this trip.
              </p>

              @if (favouritesLoading()) {
                <p class="mt-6 text-sm text-muted-foreground">Loading favourites&hellip;</p>
              } @else if (favourites().length === 0) {
                <p class="mt-6 text-sm text-muted-foreground">
                  No favourites yet. Save listings while browsing, then return here.
                </p>
              } @else {
                <ul class="mt-6 divide-y divide-hairline border border-hairline">
                  @for (fav of favourites(); track fav.id) {
                    <li class="flex flex-wrap items-center justify-between gap-4 px-4 py-3">
                      <div class="min-w-0">
                        @if (fav.listing; as listing) {
                          <a
                            [routerLink]="['/discover/listings', listing.slug]"
                            class="text-sm font-medium text-foreground hover:text-forest"
                          >
                            {{ listing.name || 'Favourite' }}
                          </a>
                          @if (listing.summary) {
                            <p class="mt-1 text-xs text-muted-foreground">{{ listing.summary }}</p>
                          }
                        }
                      </div>
                      @if (isOnTrip(fav.listing_id)) {
                        <span class="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.08em] text-forest">
                          <svg lucideCheck class="h-3.5 w-3.5" aria-hidden="true"></svg>
                          On trip
                        </span>
                      } @else {
                        <button
                          type="button"
                          (click)="addListing(fav.listing_id)"
                          [disabled]="busyListingId() === fav.listing_id"
                          class="inline-flex items-center gap-2 border border-hairline px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] transition hover:border-forest hover:text-forest disabled:opacity-60"
                        >
                          <svg lucidePlus class="h-3.5 w-3.5" aria-hidden="true"></svg>
                          Add to trip
                        </button>
                      }
                    </li>
                  }
                </ul>
              }

              <div class="mt-6 flex flex-wrap gap-3">
                <button type="button" (click)="goToStep(2)" class="eyebrow border border-hairline px-4 py-2.5">
                  Back
                </button>
                <button
                  type="button"
                  (click)="goToStep(4)"
                  class="inline-flex min-h-11 items-center gap-2 bg-primary px-5 text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground"
                >
                  Continue
                  <svg lucideArrowRight class="h-3.5 w-3.5" aria-hidden="true"></svg>
                </button>
              </div>
            }

            @case (4) {
              <h2 class="font-display text-xl text-foreground">{{ stepLabels[4] }}</h2>
              <p class="mt-2 text-sm text-muted-foreground">
                Browse more listings by interest{{ formLocation ? ' near ' + formLocation : '' }}.
              </p>

              <div class="mt-6 flex flex-wrap gap-3">
                <label class="block text-sm">
                  <span class="text-muted-foreground">Interest</span>
                  <select
                    class="mt-1.5 block min-w-56 border border-hairline bg-background px-3 py-2.5 text-sm"
                    [(ngModel)]="exploreInterest"
                    name="explore_interest"
                    (ngModelChange)="loadExplore()"
                  >
                    <option value="">All interests</option>
                    @for (theme of interests(); track theme.label) {
                      <option [value]="theme.label">{{ theme.label }}</option>
                    }
                  </select>
                </label>
              </div>

              @if (exploreLoading()) {
                <p class="mt-6 text-sm text-muted-foreground">Loading listings&hellip;</p>
              } @else if (exploreListings().length === 0) {
                <p class="mt-6 text-sm text-muted-foreground">No listings matched these filters.</p>
              } @else {
                <ul class="mt-6 grid gap-3 sm:grid-cols-2">
                  @for (card of exploreListings(); track card.id) {
                    <li class="border border-hairline p-4">
                      <a
                        [routerLink]="['/discover/listings', card.slug]"
                        class="text-sm font-medium text-foreground hover:text-forest"
                      >
                        {{ card.name }}
                      </a>
                      <p class="mt-1 text-xs text-muted-foreground">
                        {{ card.listing_type_name }}
                        @if (card.geographic_area_name) {
                          · {{ card.geographic_area_name }}
                        }
                      </p>
                      @if (card.summary) {
                        <p class="mt-2 line-clamp-2 text-xs text-muted-foreground">{{ card.summary }}</p>
                      }
                      <div class="mt-3">
                        @if (isOnTrip(card.id)) {
                          <span class="text-xs font-bold uppercase tracking-[0.08em] text-forest">On trip</span>
                        } @else {
                          <button
                            type="button"
                            (click)="addListing(card.id)"
                            [disabled]="busyListingId() === card.id"
                            class="inline-flex items-center gap-2 border border-hairline px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] transition hover:border-forest hover:text-forest disabled:opacity-60"
                          >
                            <svg lucidePlus class="h-3.5 w-3.5" aria-hidden="true"></svg>
                            Add to trip
                          </button>
                        }
                      </div>
                    </li>
                  }
                </ul>
              }

              <div class="mt-6 flex flex-wrap gap-3">
                <button type="button" (click)="goToStep(3)" class="eyebrow border border-hairline px-4 py-2.5">
                  Back
                </button>
                <button
                  type="button"
                  (click)="goToStep(5)"
                  class="inline-flex min-h-11 items-center gap-2 bg-primary px-5 text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground"
                >
                  Continue
                  <svg lucideArrowRight class="h-3.5 w-3.5" aria-hidden="true"></svg>
                </button>
              </div>
            }

            @case (5) {
              <h2 class="font-display text-xl text-foreground">{{ stepLabels[5] }}</h2>
              <p class="mt-2 text-sm text-muted-foreground">
                Based on your favourites and what is already on this trip.
              </p>

              @if (suggestionsLoading()) {
                <p class="mt-6 text-sm text-muted-foreground">Finding suggestions&hellip;</p>
              } @else if (suggestions().length === 0) {
                <p class="mt-6 text-sm text-muted-foreground">
                  No extra suggestions right now. Add favourites or explore by interest, then check again.
                </p>
              } @else {
                <ul class="mt-6 grid gap-3 sm:grid-cols-2">
                  @for (card of suggestions(); track card.id) {
                    <li class="border border-hairline p-4">
                      <a
                        [routerLink]="['/discover/listings', card.slug]"
                        class="text-sm font-medium text-foreground hover:text-forest"
                      >
                        {{ card.name }}
                      </a>
                      <p class="mt-1 text-xs text-muted-foreground">
                        {{ card.listing_type_name }}
                        @if (card.category_name) {
                          · {{ card.category_name }}
                        }
                      </p>
                      @if (card.summary) {
                        <p class="mt-2 line-clamp-2 text-xs text-muted-foreground">{{ card.summary }}</p>
                      }
                      <div class="mt-3">
                        @if (isOnTrip(card.id)) {
                          <span class="text-xs font-bold uppercase tracking-[0.08em] text-forest">On trip</span>
                        } @else {
                          <button
                            type="button"
                            (click)="addListing(card.id)"
                            [disabled]="busyListingId() === card.id"
                            class="inline-flex items-center gap-2 border border-hairline px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] transition hover:border-forest hover:text-forest disabled:opacity-60"
                          >
                            <svg lucidePlus class="h-3.5 w-3.5" aria-hidden="true"></svg>
                            Add to trip
                          </button>
                        }
                      </div>
                    </li>
                  }
                </ul>
              }

              <div class="mt-6 flex flex-wrap gap-3">
                <button type="button" (click)="goToStep(4)" class="eyebrow border border-hairline px-4 py-2.5">
                  Back
                </button>
                <button
                  type="button"
                  (click)="goToStep(6)"
                  class="inline-flex min-h-11 items-center gap-2 bg-primary px-5 text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground"
                >
                  Continue
                  <svg lucideArrowRight class="h-3.5 w-3.5" aria-hidden="true"></svg>
                </button>
              </div>
            }

            @case (6) {
              <h2 class="font-display text-xl text-foreground">{{ stepLabels[6] }}</h2>
              <p class="mt-2 text-sm text-muted-foreground">
                Optional practical and support services you may want alongside your plans.
              </p>

              @if (servicesLoading()) {
                <p class="mt-6 text-sm text-muted-foreground">Loading services&hellip;</p>
              } @else if (services().length === 0) {
                <p class="mt-6 text-sm text-muted-foreground">
                  No support services are published yet. You can skip this step for now.
                </p>
              } @else {
                <ul class="mt-6 grid gap-3 sm:grid-cols-2">
                  @for (card of services(); track card.id) {
                    <li class="border border-hairline p-4">
                      <a
                        [routerLink]="['/discover/listings', card.slug]"
                        class="text-sm font-medium text-foreground hover:text-forest"
                      >
                        {{ card.name }}
                      </a>
                      <p class="mt-1 text-xs text-muted-foreground">
                        {{ card.listing_type_name }}
                        @if (card.subcategory_name) {
                          · {{ card.subcategory_name }}
                        }
                      </p>
                      @if (card.summary) {
                        <p class="mt-2 line-clamp-2 text-xs text-muted-foreground">{{ card.summary }}</p>
                      }
                      <div class="mt-3">
                        @if (isOnTrip(card.id)) {
                          <span class="text-xs font-bold uppercase tracking-[0.08em] text-forest">On trip</span>
                        } @else {
                          <button
                            type="button"
                            (click)="addListing(card.id)"
                            [disabled]="busyListingId() === card.id"
                            class="inline-flex items-center gap-2 border border-hairline px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] transition hover:border-forest hover:text-forest disabled:opacity-60"
                          >
                            <svg lucidePlus class="h-3.5 w-3.5" aria-hidden="true"></svg>
                            Add to trip
                          </button>
                        }
                      </div>
                    </li>
                  }
                </ul>
              }

              <div class="mt-6 flex flex-wrap gap-3">
                <button type="button" (click)="goToStep(5)" class="eyebrow border border-hairline px-4 py-2.5">
                  Back
                </button>
                <button
                  type="button"
                  (click)="goToStep(7)"
                  class="inline-flex min-h-11 items-center gap-2 bg-primary px-5 text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground"
                >
                  Check feasibility
                  <svg lucideArrowRight class="h-3.5 w-3.5" aria-hidden="true"></svg>
                </button>
              </div>
            }

            @case (7) {
              <h2 class="font-display text-xl text-foreground">{{ stepLabels[7] }}</h2>
              <p class="mt-2 text-sm text-muted-foreground">
                Backend checks dates, basket contents, live status and booking notice rules.
              </p>

              @if (engineLoading()) {
                <p class="mt-6 text-sm text-muted-foreground">Validating itinerary&hellip;</p>
              } @else if (validation(); as result) {
                @if (result.valid) {
                  <p class="mt-6 border-l-2 border-forest bg-forest/5 px-3 py-2.5 text-sm text-forest">
                    This trip looks feasible so far.
                  </p>
                } @else {
                  <p class="mt-6 border-l-2 border-destructive bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                    Fix the issues below, then re-check.
                  </p>
                }

                @if (result.errors.length) {
                  <ul class="mt-4 space-y-2">
                    @for (issue of result.errors; track issue.code + issue.message) {
                      <li class="border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                        {{ issue.message }}
                      </li>
                    }
                  </ul>
                }

                @if (result.warnings.length) {
                  <ul class="mt-4 space-y-2">
                    @for (issue of result.warnings; track issue.code + issue.message) {
                      <li class="border border-hairline bg-background px-3 py-2 text-sm text-muted-foreground">
                        {{ issue.message }}
                      </li>
                    }
                  </ul>
                }
              }

              <div class="mt-6 flex flex-wrap gap-3">
                <button type="button" (click)="goToStep(2)" class="eyebrow border border-hairline px-4 py-2.5">
                  Amend basket
                </button>
                <button type="button" (click)="goToStep(1)" class="eyebrow border border-hairline px-4 py-2.5">
                  Amend dates
                </button>
                <button
                  type="button"
                  (click)="runValidation()"
                  [disabled]="engineLoading()"
                  class="eyebrow border border-hairline px-4 py-2.5 disabled:opacity-60"
                >
                  Re-check
                </button>
                <button
                  type="button"
                  (click)="goToStep(8)"
                  [disabled]="!validation()?.valid"
                  class="inline-flex min-h-11 items-center gap-2 bg-primary px-5 text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground disabled:opacity-60"
                >
                  Build sequence
                  <svg lucideArrowRight class="h-3.5 w-3.5" aria-hidden="true"></svg>
                </button>
              </div>
            }

            @case (8) {
              <h2 class="font-display text-xl text-foreground">{{ stepLabels[8] }}</h2>
              <p class="mt-2 text-sm text-muted-foreground">
                Suggested order: flights → accommodation → visa → transfers → transport → experiences → concierge.
              </p>

              @if (engineLoading()) {
                <p class="mt-6 text-sm text-muted-foreground">Building orchestration sequence&hellip;</p>
              } @else if (sequence().length === 0) {
                <p class="mt-6 text-sm text-muted-foreground">No sequence available yet. Pass feasibility first.</p>
              } @else {
                <div class="mt-6 space-y-4">
                  @for (stage of sequence(); track stage.stage_code) {
                    <section class="border border-hairline">
                      <header class="border-b border-hairline bg-background px-4 py-3">
                        <h3 class="text-sm font-bold uppercase tracking-[0.08em] text-foreground">
                          {{ stage.stage_label }}
                        </h3>
                      </header>
                      <ul class="divide-y divide-hairline">
                        @for (item of stage.items; track item.listing_id + (item.scheduled_date || '')) {
                          <li class="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                            <div>
                              @if (item.slug) {
                                <a
                                  [routerLink]="['/discover/listings', item.slug]"
                                  class="text-sm font-medium text-foreground hover:text-forest"
                                >
                                  {{ item.name || 'Listing' }}
                                </a>
                              } @else {
                                <p class="text-sm font-medium text-foreground">{{ item.name || 'Listing' }}</p>
                              }
                              <p class="mt-1 text-xs text-muted-foreground">
                                {{ item.listing_type_code || 'LISTING' }}
                                @if (item.scheduled_date) {
                                  · {{ item.scheduled_date }}
                                }
                              </p>
                            </div>
                          </li>
                        }
                      </ul>
                    </section>
                  }
                </div>
              }

              <div class="mt-6 flex flex-wrap gap-3">
                <button type="button" (click)="goToStep(7)" class="eyebrow border border-hairline px-4 py-2.5">
                  Back
                </button>
                <button
                  type="button"
                  (click)="runOrchestration()"
                  [disabled]="engineLoading()"
                  class="eyebrow border border-hairline px-4 py-2.5 disabled:opacity-60"
                >
                  Rebuild sequence
                </button>
                <button
                  type="button"
                  (click)="goToStep(9)"
                  [disabled]="sequence().length === 0"
                  class="inline-flex min-h-11 items-center gap-2 bg-primary px-5 text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground disabled:opacity-60"
                >
                  View summary
                  <svg lucideArrowRight class="h-3.5 w-3.5" aria-hidden="true"></svg>
                </button>
              </div>
            }

            @case (9) {
              <h2 class="font-display text-xl text-foreground">{{ stepLabels[9] }}</h2>
              <p class="mt-2 text-sm text-muted-foreground">
                Review the planned trip, amend if needed, then request booking for human confirmation.
              </p>

              @if (engineLoading()) {
                <p class="mt-6 text-sm text-muted-foreground">Loading summary&hellip;</p>
              } @else if (trip(); as current) {
                <dl class="mt-6 grid gap-4 border border-hairline p-4 sm:grid-cols-2">
                  <div>
                    <dt class="text-xs uppercase tracking-[0.08em] text-muted-foreground">Name</dt>
                    <dd class="mt-1 text-sm text-foreground">{{ current.name || 'Untitled trip' }}</dd>
                  </div>
                  <div>
                    <dt class="text-xs uppercase tracking-[0.08em] text-muted-foreground">Status</dt>
                    <dd class="mt-1 text-sm text-foreground">{{ current.status_code }}</dd>
                  </div>
                  <div>
                    <dt class="text-xs uppercase tracking-[0.08em] text-muted-foreground">Location</dt>
                    <dd class="mt-1 text-sm text-foreground">{{ current.planning_location || 'Not set' }}</dd>
                  </div>
                  <div>
                    <dt class="text-xs uppercase tracking-[0.08em] text-muted-foreground">Dates</dt>
                    <dd class="mt-1 text-sm text-foreground">
                      {{ current.start_date || '…' }} → {{ current.end_date || '…' }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-xs uppercase tracking-[0.08em] text-muted-foreground">Listings</dt>
                    <dd class="mt-1 text-sm text-foreground">{{ basketCount() }}</dd>
                  </div>
                  <div>
                    <dt class="text-xs uppercase tracking-[0.08em] text-muted-foreground">Feasibility</dt>
                    <dd class="mt-1 text-sm" [class]="validation()?.valid ? 'text-forest' : 'text-destructive'">
                      {{ validation()?.valid ? 'Passed' : 'Needs amendments' }}
                    </dd>
                  </div>
                </dl>

                @if (sequence().length) {
                  <div class="mt-6 space-y-3">
                    <h3 class="text-sm font-bold uppercase tracking-[0.08em] text-muted-foreground">Sequence</h3>
                    @for (stage of sequence(); track stage.stage_code) {
                      <p class="text-sm text-foreground">
                        <span class="font-medium">{{ stage.stage_label }}:</span>
                        {{ stageItemNames(stage) }}
                      </p>
                    }
                  </div>
                }

                @if (current.current_itinerary; as itinerary) {
                  <p class="mt-6 text-xs text-muted-foreground">
                    Itinerary v{{ itinerary.version_number }} · {{ itinerary.status_code }} ·
                    {{ itinerary.items?.length ?? 0 }} scheduled items
                  </p>
                }

                <label class="mt-6 block text-sm">
                  <span class="text-muted-foreground">Notes for our team (optional)</span>
                  <textarea
                    rows="3"
                    class="mt-1.5 w-full border border-hairline bg-background px-3 py-2.5 text-sm"
                    [(ngModel)]="bookingNotes"
                    name="booking_notes"
                  ></textarea>
                </label>

                @if (supportContact(); as support) {
                  <div class="mt-4 flex flex-wrap gap-3 text-sm">
                    @if (support.whatsapp_url) {
                      <a
                        class="text-forest underline-offset-2 hover:underline"
                        [href]="support.whatsapp_url"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {{ support.whatsapp_label || 'WhatsApp admin' }}
                      </a>
                    }
                    <a routerLink="/dashboard/inbox" class="text-forest underline-offset-2 hover:underline">
                      Open inbox
                    </a>
                  </div>
                }
              }

              <div class="mt-6 flex flex-wrap gap-3">
                <button type="button" (click)="goToStep(8)" class="eyebrow border border-hairline px-4 py-2.5">
                  Back
                </button>
                <button type="button" (click)="goToStep(2)" class="eyebrow border border-hairline px-4 py-2.5">
                  Amend
                </button>
                @if (trip()?.status_code === 'SUBMITTED' || trip()?.status_code === 'IN_PROGRESS') {
                  <a
                    routerLink="/dashboard/inbox"
                    class="inline-flex min-h-11 items-center gap-2 border border-hairline px-5 text-xs font-bold uppercase tracking-[0.08em]"
                  >
                    View inbox
                  </a>
                } @else {
                  <button
                    type="button"
                    (click)="requestBooking()"
                    [disabled]="bookingBusy() || !validation()?.valid"
                    class="inline-flex min-h-11 items-center gap-2 bg-primary px-5 text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground disabled:opacity-60"
                  >
                    Request booking
                    <svg lucideCheck class="h-3.5 w-3.5" aria-hidden="true"></svg>
                  </button>
                }
              </div>
            }
          }
        </div>
      }
    </div>
  `,
})
export class PlanMyTripPage implements OnInit {
  private readonly tripApi = inject(TripApiService);
  private readonly userApi = inject(UserApiService);
  private readonly listingsApi = inject(ListingsApiService);
  private readonly inboxApi = inject(InboxApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly steps: WizardStep[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  protected readonly stepLabels = STEP_LABELS;
  protected readonly bootstrapping = signal(true);
  protected readonly saving = signal(false);
  protected readonly step = signal<WizardStep>(1);
  protected readonly trip = signal<Trip | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly message = signal<string | null>(null);
  protected readonly busyListingId = signal<string | null>(null);
  protected readonly engineLoading = signal(false);
  protected readonly validation = signal<TripValidationResult | null>(null);
  protected readonly sequence = signal<OrchestrationStage[]>([]);
  protected readonly bookingBusy = signal(false);
  protected readonly supportContact = signal<SupportContact | null>(null);
  protected bookingNotes = '';

  protected readonly locations = signal<CatalogueFilterLocation[]>([]);
  protected readonly interests = signal<CatalogueFilterInterest[]>([]);

  protected readonly favourites = signal<UserFavourite[]>([]);
  protected readonly favouritesLoading = signal(false);

  protected readonly exploreListings = signal<ListingCard[]>([]);
  protected readonly exploreLoading = signal(false);

  protected readonly suggestions = signal<ListingCard[]>([]);
  protected readonly suggestionsLoading = signal(false);

  protected readonly services = signal<ListingCard[]>([]);
  protected readonly servicesLoading = signal(false);

  protected formName = 'My Trip';
  protected formLocation = '';
  protected formStart = '';
  protected formEnd = '';
  protected exploreInterest = '';

  protected readonly basketCount = computed(() => this.trip()?.listings?.length ?? 0);

  private readonly tripListingIds = computed(() => {
    const ids = new Set<string>();
    for (const item of this.trip()?.listings ?? []) {
      ids.add(item.listing_id);
    }
    return ids;
  });

  ngOnInit(): void {
    const tripId = this.route.snapshot.queryParamMap.get('tripId');
    const requestedStep = Number(this.route.snapshot.queryParamMap.get('step') || '1');

    this.inboxApi.supportContact().subscribe({
      next: (contact) => this.supportContact.set(contact),
      error: () => this.supportContact.set(null),
    });

    this.listingsApi.filters().subscribe({
      next: (response) => {
        this.locations.set(response.data.locations ?? []);
        this.interests.set(response.data.interests ?? []);
      },
      error: () => {
        /* filters are optional for step 1 */
      },
    });

    if (tripId) {
      this.tripApi.getTrip(tripId).subscribe({
        next: (trip) => {
          this.applyTrip(trip);
          this.bootstrapping.set(false);
          if (requestedStep >= 1 && requestedStep <= 9) {
            this.goToStep(requestedStep as WizardStep);
          }
        },
        error: (err: unknown) => {
          this.error.set(extractApiError(err));
          this.bootstrapping.set(false);
          this.ensureTrip();
        },
      });
      return;
    }

    this.ensureTrip();
  }

  protected goToStep(next: WizardStep): void {
    if (!this.trip() && next !== 1) {
      return;
    }

    this.error.set(null);
    this.message.set(null);
    this.step.set(next);

    const tripId = this.trip()?.id;
    if (tripId) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tripId, step: next },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }

    if (next === 3) {
      this.loadFavourites();
    }
    if (next === 4) {
      this.loadExplore();
    }
    if (next === 5) {
      this.loadSuggestions();
    }
    if (next === 6) {
      this.loadServices();
    }
    if (next === 7) {
      this.runValidation();
    }
    if (next === 8) {
      this.runOrchestration();
    }
    if (next === 9) {
      this.loadSummary();
    }
  }

  protected runValidation(): void {
    const trip = this.trip();
    if (!trip) {
      return;
    }

    this.engineLoading.set(true);
    this.error.set(null);
    this.tripApi.validateTrip(trip.id).subscribe({
      next: (result) => {
        this.validation.set(result);
        this.engineLoading.set(false);
        if (!result.valid) {
          this.message.set(null);
        } else {
          this.message.set('Feasibility check passed.');
        }
      },
      error: (err: unknown) => {
        this.error.set(extractApiError(err));
        this.engineLoading.set(false);
      },
    });
  }

  protected runOrchestration(): void {
    const trip = this.trip();
    if (!trip) {
      return;
    }

    this.engineLoading.set(true);
    this.error.set(null);
    this.tripApi.orchestrate(trip.id).subscribe({
      next: (result) => {
        this.applyTrip(result.trip);
        this.validation.set(result.validation);
        this.sequence.set(result.sequence ?? []);
        this.engineLoading.set(false);
        if (!result.validation.valid) {
          this.error.set('Orchestration needs a feasible trip. Amend dates or basket, then re-check.');
          this.goToStep(7);
          return;
        }
        this.message.set('Orchestration sequence ready.');
      },
      error: (err: unknown) => {
        this.error.set(extractApiError(err));
        this.engineLoading.set(false);
      },
    });
  }

  private loadSummary(): void {
    const trip = this.trip();
    if (!trip) {
      return;
    }

    this.engineLoading.set(true);
    this.error.set(null);
    this.tripApi.summary(trip.id).subscribe({
      next: (result) => {
        this.applyTrip(result.trip);
        this.validation.set(result.validation);
        this.sequence.set(result.sequence ?? []);
        this.engineLoading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(extractApiError(err));
        this.engineLoading.set(false);
      },
    });
  }

  protected saveBasics(): void {
    const current = this.trip();
    if (!current) {
      return;
    }

    if (this.formEnd && this.formStart && this.formEnd < this.formStart) {
      this.error.set('End date must be on or after the start date.');
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.message.set(null);

    this.tripApi
      .updateTrip(current.id, {
        name: this.formName.trim() || 'My Trip',
        start_date: this.formStart || null,
        end_date: this.formEnd || null,
        planning_location: this.formLocation || null,
        status_code: 'PLANNING',
      })
      .subscribe({
        next: (trip) => {
          this.applyTrip(trip);
          this.saving.set(false);
          this.message.set('Trip basics saved.');
          this.goToStep(2);
        },
        error: (err: unknown) => {
          this.error.set(extractApiError(err));
          this.saving.set(false);
        },
      });
  }

  protected isOnTrip(listingId: string): boolean {
    return this.tripListingIds().has(listingId);
  }

  protected stageItemNames(stage: OrchestrationStage): string {
    return stage.items.map((item) => item.name || 'Listing').join(', ');
  }

  protected requestBooking(): void {
    const trip = this.trip();
    if (!trip || this.bookingBusy()) {
      return;
    }

    this.bookingBusy.set(true);
    this.error.set(null);
    this.message.set(null);

    this.tripApi.requestBooking(trip.id, this.bookingNotes.trim() || null).subscribe({
      next: (result) => {
        this.applyTrip(result.trip);
        this.validation.set(result.validation);
        this.bookingBusy.set(false);
        this.message.set(result.message || 'Booking requested.');
        void this.router.navigate(['/dashboard/inbox', result.thread.id]);
      },
      error: (err: unknown) => {
        this.error.set(extractApiError(err));
        this.bookingBusy.set(false);
      },
    });
  }

  protected addListing(listingId: string): void {
    const trip = this.trip();
    if (!trip || this.busyListingId()) {
      return;
    }

    this.busyListingId.set(listingId);
    this.error.set(null);
    this.message.set(null);

    this.tripApi.addListing({ listing_id: listingId, trip_id: trip.id }).subscribe({
      next: (response) => {
        this.applyTrip(response.trip);
        this.busyListingId.set(null);
        this.message.set(response.created ? 'Added to trip.' : 'Already on this trip.');
        if (this.step() === 5) {
          this.suggestions.update((items) => items.filter((item) => item.id !== listingId));
        }
      },
      error: (err: unknown) => {
        this.error.set(extractApiError(err));
        this.busyListingId.set(null);
      },
    });
  }

  protected removeFromTrip(item: TripListing): void {
    const trip = this.trip();
    if (!trip || this.busyListingId()) {
      return;
    }

    this.busyListingId.set(item.listing_id);
    this.error.set(null);
    this.message.set(null);

    this.tripApi.removeListing(trip.id, item.id).subscribe({
      next: () => {
        this.trip.update((current) => {
          if (!current) {
            return current;
          }
          return {
            ...current,
            listings: (current.listings ?? []).filter((row) => row.id !== item.id),
          };
        });
        this.busyListingId.set(null);
        this.message.set('Removed from trip.');
      },
      error: (err: unknown) => {
        this.error.set(extractApiError(err));
        this.busyListingId.set(null);
      },
    });
  }

  protected loadExplore(): void {
    this.exploreLoading.set(true);
    this.listingsApi
      .list({
        interest: this.exploreInterest || undefined,
        location: this.formLocation || undefined,
        per_page: 12,
      })
      .subscribe({
        next: (page) => {
          this.exploreListings.set(page.data ?? []);
          this.exploreLoading.set(false);
        },
        error: (err: unknown) => {
          this.error.set(extractApiError(err));
          this.exploreLoading.set(false);
        },
      });
  }

  private ensureTrip(): void {
    this.tripApi
      .listTrips()
      .pipe(catchError(() => of([] as Trip[])))
      .subscribe({
        next: (trips) => {
          const draft =
            trips.find((item) => item.status_code === 'DRAFT' || item.status_code === 'PLANNING') ??
            trips[0];

          if (draft) {
            this.tripApi.getTrip(draft.id).subscribe({
              next: (trip) => {
                this.applyTrip(trip);
                this.bootstrapping.set(false);
                void this.router.navigate([], {
                  relativeTo: this.route,
                  queryParams: { tripId: trip.id, step: 1 },
                  replaceUrl: true,
                });
              },
              error: (err: unknown) => {
                this.error.set(extractApiError(err));
                this.createFreshTrip();
              },
            });
            return;
          }

          this.createFreshTrip();
        },
      });
  }

  private createFreshTrip(): void {
    this.tripApi.createTrip({ name: 'My Trip', status_code: 'DRAFT' }).subscribe({
      next: (trip) => {
        this.applyTrip(trip);
        this.bootstrapping.set(false);
        void this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { tripId: trip.id, step: 1 },
          replaceUrl: true,
        });
      },
      error: (err: unknown) => {
        this.error.set(extractApiError(err));
        this.bootstrapping.set(false);
      },
    });
  }

  private applyTrip(trip: Trip): void {
    this.trip.set(trip);
    this.formName = trip.name || 'My Trip';
    this.formStart = trip.start_date || '';
    this.formEnd = trip.end_date || '';
    this.formLocation = trip.planning_location || '';
  }

  private loadFavourites(): void {
    this.favouritesLoading.set(true);
    this.userApi.listFavourites().subscribe({
      next: (items) => {
        this.favourites.set(items);
        this.favouritesLoading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(extractApiError(err));
        this.favouritesLoading.set(false);
      },
    });
  }

  private loadSuggestions(): void {
    const trip = this.trip();
    if (!trip) {
      return;
    }

    this.suggestionsLoading.set(true);
    this.tripApi.suggestions(trip.id).subscribe({
      next: (items) => {
        this.suggestions.set(items);
        this.suggestionsLoading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(extractApiError(err));
        this.suggestionsLoading.set(false);
      },
    });
  }

  private loadServices(): void {
    this.servicesLoading.set(true);
    this.listingsApi.list({ type: 'SERVICE', location: this.formLocation || undefined, per_page: 12 }).subscribe({
      next: (page) => {
        this.services.set(page.data ?? []);
        this.servicesLoading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(extractApiError(err));
        this.servicesLoading.set(false);
      },
    });
  }
}
