import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideCalendarClock,
  LucideCheck,
  LucideClock3,
  LucideMapPin,
  LucideSparkles,
  LucideUsers,
  LucideX,
} from '@lucide/angular';
import { SiteHeaderComponent } from '../site/site-header.component';
import { SiteFooterComponent } from '../site/site-footer.component';
import { GuideBreadcrumbComponent, GuideCrumb } from '../guide/components/guide-breadcrumb.component';
import { ListingsApiService } from '../core/services/listings-api.service';
import { ListingDetail, ListingGalleryImage, ListingOption } from '../core/models/listing.model';

@Component({
  selector: 'kn-discover-listing-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SiteHeaderComponent,
    SiteFooterComponent,
    GuideBreadcrumbComponent,
    RouterLink,
    LucideCheck,
    LucideX,
    LucideMapPin,
    LucideClock3,
    LucideUsers,
    LucideCalendarClock,
    LucideSparkles,
    LucideArrowRight,
  ],
  styles: `
    @keyframes listing-hero-in {
      from {
        opacity: 0.72;
        transform: scale(1.04);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes listing-rise {
      from {
        opacity: 0;
        transform: translateY(1rem);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .listing-hero-media {
      animation: listing-hero-in 1.1s ease-out both;
    }

    .listing-rise {
      animation: listing-rise 0.7s ease-out both;
    }

    .listing-rise-delay {
      animation-delay: 120ms;
    }

    .listing-gallery-item img {
      transition: transform 0.6s ease;
    }

    .listing-gallery-item:hover img {
      transform: scale(1.04);
    }
  `,
  template: `
    <div class="flex min-h-screen flex-col bg-background">
      <kn-site-header [lightBackground]="true" />
      <main class="flex-1 pb-20 sm:pb-28">
        @if (loadError()) {
          <div class="mx-auto max-w-[1400px] px-5 pt-28 sm:px-8 sm:pt-32">
            <kn-guide-breadcrumb [crumbs]="crumbs()" />
            <section class="mt-8 max-w-2xl">
              <h1 class="font-display text-3xl text-foreground">This listing isn’t available</h1>
              <p class="mt-3 leading-relaxed text-muted-foreground">
                It may be unpublished, or the link no longer matches a live listing.
              </p>
              <a
                routerLink="/discover/catalogue"
                [queryParams]="backQuery()"
                class="mt-6 inline-flex min-h-11 items-center font-bold text-primary underline underline-offset-4"
              >
                Back to catalogue
              </a>
            </section>
          </div>
        } @else if (!listing()) {
          <div class="mx-auto max-w-[1400px] px-5 pt-28 sm:px-8 sm:pt-32" aria-hidden="true">
            <div class="mt-8 aspect-[4/3] animate-pulse bg-muted sm:aspect-[21/9]"></div>
          </div>
        } @else {
          <article>
            <div class="relative isolate mt-14 min-h-[56vw] overflow-hidden bg-ink text-white sm:mt-14 sm:min-h-[30rem] lg:min-h-[34rem]">
              @if (listing()!.cover) {
                <img
                  [src]="listing()!.cover!.url"
                  [alt]="listing()!.cover!.alt_text || listing()!.name"
                  class="listing-hero-media absolute inset-0 -z-20 h-full w-full object-cover object-center"
                />
              }
              <div
                class="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/40 to-black/25"
                aria-hidden="true"
              ></div>
              <div
                class="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-primary/25 to-transparent"
                aria-hidden="true"
              ></div>
              <div
                class="listing-rise relative mx-auto flex min-h-[56vw] max-w-[1400px] flex-col justify-end px-5 pb-10 pt-28 sm:min-h-[30rem] sm:px-8 sm:pb-12 lg:min-h-[34rem]"
              >
                <kn-guide-breadcrumb [crumbs]="crumbs()" tone="light" />
                <div class="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs uppercase tracking-[0.14em] text-white/80">
                  <span>{{ listing()!.listing_type_name }}</span>
                  @if (listing()!.is_hot_pick) {
                    <span class="text-primary">Hot Pick</span>
                  }
                  @if (listing()!.is_local_gem) {
                    <span class="inline-flex items-center gap-1.5">
                      <svg lucideSparkles class="h-3.5 w-3.5 text-primary" aria-hidden="true"></svg>
                      Local Gem
                    </span>
                  }
                </div>
                <h1 class="mt-3 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                  {{ listing()!.name }}
                </h1>
                @if (placeLine()) {
                  <p class="mt-4 inline-flex items-center gap-2 text-sm text-white/80">
                    <svg lucideMapPin class="h-4 w-4 shrink-0 text-primary" aria-hidden="true"></svg>
                    {{ placeLine() }}
                  </p>
                }
                @if (listing()!.summary) {
                  <p class="mt-4 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
                    {{ listing()!.summary }}
                  </p>
                }
                <div class="mt-8 flex flex-wrap gap-3">
                  <a
                    routerLink="/waitlist/join"
                    class="inline-flex min-h-12 items-center gap-2 bg-primary px-6 text-sm font-bold uppercase tracking-[0.08em] text-primary-foreground transition hover:bg-primary/90"
                  >
                    Plan My Trip
                    <svg lucideArrowRight class="h-4 w-4" aria-hidden="true"></svg>
                  </a>
                  <a
                    routerLink="/discover/catalogue"
                    [queryParams]="backQuery()"
                    class="inline-flex min-h-12 items-center border border-white/35 px-6 text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:border-white hover:bg-white/10"
                  >
                    Back to catalogue
                  </a>
                </div>
              </div>
            </div>

            <div class="mx-auto max-w-[1400px] px-5 pt-10 sm:px-8 sm:pt-14">
              @if (listing()!.tags.length) {
                <ul class="listing-rise listing-rise-delay flex flex-wrap gap-2" aria-label="Listing tags">
                  @for (tag of listing()!.tags; track tag.code) {
                    <li class="border border-hairline bg-muted/40 px-3 py-1.5 text-sm text-foreground">
                      {{ tag.name }}
                    </li>
                  }
                </ul>
              }

              <div class="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.85fr)] lg:gap-14 xl:gap-16">
                <div class="min-w-0 space-y-12">
                  @if (listing()!.description) {
                    <section aria-labelledby="listing-about">
                      <div class="flex items-center gap-4">
                        <h2 id="listing-about" class="shrink-0 font-display text-2xl text-foreground sm:text-3xl">
                          About
                        </h2>
                        <span class="h-px min-w-8 flex-1 bg-primary" aria-hidden="true"></span>
                      </div>
                      <p class="mt-5 whitespace-pre-line text-base leading-relaxed text-muted-foreground sm:text-lg">
                        {{ listing()!.description }}
                      </p>
                    </section>
                  }

                  @if (listing()!.options.length) {
                    <section aria-labelledby="listing-options">
                      <div class="flex items-center gap-4">
                        <h2 id="listing-options" class="shrink-0 font-display text-2xl text-foreground sm:text-3xl">
                          Options
                        </h2>
                        <span class="h-px min-w-8 flex-1 bg-primary" aria-hidden="true"></span>
                      </div>
                      <ul class="mt-6 space-y-4">
                        @for (option of listing()!.options; track option.name) {
                          <li
                            class="border-l-2 border-primary/70 bg-gradient-to-r from-primary/8 to-transparent px-5 py-4 transition duration-300 hover:from-primary/14"
                          >
                            <div class="flex flex-wrap items-baseline justify-between gap-2">
                              <h3 class="font-display text-xl text-foreground">{{ option.name }}</h3>
                              @if (option.is_default) {
                                <span class="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                                  Most requested
                                </span>
                              }
                            </div>
                            @if (option.description) {
                              <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {{ option.description }}
                              </p>
                            }
                            <div class="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-foreground/80">
                              @if (durationLabel(option); as duration) {
                                <span class="inline-flex items-center gap-1.5">
                                  <svg lucideClock3 class="h-4 w-4 text-primary" aria-hidden="true"></svg>
                                  {{ duration }}
                                </span>
                              }
                              @if (partyLabel(option); as party) {
                                <span class="inline-flex items-center gap-1.5">
                                  <svg lucideUsers class="h-4 w-4 text-primary" aria-hidden="true"></svg>
                                  {{ party }}
                                </span>
                              }
                            </div>
                          </li>
                        }
                      </ul>
                    </section>
                  }

                  @if (inclusionLines().length || exclusionLines().length) {
                    <section aria-labelledby="listing-included">
                      <div class="flex items-center gap-4">
                        <h2 id="listing-included" class="shrink-0 font-display text-2xl text-foreground sm:text-3xl">
                          What’s covered
                        </h2>
                        <span class="h-px min-w-8 flex-1 bg-primary" aria-hidden="true"></span>
                      </div>
                      <div class="mt-6 grid gap-8 sm:grid-cols-2">
                        @if (inclusionLines().length) {
                          <div>
                            <h3 class="text-sm font-bold uppercase tracking-[0.12em] text-foreground">Included</h3>
                            <ul class="mt-4 space-y-3">
                              @for (line of inclusionLines(); track line) {
                                <li class="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                                  <svg lucideCheck class="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true"></svg>
                                  <span>{{ line }}</span>
                                </li>
                              }
                            </ul>
                          </div>
                        }
                        @if (exclusionLines().length) {
                          <div>
                            <h3 class="text-sm font-bold uppercase tracking-[0.12em] text-foreground">Not included</h3>
                            <ul class="mt-4 space-y-3">
                              @for (line of exclusionLines(); track line) {
                                <li class="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                                  <svg lucideX class="mt-0.5 h-4 w-4 shrink-0 text-foreground/45" aria-hidden="true"></svg>
                                  <span>{{ line }}</span>
                                </li>
                              }
                            </ul>
                          </div>
                        }
                      </div>
                    </section>
                  }

                  @if (bringLines().length || knowLines().length) {
                    <section aria-labelledby="listing-practical">
                      <div class="flex items-center gap-4">
                        <h2 id="listing-practical" class="shrink-0 font-display text-2xl text-foreground sm:text-3xl">
                          Practical details
                        </h2>
                        <span class="h-px min-w-8 flex-1 bg-primary" aria-hidden="true"></span>
                      </div>
                      <div class="mt-6 space-y-8">
                        @if (bringLines().length) {
                          <div>
                            <h3 class="text-sm font-bold uppercase tracking-[0.12em] text-foreground">What to bring</h3>
                            <ul class="mt-4 grid gap-3 sm:grid-cols-2">
                              @for (line of bringLines(); track line) {
                                <li class="border-t border-hairline pt-3 text-sm leading-relaxed text-muted-foreground">
                                  {{ line }}
                                </li>
                              }
                            </ul>
                          </div>
                        }
                        @if (knowLines().length) {
                          <div>
                            <h3 class="text-sm font-bold uppercase tracking-[0.12em] text-foreground">Good to know</h3>
                            <ul class="mt-4 space-y-3">
                              @for (line of knowLines(); track line) {
                                <li class="text-sm leading-relaxed text-muted-foreground">{{ line }}</li>
                              }
                            </ul>
                          </div>
                        }
                      </div>
                    </section>
                  }

                  @if (galleryImages().length) {
                    <section aria-labelledby="listing-gallery">
                      <div class="flex items-center gap-4">
                        <h2 id="listing-gallery" class="shrink-0 font-display text-2xl text-foreground sm:text-3xl">
                          Gallery
                        </h2>
                        <span class="h-px min-w-8 flex-1 bg-primary" aria-hidden="true"></span>
                      </div>
                      <ul class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4">
                        @for (image of galleryImages(); track image.url; let i = $index) {
                          <li
                            class="listing-gallery-item overflow-hidden bg-ink"
                            [class]="i === 0 && galleryImages().length > 2 ? 'sm:col-span-2' : ''"
                          >
                            <img
                              [src]="image.url"
                              [alt]="image.alt_text || listing()!.name"
                              loading="lazy"
                              class="w-full object-cover"
                              [class]="i === 0 && galleryImages().length > 2 ? 'aspect-[16/10] sm:aspect-[21/9]' : 'aspect-[16/10]'"
                            />
                            @if (image.caption) {
                              <p class="bg-background px-1 py-2 text-sm text-muted-foreground">{{ image.caption }}</p>
                            }
                          </li>
                        }
                      </ul>
                    </section>
                  }
                </div>

                <aside class="lg:sticky lg:top-28 lg:self-start">
                  <div class="border border-hairline bg-ink px-6 py-7 text-ink-foreground sm:px-7">
                    <p class="text-xs font-bold uppercase tracking-[0.14em] text-primary">Request this</p>
                    <h2 class="mt-3 font-display text-2xl leading-snug">Add it to your trip plan</h2>
                    @if (listing()!.booking_instructions) {
                      <p class="mt-4 text-sm leading-relaxed text-ink-foreground/75">
                        {{ listing()!.booking_instructions }}
                      </p>
                    } @else {
                      <p class="mt-4 text-sm leading-relaxed text-ink-foreground/75">
                        Tell us when you’d like to go and we’ll confirm availability, pricing and the practical details.
                      </p>
                    }

                    @if (listing()!.booking_hours.length) {
                      <div class="mt-7 border-t border-white/15 pt-6">
                        <h3 class="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em]">
                          <svg lucideCalendarClock class="h-4 w-4 text-primary" aria-hidden="true"></svg>
                          Availability
                        </h3>
                        <ul class="mt-4 space-y-2.5">
                          @for (hour of listing()!.booking_hours; track hour.day_of_week + '-' + (hour.start_time ?? '')) {
                            <li class="flex items-baseline justify-between gap-4 text-sm">
                              <span class="text-ink-foreground/80">{{ hour.day_name }}</span>
                              <span class="tabular-nums text-ink-foreground">
                                {{ formatHourRange(hour.start_time, hour.end_time, hour.end_day_offset) }}
                              </span>
                            </li>
                          }
                        </ul>
                      </div>
                    }

                    @if (ruleFacts().length) {
                      <div class="mt-7 border-t border-white/15 pt-6">
                        <h3 class="text-sm font-bold uppercase tracking-[0.12em]">Booking notes</h3>
                        <dl class="mt-4 space-y-3">
                          @for (fact of ruleFacts(); track fact.label) {
                            <div>
                              <dt class="text-xs uppercase tracking-[0.1em] text-ink-foreground/55">{{ fact.label }}</dt>
                              <dd class="mt-1 text-sm text-ink-foreground">{{ fact.value }}</dd>
                            </div>
                          }
                        </dl>
                      </div>
                    }

                    <a
                      routerLink="/waitlist/join"
                      class="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-primary px-5 text-sm font-bold uppercase tracking-[0.08em] text-primary-foreground transition hover:bg-primary/90"
                    >
                      Plan My Trip
                      <svg lucideArrowRight class="h-4 w-4" aria-hidden="true"></svg>
                    </a>
                  </div>
                </aside>
              </div>
            </div>
          </article>
        }
      </main>
      <kn-site-footer />
    </div>
  `,
})
export class DiscoverListingPage {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ListingsApiService);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  private readonly query = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  protected readonly listing = signal<ListingDetail | null>(null);
  protected readonly loadError = signal(false);
  protected readonly slug = computed(() => this.params().get('slug') ?? '');
  protected readonly backQuery = computed(() => ({
    interest: this.query().get('interest'),
    type: this.query().get('type'),
    location: this.query().get('location'),
    page: this.query().get('page'),
  }));
  protected readonly crumbs = computed<GuideCrumb[]>(() => [
    { label: 'Discover', link: '/discover' },
    { label: 'Catalogue', link: '/discover/catalogue', queryParams: this.backQuery() },
    { label: this.listing()?.name || 'Listing' },
  ]);
  protected readonly placeLine = computed(() => {
    const listing = this.listing();
    if (!listing) {
      return '';
    }
    return [listing.geographic_area_name, listing.subcategory_name, listing.category_name]
      .filter((part): part is string => !!part)
      .join(' · ');
  });
  protected readonly inclusionLines = computed(() => this.splitLines(this.listing()?.inclusions));
  protected readonly exclusionLines = computed(() => this.splitLines(this.listing()?.exclusions));
  protected readonly bringLines = computed(() => this.splitLines(this.listing()?.what_to_bring));
  protected readonly knowLines = computed(() => this.splitLines(this.listing()?.important_information));
  protected readonly galleryImages = computed(() => {
    const listing = this.listing();
    if (!listing) {
      return [] as ListingGalleryImage[];
    }
    const extras = listing.gallery.filter((image) => image.url !== listing.cover?.url);
    return extras.length ? extras : listing.gallery;
  });
  protected readonly ruleFacts = computed(() => {
    const rule = this.listing()?.booking_rule;
    if (!rule) {
      return [] as { label: string; value: string }[];
    }
    const facts: { label: string; value: string }[] = [];
    if (rule.minimum_notice_minutes != null) {
      facts.push({ label: 'Minimum notice', value: this.formatMinutes(rule.minimum_notice_minutes) });
    }
    if (rule.maximum_advance_days != null) {
      facts.push({
        label: 'Book up to',
        value: `${rule.maximum_advance_days} day${rule.maximum_advance_days === 1 ? '' : 's'} ahead`,
      });
    }
    if (rule.earliest_arrival_time || rule.latest_arrival_time) {
      facts.push({
        label: 'Arrival window',
        value: [rule.earliest_arrival_time, rule.latest_arrival_time].filter(Boolean).join(' – '),
      });
    }
    return facts;
  });

  constructor() {
    effect((onCleanup) => {
      const slug = this.slug();
      this.listing.set(null);
      this.loadError.set(false);
      if (!slug) {
        this.loadError.set(true);
        return;
      }

      const subscription = this.api.show(slug).subscribe({
        next: (response) => this.listing.set(this.normalizeDetail(response.data)),
        error: () => this.loadError.set(true),
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  protected durationLabel(option: ListingOption): string | null {
    if (option.duration_minutes == null) {
      return null;
    }
    return this.formatMinutes(option.duration_minutes);
  }

  protected partyLabel(option: ListingOption): string | null {
    const min = option.min_participants;
    const max = option.max_participants;
    if (min == null && max == null) {
      return null;
    }
    if (min != null && max != null) {
      if (min === max) {
        return `${min} guest${min === 1 ? '' : 's'}`;
      }
      return `${min}–${max} guests`;
    }
    if (min != null) {
      return `From ${min} guest${min === 1 ? '' : 's'}`;
    }
    return `Up to ${max} guests`;
  }

  protected formatHourRange(start: string | null, end: string | null, endDayOffset: number): string {
    const range = [start, end].filter(Boolean).join(' – ');
    return endDayOffset > 0 ? `${range} (+1)` : range;
  }

  private normalizeDetail(detail: ListingDetail): ListingDetail {
    return {
      ...detail,
      tags: detail.tags ?? [],
      options: detail.options ?? [],
      booking_hours: detail.booking_hours ?? [],
      booking_rule: detail.booking_rule ?? null,
      gallery: detail.gallery ?? [],
    };
  }

  private splitLines(value: string | null | undefined): string[] {
    if (!value) {
      return [];
    }
    return value
      .split(/\r?\n|,/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  private formatMinutes(total: number): string {
    if (total < 60) {
      return `${total} min`;
    }
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    if (minutes === 0) {
      return `${hours} hr${hours === 1 ? '' : 's'}`;
    }
    return `${hours} hr${hours === 1 ? '' : 's'} ${minutes} min`;
  }
}
