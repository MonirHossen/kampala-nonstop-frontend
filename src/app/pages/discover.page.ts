import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { LucideDynamicIcon, LucideArrowRight } from '@lucide/angular';
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
            <div class="flex items-center gap-4">
              <h2 id="discover-themes-heading" class="shrink-0 font-display text-2xl text-foreground sm:text-3xl">
                Explore by <span class="text-primary">Interests</span>
              </h2>
              <span class="h-px min-w-8 flex-1 bg-primary" aria-hidden="true"></span>
            </div>
            <ul class="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
              @for (theme of themes; track theme.label) {
                <li class="group relative isolate flex min-h-36 min-w-0 overflow-hidden rounded-lg bg-ink text-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_28px_-16px_rgba(40,28,16,0.55)] sm:min-h-40">
                  <img
                    [src]="'/img/originals/' + theme.image + '.png'"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    class="absolute inset-0 -z-20 h-full w-full object-cover object-center transition duration-700 ease-out group-hover:scale-110"
                  />
                  <div class="absolute inset-0 -z-10 bg-black/55 transition duration-300 group-hover:bg-black/40" aria-hidden="true"></div>
                  <div class="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-primary/35 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" aria-hidden="true"></div>
                  <a routerLink="/discover/catalogue" [queryParams]="{ interest: theme.label }" class="relative flex w-full focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white items-center justify-center gap-1 px-1 py-9 text-center sm:gap-3 sm:px-4">
                    <svg lucideIcon [lucideIcon]="theme.icon" class="h-5 w-5 shrink-0 transition duration-300 group-hover:scale-110 sm:h-9 sm:w-9" aria-hidden="true"></svg>
                    <h3 class="min-w-0 flex-1 whitespace-normal text-base font-normal leading-snug">
                      @if (theme.label === 'Music, Nightlife & Entertainment') {
                        <span class="whitespace-nowrap">Music, Nightlife &amp;</span><br />Entertainment
                      } @else {
                        {{ theme.label }}
                      }
                    </h3>
                    <svg lucideIcon [lucideIcon]="arrowIcon" class="absolute bottom-3 right-3 h-5 w-5 text-white transition duration-300 group-hover:translate-x-1 group-hover:text-primary sm:right-4" aria-hidden="true"></svg>
                  </a>
                </li>
              }
            </ul>
          </section>

          <section class="mt-8" aria-labelledby="discover-types-heading">
            <div class="flex items-center gap-4">
              <h2 id="discover-types-heading" class="shrink-0 font-display text-2xl text-foreground sm:text-3xl">
                Browse by <span class="text-primary">Type</span>
              </h2>
              <span class="h-px min-w-8 flex-1 bg-primary" aria-hidden="true"></span>
            </div>
            <p class="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Looking for something specific? Explore our bookable options
            </p>
            <div class="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4">
              @for (type of listingTypes; track type.label) {
                <a
                  routerLink="/discover/catalogue"
                  [queryParams]="{ type: type.label }"
                  [class]="
                    'group relative flex min-h-44 min-w-0 flex-col justify-end gap-2 rounded-lg px-3 py-5 transition duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-h-52 sm:px-4 sm:py-6 ' +
                    type.tileClass
                  "
                >
                  <svg
                    lucideIcon
                    [lucideIcon]="type.icon"
                    [class]="'h-7 w-7 shrink-0 sm:h-8 sm:w-8 ' + type.iconClass"
                    aria-hidden="true"
                  ></svg>
                  <span class="font-display text-lg font-normal leading-snug sm:text-xl">{{ type.label }}</span>
                  <span [class]="'text-sm leading-snug ' + type.blurbClass">{{ type.blurb }}</span>
                  <svg
                    lucideIcon
                    [lucideIcon]="arrowIcon"
                    [class]="
                      'absolute bottom-3 right-3 h-5 w-5 opacity-80 transition group-hover:translate-x-0.5 sm:bottom-4 sm:right-4 ' +
                      type.iconClass
                    "
                    aria-hidden="true"
                  ></svg>
                </a>
              }
            </div>
          </section>

          @if (hotPicks().length) {
            <section class="mt-10" aria-labelledby="discover-hot-picks-heading">
              <div class="flex flex-wrap items-center gap-4">
                <h2 id="discover-hot-picks-heading" class="shrink-0 font-display text-2xl text-foreground sm:text-3xl">
                  Hot Picks In <span class="text-primary">Kampala</span>
                </h2>
                <span class="h-px min-w-8 flex-1 bg-primary" aria-hidden="true"></span>
                <a routerLink="/discover/catalogue" class="shrink-0 text-sm font-bold text-primary underline underline-offset-4">
                  See the catalogue
                </a>
              </div>

              <div
                class="relative mt-6"
                (mouseenter)="pauseAutoplay()"
                (mouseleave)="resumeAutoplay()"
              >
                <div class="overflow-hidden">
                  <div
                    class="flex transition-transform duration-700 ease-out motion-reduce:transition-none"
                    [style.transform]="trackTransform()"
                  >
                    @for (page of hotPickPages(); track $index) {
                      <div
                        class="grid w-full shrink-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        [attr.aria-hidden]="$index === activePage() ? null : true"
                      >
                        @for (listing of page; track listing.id) {
                          <kn-discover-hot-pick-card [listing]="listing" />
                        }
                      </div>
                    }
                  </div>
                </div>

                @if (hotPickPages().length > 1) {
                  <div class="mt-5 flex items-center justify-center gap-2" role="tablist" aria-label="Hot Picks slides">
                    @for (page of hotPickPages(); track $index) {
                      <button
                        type="button"
                        role="tab"
                        class="h-2.5 rounded-full transition-all duration-300"
                        [class]="
                          $index === activePage()
                            ? 'w-6 bg-primary'
                            : 'w-2.5 bg-primary/25 hover:bg-primary/45'
                        "
                        [attr.aria-selected]="$index === activePage()"
                        [attr.aria-label]="'Go to Hot Picks slide ' + ($index + 1)"
                        (click)="goToPage($index)"
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly autoplayMs = 4000;
  private autoplayTimer: ReturnType<typeof setInterval> | null = null;
  private paused = false;

  // Editorial discovery themes, independent of the internal catalogue taxonomy.
  protected readonly themes = DISCOVER_THEMES;
  protected readonly arrowIcon = LucideArrowRight.icon;
  protected readonly listingTypes = DISCOVER_TYPES;
  protected readonly hotPicks = signal<ListingCard[]>([]);
  protected readonly activePage = signal(0);
  protected readonly viewportWidth = signal(typeof window !== 'undefined' ? window.innerWidth : 1280);

  protected readonly perPage = computed(() => {
    const width = this.viewportWidth();
    if (width >= 1280) {
      return 4;
    }
    if (width >= 1024) {
      return 3;
    }
    if (width >= 640) {
      return 2;
    }
    return 1;
  });

  protected readonly hotPickPages = computed(() => {
    const items = this.hotPicks();
    const size = this.perPage();
    const pages: ListingCard[][] = [];
    for (let i = 0; i < items.length; i += size) {
      pages.push(items.slice(i, i + size));
    }
    return pages;
  });

  protected readonly trackTransform = computed(
    () => `translateX(-${this.activePage() * 100}%)`,
  );

  constructor() {
    const subscription = this.api.list({ hot_pick: true, per_page: 12 }).subscribe({
      next: (page) => {
        this.hotPicks.set(page.data);
        this.activePage.set(0);
        this.startAutoplay();
      },
      error: () => {
        this.hotPicks.set([]);
        this.stopAutoplay();
      },
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());

    afterNextRender(() => {
      this.viewportWidth.set(window.innerWidth);
      window.addEventListener('resize', this.onResize, { passive: true });
      this.startAutoplay();
    });

    this.destroyRef.onDestroy(() => {
      this.stopAutoplay();
      window.removeEventListener('resize', this.onResize);
    });
  }

  private readonly onResize = (): void => {
    const previous = this.perPage();
    this.viewportWidth.set(window.innerWidth);
    if (this.perPage() !== previous) {
      this.activePage.set(0);
    }
    const max = Math.max(0, this.hotPickPages().length - 1);
    if (this.activePage() > max) {
      this.activePage.set(max);
    }
  };

  protected goToPage(page: number): void {
    const max = Math.max(0, this.hotPickPages().length - 1);
    this.activePage.set(Math.max(0, Math.min(page, max)));
    this.pauseAutoplay();
    this.resumeAutoplay();
  }

  protected pauseAutoplay(): void {
    this.paused = true;
    this.stopAutoplay();
  }

  protected resumeAutoplay(): void {
    this.paused = false;
    this.startAutoplay();
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    if (this.paused || this.hotPickPages().length <= 1) {
      return;
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    this.autoplayTimer = setInterval(() => {
      const pages = this.hotPickPages().length;
      if (pages <= 1) {
        return;
      }
      this.activePage.set((this.activePage() + 1) % pages);
    }, this.autoplayMs);
  }

  private stopAutoplay(): void {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }
}
