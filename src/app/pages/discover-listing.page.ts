import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SiteHeaderComponent } from '../site/site-header.component';
import { SiteFooterComponent } from '../site/site-footer.component';
import { GuideBreadcrumbComponent, GuideCrumb } from '../guide/components/guide-breadcrumb.component';
import { ListingsApiService } from '../core/services/listings-api.service';
import { ListingDetail } from '../core/models/listing.model';

@Component({
  selector: 'kn-discover-listing-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiteHeaderComponent, SiteFooterComponent, GuideBreadcrumbComponent, RouterLink],
  template: `
    <div class="flex min-h-screen flex-col bg-background">
      <kn-site-header [lightBackground]="true" />
      <main class="flex-1 pb-16 sm:pb-24">
        @if (loadError()) {
          <div class="mx-auto max-w-[1400px] px-5 pt-28 sm:px-8 sm:pt-32">
            <kn-guide-breadcrumb [crumbs]="crumbs()" />
            <section class="mt-8 max-w-2xl">
              <h1 class="font-display text-3xl text-foreground">This listing isn’t available</h1>
              <p class="mt-3 leading-relaxed text-muted-foreground">
                It may be unpublished, or the link no longer matches a live listing.
              </p>
              <a routerLink="/discover/catalogue" [queryParams]="backQuery()" class="mt-6 inline-flex min-h-11 items-center font-bold text-primary underline underline-offset-4">Back to catalogue</a>
            </section>
          </div>
        } @else if (!listing()) {
          <div class="mx-auto max-w-[1400px] px-5 pt-28 sm:px-8 sm:pt-32" aria-hidden="true">
            <div class="mt-8 aspect-[4/3] animate-pulse bg-muted sm:aspect-[21/9]"></div>
          </div>
        } @else {
          <article>
            <div class="relative isolate mt-14 min-h-[48vw] overflow-hidden bg-ink text-white sm:mt-14 sm:min-h-[28rem] lg:min-h-[32rem]">
              @if (listing()!.cover) {
                <img
                  [src]="listing()!.cover!.url"
                  [alt]="listing()!.cover!.alt_text || listing()!.name"
                  class="absolute inset-0 -z-20 h-full w-full object-cover object-center"
                />
              }
              <div class="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/35 to-black/20" aria-hidden="true"></div>
              <div class="relative mx-auto flex min-h-[48vw] max-w-[1400px] flex-col justify-end px-5 pb-10 pt-28 sm:min-h-[28rem] sm:px-8 sm:pb-12 lg:min-h-[32rem]">
                <kn-guide-breadcrumb [crumbs]="crumbs()" tone="light" />
                <p class="mt-6 text-xs uppercase tracking-[0.14em] text-white/80">
                  {{ listing()!.listing_type_name }}
                  @if (listing()!.is_hot_pick) {
                    <span aria-hidden="true"> · </span><span>Hot Pick</span>
                  }
                  @if (listing()!.is_local_gem) {
                    <span aria-hidden="true"> · </span><span>Local Gem</span>
                  }
                </p>
                <h1 class="mt-3 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">{{ listing()!.name }}</h1>
                @if (placeLine()) {
                  <p class="mt-3 text-sm text-white/75">{{ placeLine() }}</p>
                }
              </div>
            </div>

            <div class="mx-auto max-w-[1400px] px-5 pt-8 sm:px-8 sm:pt-10">
              @if (listing()!.summary) {
                <p class="max-w-3xl text-lg leading-relaxed text-foreground">{{ listing()!.summary }}</p>
              }

              @if (listing()!.description) {
                <section class="mt-8 max-w-3xl" aria-labelledby="listing-about">
                  <h2 id="listing-about" class="font-display text-2xl text-foreground">About</h2>
                  <p class="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">{{ listing()!.description }}</p>
                </section>
              }

              @if (facts().length) {
                <section class="mt-10 max-w-3xl" aria-labelledby="listing-practical">
                  <h2 id="listing-practical" class="font-display text-2xl text-foreground">Practical details</h2>
                  <dl class="mt-5 divide-y divide-hairline border-y border-hairline">
                    @for (fact of facts(); track fact.label) {
                      <div class="grid gap-2 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
                        <dt class="text-sm font-bold text-foreground">{{ fact.label }}</dt>
                        <dd class="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{{ fact.value }}</dd>
                      </div>
                    }
                  </dl>
                </section>
              }

              @if (extraImages().length) {
                <section class="mt-10" aria-labelledby="listing-gallery">
                  <h2 id="listing-gallery" class="font-display text-2xl text-foreground">Gallery</h2>
                  <ul class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
                    @for (image of extraImages(); track image.url) {
                      <li class="overflow-hidden rounded-lg bg-ink">
                        <img [src]="image.url" [alt]="image.alt_text || listing()!.name" loading="lazy" class="aspect-[4/3] w-full object-cover" />
                        @if (image.caption) {
                          <p class="px-3 py-2 text-sm text-muted-foreground">{{ image.caption }}</p>
                        }
                      </li>
                    }
                  </ul>
                </section>
              }

              <a routerLink="/discover/catalogue" [queryParams]="backQuery()" class="mt-10 inline-flex min-h-11 items-center font-bold text-primary underline underline-offset-4">Back to catalogue</a>
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
  protected readonly facts = computed(() => {
    const listing = this.listing();
    if (!listing) {
      return [];
    }
    return [
      { label: 'Included', value: listing.inclusions },
      { label: 'Not included', value: listing.exclusions },
      { label: 'What to bring', value: listing.what_to_bring },
      { label: 'Good to know', value: listing.important_information },
      { label: 'How to request it', value: listing.booking_instructions },
    ].filter((fact): fact is { label: string; value: string } => !!fact.value);
  });
  protected readonly extraImages = computed(() => {
    const listing = this.listing();
    if (!listing) {
      return [];
    }
    return listing.gallery.filter((image) => image.url !== listing.cover?.url);
  });
  protected readonly placeLine = computed(() => {
    const listing = this.listing();
    if (!listing) {
      return '';
    }
    return [listing.geographic_area_name, listing.subcategory_name]
      .filter((part): part is string => !!part)
      .join(' · ');
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
        next: (response) => this.listing.set(response.data),
        error: () => this.loadError.set(true),
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }
}
