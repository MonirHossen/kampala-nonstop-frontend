import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GuideRegionsComponent } from './components/guide-regions.component';
import { GuideTextLinkComponent } from './components/guide-text-link.component';
import { guideContentFor } from './content/guide-content.registry';
import type { GuideRegion } from './content/guide-content.types';
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
          <article class="rounded-xl border border-hairline bg-paper p-6 sm:p-8">
            <h2 class="font-display text-2xl text-foreground sm:text-3xl">{{ region.title }}</h2>
            <p class="mt-4 text-[1.05rem] leading-relaxed text-muted-foreground">
              {{ region.overview }}
            </p>
            <h3 class="mt-8 font-display text-xl text-foreground sm:text-2xl">
              Key areas and destinations
            </h3>
            <ul class="mt-5 space-y-3 text-[1.02rem] leading-relaxed text-foreground/90">
              @for (area of region.keyAreas; track area) {
                <li class="flex gap-3">
                  <span class="mt-2 h-1.5 w-1.5 shrink-0 bg-primary" aria-hidden="true"></span>
                  {{ area }}
                </li>
              }
            </ul>
            <h3 class="mt-8 font-display text-xl text-foreground">Getting oriented</h3>
            <p class="mt-3 text-[1.02rem] leading-relaxed text-muted-foreground">
              {{ region.orientation }}
            </p>
            <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
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
}
