import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideBadgeCheck,
  LucideDynamicIcon,
  LucideHeart,
  LucideMapPin,
  LucideStar,
  LucideFootprints,
  LucideCalendarDays,
  LucideMap,
  LucideConciergeBell,
} from '@lucide/angular';
import { ListingCard } from '../core/models/listing.model';

const TYPE_ICONS: Record<string, typeof LucideStar.icon> = {
  EXPERIENCE: LucideStar.icon,
  ACTIVITY: LucideFootprints.icon,
  EVENT: LucideCalendarDays.icon,
  TOUR: LucideMap.icon,
  SERVICE: LucideConciergeBell.icon,
};

@Component({
  selector: 'kn-discover-hot-pick-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideDynamicIcon],
  template: `
    <article
      class="flex h-full flex-col overflow-hidden rounded-xl border border-hairline bg-paper shadow-[0_8px_24px_-12px_rgba(40,28,16,0.28)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-14px_rgba(40,28,16,0.35)]"
    >
      <div class="relative aspect-[16/11] overflow-hidden bg-muted">
        <a
          [routerLink]="['/discover/listings', listing().slug]"
          class="absolute inset-0 block focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-primary"
        >
          @if (listing().cover) {
            <img
              [src]="listing().cover!.url"
              [alt]="listing().cover!.alt_text || listing().name"
              loading="lazy"
              decoding="async"
              class="h-full w-full object-cover object-center transition duration-700 ease-out hover:scale-105"
            />
          } @else {
            <div class="h-full w-full bg-sand" aria-hidden="true"></div>
          }
        </a>

        <div class="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-wrap gap-1.5 p-3">
          @if (listing().is_hot_pick) {
            <span
              class="inline-flex items-center rounded-md bg-gradient-to-r from-primary to-clay px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-primary-foreground shadow-sm"
            >
              Hot Pick
            </span>
          }
          @if (listing().is_local_gem) {
            <span
              class="inline-flex items-center rounded-md bg-forest px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-ink-foreground shadow-sm"
            >
              Local Gem
            </span>
          }
          <span
            class="inline-flex items-center rounded-md bg-ink/70 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-ink-foreground backdrop-blur-sm"
          >
            {{ listing().listing_type_name }}
          </span>
        </div>

        <button
          type="button"
          class="absolute bottom-3 right-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink/55 text-ink-foreground backdrop-blur-sm transition hover:bg-primary hover:text-primary-foreground"
          aria-label="Save for later"
          (click)="$event.preventDefault(); $event.stopPropagation()"
        >
          <svg lucideIcon [lucideIcon]="heartIcon" class="h-4 w-4" aria-hidden="true"></svg>
        </button>

        <div
          class="absolute -bottom-5 left-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-paper bg-gradient-to-br from-primary to-clay text-primary-foreground shadow-md"
          aria-hidden="true"
        >
          <svg lucideIcon [lucideIcon]="typeIcon()" class="h-5 w-5"></svg>
        </div>
      </div>

      <div class="flex flex-1 flex-col px-4 pb-4 pt-7">
        <div class="flex items-start gap-2">
          <h3 class="min-w-0 flex-1 font-display text-lg font-semibold leading-snug text-foreground">
            <a
              [routerLink]="['/discover/listings', listing().slug]"
              class="transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {{ listing().name }}
            </a>
          </h3>
          @if (listing().is_local_gem) {
            <span
              class="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest text-ink-foreground"
              title="Local Gem"
            >
              <svg lucideIcon [lucideIcon]="checkIcon" class="h-3.5 w-3.5" aria-hidden="true"></svg>
            </span>
          }
        </div>

        @if (listing().summary) {
          <p class="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {{ listing().summary }}
          </p>
        }

        @if (listing().geographic_area_name) {
          <p class="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <svg lucideIcon [lucideIcon]="pinIcon" class="h-4 w-4 shrink-0 text-primary" aria-hidden="true"></svg>
            <span class="truncate">{{ listing().geographic_area_name }}</span>
          </p>
        }

        <div class="mt-auto flex items-center justify-between gap-3 border-t border-hairline pt-3">
          <div class="flex min-w-0 items-center gap-2">
            <span
              class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-primary"
              aria-hidden="true"
            >
              <svg lucideIcon [lucideIcon]="typeIcon()" class="h-4 w-4"></svg>
            </span>
            <span class="truncate text-sm font-medium text-foreground">
              {{ listing().category_name || listing().listing_type_name }}
            </span>
          </div>
          <a
            [routerLink]="['/discover/listings', listing().slug]"
            class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-primary via-primary to-clay px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-sm transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            View
            <svg lucideIcon [lucideIcon]="arrowIcon" class="h-3.5 w-3.5" aria-hidden="true"></svg>
          </a>
        </div>
      </div>
    </article>
  `,
})
export class DiscoverHotPickCardComponent {
  readonly listing = input.required<ListingCard>();

  protected readonly arrowIcon = LucideArrowRight.icon;
  protected readonly heartIcon = LucideHeart.icon;
  protected readonly pinIcon = LucideMapPin.icon;
  protected readonly checkIcon = LucideBadgeCheck.icon;

  protected typeIcon() {
    return TYPE_ICONS[this.listing().listing_type_code] ?? LucideStar.icon;
  }
}
