import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Params, RouterLink } from '@angular/router';
import { LucideArrowRight, LucideDynamicIcon } from '@lucide/angular';
import { ListingCard } from '../core/models/listing.model';

@Component({
  selector: 'kn-discover-listing-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideDynamicIcon],
  template: `
    <a
      [routerLink]="['/discover/listings', listing().slug]"
      [queryParams]="queryParams()"
      class="group relative isolate flex min-h-56 min-w-0 overflow-hidden rounded-lg bg-ink text-white focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white sm:min-h-64"
    >
      @if (listing().cover) {
        <img
          [src]="listing().cover!.url"
          [alt]="listing().cover!.alt_text || listing().name"
          loading="lazy"
          decoding="async"
          class="absolute inset-0 -z-20 h-full w-full object-cover object-center transition duration-700 ease-out group-hover:scale-105"
        />
      } @else {
        <div class="absolute inset-0 -z-20 bg-muted" aria-hidden="true"></div>
      }
      <div class="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/45 to-black/15" aria-hidden="true"></div>

      <div class="relative flex w-full flex-col justify-end gap-2 px-4 py-5 sm:px-5 sm:py-6">
        <p class="text-xs font-normal uppercase tracking-[0.14em] text-white/80">
          {{ listing().listing_type_name }}
          @if (listing().is_hot_pick) {
            <span aria-hidden="true"> · </span><span>Hot Pick</span>
          }
          @if (listing().is_local_gem) {
            <span aria-hidden="true"> · </span><span>Local Gem</span>
          }
        </p>
        <h3 class="font-display text-xl font-normal leading-snug sm:text-2xl">{{ listing().name }}</h3>
        @if (listing().summary) {
          <p class="line-clamp-2 text-sm leading-relaxed text-white/80">{{ listing().summary }}</p>
        }
        @if (placeLine()) {
          <p class="text-sm text-white/70">{{ placeLine() }}</p>
        }
        <span
          class="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-primary via-primary to-clay px-4 py-2 text-sm font-bold text-primary-foreground shadow-md transition duration-300 group-hover:brightness-110"
        >
          View listing
          <svg lucideIcon [lucideIcon]="arrowIcon" class="h-4 w-4" aria-hidden="true"></svg>
        </span>
      </div>
    </a>
  `,
})
export class DiscoverListingCardComponent {
  readonly listing = input.required<ListingCard>();
  readonly queryParams = input<Params>({});
  protected readonly arrowIcon = LucideArrowRight.icon;

  protected placeLine(): string {
    return [this.listing().geographic_area_name, this.listing().subcategory_name]
      .filter((part): part is string => !!part)
      .join(' · ');
  }
}
