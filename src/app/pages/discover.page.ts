import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideDynamicIcon, LucideArrowRight } from '@lucide/angular';
import { RouterLink } from '@angular/router';
import { DISCOVER_THEMES, DISCOVER_TYPES } from './discover-options';
import { SiteHeaderComponent } from '../site/site-header.component';
import { SiteFooterComponent } from '../site/site-footer.component';

@Component({
  selector: 'kn-discover-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiteHeaderComponent, SiteFooterComponent, LucideDynamicIcon, RouterLink],
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
        </div>
      </main>
      <kn-site-footer />
    </div>
  `,
})
export class DiscoverPage {
  // Editorial discovery themes, independent of the internal catalogue taxonomy.
  protected readonly themes = DISCOVER_THEMES;
  protected readonly arrowIcon = LucideArrowRight.icon;
  protected readonly listingTypes = DISCOVER_TYPES;
}
