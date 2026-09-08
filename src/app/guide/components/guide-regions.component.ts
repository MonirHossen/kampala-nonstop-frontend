import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RevealDirective } from '../../shared/reveal.directive';
import { GuideRegion } from '../guide.models';

@Component({
  selector: 'kn-guide-regions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section class="rule-top">
      <div class="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-20">
        <div knReveal>
          <p class="eyebrow text-clay">Regions</p>
          <h2 class="mt-3 font-display text-3xl text-foreground sm:text-4xl">Explore by area</h2>
          <p class="mt-3 max-w-xl text-muted-foreground">
            Snapshot notes for each region — useful when sketching an itinerary.
          </p>
        </div>

        <ul class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          @for (region of regions(); track region.id; let i = $index) {
            <li
              [knReveal]="i * 60"
              class="group flex h-full flex-col overflow-hidden rounded-xl border border-hairline bg-gradient-to-b from-paper to-sand/40 transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-[0_18px_32px_-22px_rgba(40,28,18,0.5)]"
            >
              <div class="relative aspect-[16/10] overflow-hidden bg-sand">
                @if (region.image_link) {
                  <img
                    [src]="region.image_link"
                    [alt]="region.title"
                    class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                } @else {
                  <div
                    class="flex h-full w-full items-center justify-center bg-gradient-to-br from-sand via-muted to-forest/20"
                    aria-hidden="true"
                  >
                    <span class="font-display text-5xl text-foreground/15">
                      {{ regionInitial(region.title) }}
                    </span>
                  </div>
                }
              </div>
              <div class="flex flex-1 flex-col p-5">
                <div class="flex items-center gap-2">
                  <h3 class="font-display text-xl text-foreground">{{ region.title }}</h3>
                  @if (region.is_featured) {
                    <span class="eyebrow text-[0.6rem] text-primary">Featured</span>
                  }
                </div>
                @if (region.summary) {
                  <p class="mt-2 text-sm leading-relaxed text-muted-foreground">{{ region.summary }}</p>
                }
              </div>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
})
export class GuideRegionsComponent {
  readonly regions = input.required<GuideRegion[]>();

  protected regionInitial(title: string): string {
    return (title.trim().charAt(0) || '?').toUpperCase();
  }
}
