import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { LucideDynamicIcon, LucideArrowRight, LucideLeaf } from '@lucide/angular';
import { RouterLink } from '@angular/router';
import { DISCOVER_THEMES, DISCOVER_TYPES } from './discover-options';
import { SiteHeaderComponent } from '../site/site-header.component';
import { SiteFooterComponent } from '../site/site-footer.component';
import { ListingsApiService } from '../core/services/listings-api.service';
import { ListingCard } from '../core/models/listing.model';
import { DiscoverHotPickCardComponent } from './discover-hot-pick-card.component';

@Component({
  selector: 'kn-discover-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SiteHeaderComponent,
    SiteFooterComponent,
    LucideDynamicIcon,
    RouterLink,
    DiscoverHotPickCardComponent,
  ],
  template: `
    <div class="flex min-h-screen flex-col bg-background">
      <kn-site-header [lightBackground]="true" />
      <main class="flex-1">
        <div class="mx-auto max-w-[1400px] px-5 pb-14 pt-28 sm:px-8 sm:pb-20 sm:pt-32">
          <header class="mb-8">
            <h1 class="text-center font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl">
              Your adventure awaits
            </h1>
            <p class="mt-5 text-center text-base leading-relaxed text-muted-foreground">
              <strong class="font-bold text-foreground">Discover Uganda your way.</strong>
            </p>
            <p class="mt-3 text-left text-base leading-relaxed text-muted-foreground">
              Bookmark something for later, or Add to Trip when you want to include it in your plans.
              When you’re ready, Plan My Trip <br>brings everything together so we can work through
              dates, availability, pricing and the practical details.
            </p>
          </header>

          <section class="mt-8" aria-labelledby="discover-themes-heading">
            <h2 id="discover-themes-heading" class="font-display text-2xl text-foreground sm:text-3xl">
              Explore by interests
            </h2>
            <ul class="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
              @for (theme of themes; track theme.label) {
                <li class="relative isolate flex min-h-36 min-w-0 overflow-hidden rounded-lg bg-ink text-white sm:min-h-40">
                  <img
                    [src]="'/img/originals/' + theme.image + '.png'"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    class="absolute inset-0 -z-20 h-full w-full object-cover object-center"
                  />
                  <div class="absolute inset-0 -z-10 bg-black/55" aria-hidden="true"></div>
                  <a routerLink="/discover/catalogue" [queryParams]="{ interest: theme.label }" class="relative flex w-full focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white items-center justify-center gap-1 px-1 py-9 text-center sm:gap-3 sm:px-4">
                    <svg lucideIcon [lucideIcon]="theme.icon" class="h-5 w-5 shrink-0 sm:h-9 sm:w-9" aria-hidden="true"></svg>
                    <h3 class="min-w-0 flex-1 whitespace-normal text-base font-normal leading-snug">
                      @if (theme.label === 'Music, Nightlife & Entertainment') {
                        <span class="whitespace-nowrap">Music, Nightlife &amp;</span><br />Entertainment
                      } @else {
                        {{ theme.label }}
                      }
                    </h3>
                    <svg lucideIcon [lucideIcon]="arrowIcon" class="absolute bottom-3 right-3 h-5 w-5 text-white sm:right-4" aria-hidden="true"></svg>
                  </a>
                </li>
              }
            </ul>
          </section>

          <section class="mt-8" aria-labelledby="discover-types-heading">
            <h2 id="discover-types-heading" class="font-display text-2xl text-foreground sm:text-3xl">
              Browse by type
            </h2>
            <p class="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Looking for something specific? Explore our bookable options
            </p>
            <div class="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4">
              @for (type of listingTypes; track type.label) {
                <a
                  routerLink="/discover/catalogue"
                  [queryParams]="{ type: type.label }"
                  class="relative flex min-h-36 min-w-0 items-center justify-center gap-1 rounded-xl bg-muted px-2 py-9 text-center text-base font-normal leading-relaxed text-foreground sm:px-4"
                >
                  <svg lucideIcon [lucideIcon]="type.icon" class="h-5 w-5 shrink-0 text-emerald-950 sm:h-9 sm:w-9" aria-hidden="true"></svg>
                  <span class="min-w-0 flex-1 whitespace-normal">{{ type.label }}</span>
                  <svg lucideIcon [lucideIcon]="arrowIcon" class="absolute bottom-3 right-3 h-5 w-5 text-foreground sm:right-4" aria-hidden="true"></svg>
                </a>
              }
            </div>
          </section>

          @if (hotPicks().length) {
            <section class="mt-10" aria-labelledby="discover-hot-picks-heading">
              <div class="flex flex-wrap items-end justify-between gap-3">
                <h2 id="discover-hot-picks-heading" class="font-display text-2xl text-foreground sm:text-3xl">
                  Hot Picks In
                  <span class="text-primary">Kampala</span>
                  <svg
                    lucideIcon
                    [lucideIcon]="leafIcon"
                    class="ml-1 inline-block h-5 w-5 align-[-0.15em] text-primary sm:h-6 sm:w-6"
                    aria-hidden="true"
                  ></svg>
                </h2>
                <a routerLink="/discover/catalogue" class="text-sm font-bold text-primary underline underline-offset-4">
                  See the catalogue
                </a>
              </div>

              <div class="relative mt-6">
                <div
                  #hotPicksTrack
                  class="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  (scroll)="onHotPicksScroll()"
                >
                  @for (listing of hotPicks(); track listing.id) {
                    <div class="w-[85%] shrink-0 snap-start sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.7rem)] xl:w-[calc(25%-0.75rem)]">
                      <kn-discover-hot-pick-card [listing]="listing" />
                    </div>
                  }
                </div>

                @if (hotPickDots().length > 1) {
                  <div class="mt-5 flex items-center justify-center gap-2" role="tablist" aria-label="Hot Picks slides">
                    @for (dot of hotPickDots(); track $index) {
                      <button
                        type="button"
                        role="tab"
                        class="h-2.5 rounded-full transition-all duration-300"
                        [class]="
                          $index === activeHotPickDot()
                            ? 'w-6 bg-primary'
                            : 'w-2.5 bg-primary/25 hover:bg-primary/45'
                        "
                        [attr.aria-selected]="$index === activeHotPickDot()"
                        [attr.aria-label]="'Go to slide ' + ($index + 1)"
                        (click)="scrollHotPicksTo($index)"
                      ></button>
                    }
                  </div>
                }
              </div>
            </section>
          }
        </div>
      </main>
      <kn-site-footer />
    </div>
  `,
})
export class DiscoverPage {
  private readonly api = inject(ListingsApiService);
  private readonly hotPicksTrack = viewChild<ElementRef<HTMLElement>>('hotPicksTrack');

