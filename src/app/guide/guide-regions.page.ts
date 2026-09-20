import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GuideRegionsComponent } from './components/guide-regions.component';
import { GuideTextLinkComponent } from './components/guide-text-link.component';
import { guideContentFor } from './content/guide-content.registry';
import type { GuideRegion } from './content/guide-content.types';
import { guideRegionImage } from './guide-art';
import { guideCountryCode } from './guide-route';

@Component({
  selector: 'kn-guide-regions-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GuideRegionsComponent, GuideTextLinkComponent, RouterLink],
  template: `
    @if (content(); as guide) {
      <kn-guide-regions
        [regions]="guide.regions"
        [intro]="guide.regionsIntro"
        [selectedCode]="selectedCode()"
        panelId="regions-section-panel"
        (regionSelect)="selectedCode.set($event.code)"
      />

      @if (selectedRegion(); as region) {
        <section
          id="regions-section-panel"
          tabindex="-1"
          class="mx-auto max-w-[1400px] scroll-mt-[6.5rem] px-5 pb-16 outline-none sm:px-8 sm:pb-20"
        >
          <article class="overflow-hidden rounded-xl border border-hairline bg-paper">
            <figure class="relative overflow-hidden">
              <img
                [src]="regionImage(region.code)"
                alt=""
                class="aspect-[16/8] w-full object-cover sm:aspect-[16/5]"
                loading="lazy"
              />
              <span
                class="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/15 to-transparent"
                aria-hidden="true"
              ></span>
              <span
                class="absolute bottom-4 left-5 flex items-end gap-3 text-ink-foreground sm:bottom-6 sm:left-8"
              >
                <span class="font-display text-4xl leading-none text-primary" aria-hidden="true">
                  {{ bearing(region.code) }}
                </span>
                <h2 class="font-display text-2xl leading-none sm:text-4xl">{{ region.title }}</h2>
              </span>
            </figure>

            <div class="grid gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_320px] sm:p-8 sm:pr-10">
              <div>
                <p class="text-[1.05rem] leading-relaxed text-muted-foreground">
                  {{ region.overview }}
                </p>
                <h3 class="mt-8 font-display text-xl text-foreground sm:text-2xl">
                  Key areas and destinations
                </h3>
                <ul class="mt-5 space-y-4 text-[1.02rem] leading-relaxed text-foreground/90">
                  @for (area of region.keyAreas; track area) {
                    <li class="flex gap-3">
                      <span
                        class="mt-[0.21em] flex h-4 w-4 shrink-0 items-center justify-center text-primary"
                        aria-hidden="true"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2.4"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="h-3.5 w-3.5"
                        >
                          <path d="m9 6 6 6-6 6"></path>
                        </svg>
                      </span>
                      {{ area }}
                    </li>
                  }
                </ul>
                <h3 class="mt-8 font-display text-xl text-foreground">Getting oriented</h3>
                <p class="mt-3 text-[1.02rem] leading-relaxed text-muted-foreground">
                  {{ region.orientation }}
                </p>
              </div>

              <aside class="flex flex-col justify-end gap-3 self-end lg:border-l lg:border-hairline lg:pl-8">
                <a
                  knGuideLink
                  class="text-sm"
                  routerLink="../travel-guide"
                  [queryParams]="{ topic: region.actionTopic }"
                >
                  {{ region.actionLabel }}
                </a>
                <a
                  knGuideLink
                  class="text-sm"
                  routerLink="../essentials"
                  [queryParams]="{ section: 'major-destinations' }"
                >
                  More about Uganda’s destinations
                </a>
                <a knGuideLink class="text-sm" routerLink="/waitlist/join">Plan My Trip</a>
              </aside>
            </div>
          </article>
        </section>
      }
    }
  `,
})
export class GuideRegionsPage {
  private readonly route = inject(ActivatedRoute);

  private readonly countryCode = computed(() => guideCountryCode(this.route));

  protected readonly content = computed(() => guideContentFor(this.countryCode()));
  protected readonly selectedCode = signal<string | null>(
    this.content()?.regions[0]?.code ?? null,
  );

  protected readonly selectedRegion = computed((): GuideRegion | null => {
    const regions = this.content()?.regions ?? [];
    const code = this.selectedCode();
    return regions.find((region) => region.code === code) ?? regions[0] ?? null;
  });

  protected regionImage(code: string | null): string {
    return guideRegionImage(code);
  }

  protected bearing(code: string | null): string {
    switch (code) {
      case 'CENTRAL':
        return 'C';
      case 'WEST':
        return 'W';
      case 'EAST':
        return 'E';
      case 'NORTH':
        return 'N';
      default:
        return '·';
    }
  }
}
