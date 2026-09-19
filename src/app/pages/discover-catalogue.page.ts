import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SiteHeaderComponent } from '../site/site-header.component';
import { SiteFooterComponent } from '../site/site-footer.component';
import { GuideBreadcrumbComponent, GuideCrumb } from '../guide/components/guide-breadcrumb.component';
import { DISCOVER_THEMES, DISCOVER_TYPES } from './discover-options';

type FilterKey = 'interest' | 'location' | 'type';

@Component({
  selector: 'kn-discover-catalogue-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiteHeaderComponent, SiteFooterComponent, GuideBreadcrumbComponent, RouterLink, FormsModule],
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
          <section class="mt-5 rounded-xl border border-hairline bg-paper p-6 sm:p-8" aria-labelledby="catalogue-empty-heading">
            <h2 id="catalogue-empty-heading" class="font-display text-2xl text-foreground">The catalogue is coming soon</h2>
            <p class="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
              Listings are not available here yet. You can choose your interests, location and type;
              your selections stay in this page’s link for your next visit.
            </p>
            <a routerLink="/discover" class="mt-6 inline-flex min-h-11 items-center font-bold text-primary underline underline-offset-4">Back to Discover</a>
          </section>
        </div>
      </main>
      <kn-site-footer />
    </div>
  `,
})
export class DiscoverCataloguePage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly params = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  protected readonly themes = DISCOVER_THEMES;
  protected readonly types = DISCOVER_TYPES;
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
    return value === null || value === 'Kampala' ? 'Kampala' : '';
  });
  protected readonly crumbs = computed<GuideCrumb[]>(() => [
    { label: 'Discover', link: '/discover' },
    { label: this.interest() || 'Catalogue' },
  ]);
  protected readonly activeFilters = computed(() => [
    { key: 'interest' as const, label: this.interest() },
    { key: 'location' as const, label: this.location() },
    { key: 'type' as const, label: this.listingType() },
  ].filter((filter) => filter.label));
  protected readonly resultContext = computed(() =>
    [this.listingType() || 'All Types', this.location() || 'All locations', this.interest()]
      .filter(Boolean).join(' · ') + ' — listings not yet available',
  );

  protected setFilter(key: FilterKey, value: string): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { interest: this.interest() || null, type: this.listingType() || null, location: this.location(), [key]: value || (key === 'location' ? '' : null) },
    });
  }

  protected clearAll(): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: { location: '' } });
  }
}