  // Editorial discovery themes, independent of the internal catalogue taxonomy.
  protected readonly themes = DISCOVER_THEMES;
  protected readonly arrowIcon = LucideArrowRight.icon;
  protected readonly leafIcon = LucideLeaf.icon;
  protected readonly listingTypes = DISCOVER_TYPES;
  protected readonly hotPicks = signal<ListingCard[]>([]);
  protected readonly activeHotPickDot = signal(0);
  protected readonly hotPickDots = signal<number[]>([]);

  constructor() {
    const subscription = this.api.list({ hot_pick: true, per_page: 8 }).subscribe({
      next: (page) => {
        this.hotPicks.set(page.data);
        queueMicrotask(() => this.syncHotPickDots());
      },
      error: () => this.hotPicks.set([]),
    });
    inject(DestroyRef).onDestroy(() => subscription.unsubscribe());

    afterNextRender(() => {
      this.syncHotPickDots();
      window.addEventListener('resize', this.onResize, { passive: true });
    });

    inject(DestroyRef).onDestroy(() => {
      window.removeEventListener('resize', this.onResize);
    });
  }

  private readonly onResize = (): void => {
    this.syncHotPickDots();
    this.onHotPicksScroll();
  };

  protected onHotPicksScroll(): void {
    const el = this.hotPicksTrack()?.nativeElement;
    if (!el || !this.hotPicks().length) {
      return;
    }
    const card = el.querySelector<HTMLElement>(':scope > div');
    if (!card) {
      return;
    }
    const step = card.offsetWidth + 16;
    const index = Math.round(el.scrollLeft / step);
    this.activeHotPickDot.set(Math.max(0, Math.min(index, this.hotPickDots().length - 1)));
  }

  protected scrollHotPicksTo(index: number): void {
    const el = this.hotPicksTrack()?.nativeElement;
    if (!el) {
      return;
    }
    const card = el.querySelector<HTMLElement>(':scope > div');
    if (!card) {
      return;
    }
    const step = card.offsetWidth + 16;
    el.scrollTo({ left: step * index, behavior: 'smooth' });
    this.activeHotPickDot.set(index);
  }

  private syncHotPickDots(): void {
    const count = this.hotPicks().length;
    this.hotPickDots.set(Array.from({ length: count }, (_, i) => i));
    this.onHotPicksScroll();
  }
}
