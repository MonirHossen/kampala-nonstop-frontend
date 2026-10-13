import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SiteHeaderComponent } from '../site/site-header.component';
import { SiteFooterComponent } from '../site/site-footer.component';
import { GuideBreadcrumbComponent, GuideCrumb } from '../guide/components/guide-breadcrumb.component';
import { DISCOVER_THEMES, DISCOVER_TYPES } from './discover-options';
import { ListingsApiService } from '../core/services/listings-api.service';
import { ListingCard } from '../core/models/listing.model';
import { DiscoverListingCardComponent } from './discover-listing-card.component';

type FilterKey = 'interest' | 'location' | 'type';

@Component({
  selector: 'kn-discover-catalogue-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SiteHeaderComponent,
    SiteFooterComponent,
    GuideBreadcrumbComponent,
    RouterLink,
    FormsModule,
    DiscoverListingCardComponent,
  ],
  template: `
    <div class="flex min-h-screen flex-col bg-background">
      <kn-site-header [lightBackground]="true" />
      <main class="flex-1 pb-14 sm:pb-20">
        <header class="mx-auto max-w-[1400px] px-5 pb-8 pt-28 sm:px-8 sm:pt-32">
          <kn-guide-breadcrumb [crumbs]="crumbs()" />
          <h1 class="mt-6 font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            {{ interest() || 'Discover Uganda' }}
          </h1>
          <p class="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Explore what interests you and refine your choices by location and type.
          </p>
        </header>

        <nav aria-label="Catalogue filters" class="sticky top-14 z-30 border-y border-hairline bg-background/95 backdrop-blur-sm">
          <div class="mx-auto flex max-w-[1400px] gap-3 overflow-x-auto px-5 py-4 sm:px-8">
            <div class="shrink-0">
              <label for="catalogue-location" class="eyebrow text-muted-foreground">Location</label>
              <select id="catalogue-location" [ngModel]="location()" (ngModelChange)="setFilter('location', $event)"
                class="mt-2 block max-w-48 rounded-lg border border-hairline bg-paper px-3 py-3 text-sm text-foreground focus:border-primary">
                <option value="">All locations</option>
                <option value="Kampala">Kampala</option>
              </select>
            </div>
            <div class="shrink-0">
              <label for="catalogue-type" class="eyebrow text-muted-foreground">Type</label>
              <select id="catalogue-type" [ngModel]="listingType()" (ngModelChange)="setFilter('type', $event)"
                class="mt-2 block max-w-48 rounded-lg border border-hairline bg-paper px-3 py-3 text-sm text-foreground focus:border-primary">
                <option value="">All Types</option>
                @for (type of types; track type.label) {
                  <option [value]="type.label">{{ type.label }}</option>
                }
              </select>
            </div>
            <div class="shrink-0">
              <label for="catalogue-interest" class="eyebrow text-muted-foreground">Interest</label>
              <select id="catalogue-interest" [ngModel]="interest()" (ngModelChange)="setFilter('interest', $event)"
                class="mt-2 block max-w-56 rounded-lg border border-hairline bg-paper px-3 py-3 text-sm text-foreground focus:border-primary">
                <option value="">All interests</option>
                @for (theme of themes; track theme.label) {
                  <option [value]="theme.label">{{ theme.label }}</option>
                }
              </select>
            </div>
          </div>
        </nav>

        <div class="mx-auto max-w-[1400px] px-5 pt-6 sm:px-8">
          @if (activeFilters().length) {
            <div class="flex flex-wrap items-center gap-2" aria-label="Active filters">
              @for (filter of activeFilters(); track filter.key) {
                <button type="button" (click)="setFilter(filter.key, '')"
                  [attr.aria-label]="'Remove ' + filter.label + ' filter'"
                  class="inline-flex min-h-11 items-center gap-3 rounded-full border border-hairline bg-paper px-4 py-2 text-sm text-foreground hover:border-primary focus-visible:outline-primary">
                  {{ filter.label }} <span aria-hidden="true">×</span>
                </button>
              }
              @if (activeFilters().length > 1) {
                <button type="button" (click)="clearAll()" class="min-h-11 px-3 text-sm font-bold text-primary underline underline-offset-4">Clear all</button>
              }
            </div>
          }
          <p class="mt-6 text-sm text-muted-foreground" role="status">{{ resultContext() }}</p>

          @if (loadError()) {
            <section class="mt-8 max-w-2xl" aria-labelledby="catalogue-error-heading">
              <h2 id="catalogue-error-heading" class="font-display text-2xl text-foreground">Listings could not be loaded</h2>
              <p class="mt-3 leading-relaxed text-muted-foreground">
                The catalogue is unavailable right now. Your filters stay in this page’s link.
              </p>
              <button type="button" (click)="retry()" class="mt-6 inline-flex min-h-11 items-center font-bold text-primary underline underline-offset-4">Try again</button>
            </section>
          } @else if (listings() === null) {
            <ul class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4" aria-hidden="true">
              @for (slot of skeletons; track slot) {
                <li class="min-h-56 animate-pulse rounded-lg bg-muted sm:min-h-64"></li>
              }
            </ul>
          } @else if (listings()!.length === 0) {
            <section class="mt-8 max-w-2xl" aria-labelledby="catalogue-empty-heading">
              <h2 id="catalogue-empty-heading" class="font-display text-2xl text-foreground">Nothing matches these filters</h2>
              <p class="mt-3 leading-relaxed text-muted-foreground">
                Try another type or interest, or clear the filters to see everything currently published.
              </p>
              <div class="mt-6 flex flex-wrap gap-4">
                <button type="button" (click)="clearAll()" class="inline-flex min-h-11 items-center font-bold text-primary underline underline-offset-4">Clear filters</button>
                <a routerLink="/discover" class="inline-flex min-h-11 items-center font-bold text-primary underline underline-offset-4">Back to Discover</a>
              </div>
            </section>
          } @else {
            <ul class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
              @for (listing of listings(); track listing.id) {
                <li class="min-w-0">
                  <kn-discover-listing-card [listing]="listing" [queryParams]="catalogueQuery()" />
                </li>
              }
            </ul>
            @if (lastPage() > 1) {
              <nav class="mt-10 flex items-center justify-between gap-4" aria-label="Catalogue pages">
                <button type="button" (click)="setPage(page() - 1)" [disabled]="page() <= 1"
                  class="min-h-11 text-sm font-bold text-primary underline underline-offset-4 disabled:no-underline disabled:opacity-40">
                  Previous
                </button>
                <p class="text-sm text-muted-foreground">Page {{ page() }} of {{ lastPage() }}</p>
                <button type="button" (click)="setPage(page() + 1)" [disabled]="page() >= lastPage()"
                  class="min-h-11 text-sm font-bold text-primary underline underline-offset-4 disabled:no-underline disabled:opacity-40">
                  Next
                </button>
              </nav>
            }
          }
        </div>
      </main>
      <kn-site-footer />
    </div>
  `,
})
export class DiscoverCataloguePage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ListingsApiService);
  private readonly params = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  private readonly retryTick = signal(0);
  protected readonly themes = DISCOVER_THEMES;
  protected readonly types = DISCOVER_TYPES;
  protected readonly skeletons = [1, 2, 3, 4, 5, 6];
  protected readonly listings = signal<ListingCard[] | null>(null);
  protected readonly total = signal(0);
  protected readonly lastPage = signal(1);
  protected readonly loadError = signal(false);
  protected readonly interest = computed(() => {
    const value = this.params().get('interest');
    return this.themes.find((theme) => theme.label === value)?.label ?? '';
  });
  protected readonly listingType = computed(() => {
    const value = this.params().get('type');
    return this.types.find((type) => type.label === value)?.label ?? '';
  });
  protected readonly location = computed(() => {
    const value = this.params().get('location');
    return value === 'Kampala' ? 'Kampala' : '';
  });
  protected readonly page = computed(() => {
    const value = Number(this.params().get('page'));
    return Number.isInteger(value) && value > 1 ? value : 1;
  });
  protected readonly crumbs = computed<GuideCrumb[]>(() => [
    { label: 'Discover', link: '/discover' },
    { label: this.interest() || this.listingType() || 'Catalogue' },
  ]);
  protected readonly activeFilters = computed(() => [
    { key: 'interest' as const, label: this.interest() },
    { key: 'location' as const, label: this.location() },
    { key: 'type' as const, label: this.listingType() },
  ].filter((filter) => filter.label));
  protected readonly catalogueQuery = computed(() => ({
    interest: this.interest() || null,
    type: this.listingType() || null,
    location: this.location() || null,
    page: this.page() > 1 ? this.page() : null,
  }));
  protected readonly resultContext = computed(() => {
    const filters = [this.listingType() || 'All types', this.location() || 'All locations', this.interest()]
      .filter(Boolean)
      .join(' · ');
    if (this.loadError()) {
      return `${filters} — listings could not be loaded`;
    }
    if (this.listings() === null) {
      return `${filters} — loading`;
    }
    const count = this.total();
    return `${filters} — ${count} ${count === 1 ? 'listing' : 'listings'}`;
  });

  constructor() {
    effect((onCleanup) => {
      const interest = this.interest();
      const type = this.listingType();
      const location = this.location();
      const page = this.page();
      this.retryTick();
      this.listings.set(null);
      this.loadError.set(false);

      const subscription = this.api.list({
        interest: interest || undefined,
        type: type || undefined,
        location: location || undefined,
        page,
        per_page: 12,
      }).subscribe({
        next: (result) => {
          this.listings.set(result.data);
          this.total.set(result.meta.total);
          this.lastPage.set(result.meta.last_page);
        },
        error: () => this.loadError.set(true),
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  protected retry(): void {
    this.retryTick.update((value) => value + 1);
  }

  protected setFilter(key: FilterKey, value: string): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        interest: this.interest() || null,
        type: this.listingType() || null,
        location: this.location() || null,
        page: null,
        [key]: value || null,
      },
    });
  }

  protected setPage(page: number): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        ...this.catalogueQuery(),
        page: page > 1 ? page : null,
      },
    });
  }

  protected clearAll(): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }
}
