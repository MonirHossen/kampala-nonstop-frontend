import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  LucideDynamicIcon, LucideUtensils, LucideLandmark, LucideMusic,
  LucideTrees, LucideMountain, LucideTickets, LucideFlower2,
  LucideBike, LucideShoppingBag, LucideHandshake,
  LucideStar, LucideFootprints, LucideCalendarDays, LucideMap, LucideConciergeBell,
  LucideArrowRight,
} from '@lucide/angular';
import { SiteHeaderComponent } from '../site/site-header.component';
import { SiteFooterComponent } from '../site/site-footer.component';

@Component({
  selector: 'kn-discover-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiteHeaderComponent, SiteFooterComponent, LucideDynamicIcon],
  template: `
    <div class="flex min-h-screen flex-col bg-background">
      <kn-site-header [lightBackground]="true" />
      <main class="flex-1">
        <div class="mx-auto max-w-[1400px] px-5 pb-14 pt-28 sm:px-8 sm:pb-20 sm:pt-32">
          <header class="mb-8 max-w-4xl">
            <h1 class="font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl">
              Your adventure awaits
            </h1>
            <p class="mt-5 text-base leading-relaxed text-muted-foreground">
              <strong class="font-bold text-foreground">Discover Uganda your way.</strong>
              Bookmark something for later, or Add to Trip when you want to include it in your plans.
              When you’re ready, Plan My Trip brings everything together so we can work through
              dates, availability, pricing and the practical details.
            </p>
          </header>
          <div class="max-w-sm">
            <label for="discover-location" class="eyebrow text-clay">Location</label>
            <select
              id="discover-location"
              disabled
              class="mt-3 w-full rounded-lg border border-hairline bg-paper px-4 py-3 text-foreground disabled:cursor-not-allowed disabled:opacity-100"
            >
              <option>Kampala</option>
            </select>
          </div>

          <section class="mt-8" aria-labelledby="discover-themes-heading">
            <h2 id="discover-themes-heading" class="font-display text-2xl text-foreground sm:text-3xl">
              Explore what interests you
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
                  <div class="flex w-full flex-col items-start justify-center gap-3 p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-4">
                    <svg lucideIcon [lucideIcon]="theme.icon" class="h-8 w-8 shrink-0 sm:h-9 sm:w-9" aria-hidden="true"></svg>
                    <h3 class="min-w-0 text-sm font-bold leading-snug sm:flex-1">{{ theme.label }}</h3>
                  </div>
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
                <button
                  type="button"
                  disabled
                  class="relative flex min-h-24 min-w-0 items-center gap-2 rounded-xl bg-muted px-3 pb-9 pt-5 text-left text-xs font-bold text-foreground disabled:cursor-not-allowed disabled:opacity-100 sm:gap-3 sm:px-4 sm:text-sm"
                >
                  <svg lucideIcon [lucideIcon]="type.icon" class="h-7 w-7 shrink-0 text-emerald-950 sm:h-9 sm:w-9" aria-hidden="true"></svg>
                  <span class="min-w-0 flex-1">{{ type.label }}</span>
                  <svg lucideIcon [lucideIcon]="arrowIcon" class="absolute bottom-3 right-3 h-4 w-4 sm:right-4" aria-hidden="true"></svg>
                </button>
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
  protected readonly themes = [
    { label: 'Food & Local Life', image: 'discover_food_and_local_life', icon: LucideUtensils.icon },
    { label: 'Culture & Heritage', image: 'discover_culture_and_heritage', icon: LucideLandmark.icon },
    { label: 'Music, Nightlife & Entertainment', image: 'discover_music_nightlife_entertainment', icon: LucideMusic.icon },
    { label: 'Nature & Wildlife', image: 'discover_wildlife_and_nature', icon: LucideTrees.icon },
    { label: 'Adventure & Outdoors', image: 'discover_adventure_and_outdoors', icon: LucideMountain.icon },
    { label: 'Events & Festivals', image: 'discover_events_and_festivals', icon: LucideTickets.icon },
    { label: 'Wellness & Relaxation', image: 'discover_wellness_and_beauty', icon: LucideFlower2.icon },
    { label: 'Sports & Recreation', image: 'discover_sports_and_recreation', icon: LucideBike.icon },
    { label: 'Shopping', image: 'discover_shopping', icon: LucideShoppingBag.icon },
    { label: 'Community & Impact', image: 'discover_community_and_impact', icon: LucideHandshake.icon },
  ];
  protected readonly arrowIcon = LucideArrowRight.icon;
  protected readonly listingTypes = [
    { label: 'Experiences', icon: LucideStar.icon },
    { label: 'Activities', icon: LucideFootprints.icon },
    { label: 'Events', icon: LucideCalendarDays.icon },
    { label: 'Tours', icon: LucideMap.icon },
    { label: 'Services', icon: LucideConciergeBell.icon },
  ];
}
