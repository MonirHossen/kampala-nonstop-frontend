import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RevealDirective } from '../shared/reveal.directive';
import { GuideRegionsComponent } from './components/guide-regions.component';
import { guideContentFor } from './content/guide-content.registry';
import type { GuideRegion } from './content/guide-content.types';
import { guideCountryCode } from './guide-route';

@Component({
  selector: 'kn-guide-regions-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GuideRegionsComponent, RevealDirective],
  template: `
    @if (content(); as guide) {
      <kn-guide-regions
        [regions]="guide.regions"
        [selectedCode]="selectedCode()"
        (regionSelect)="selectedCode.set($event.code)"
      />

      @if (selectedRegion(); as region) {
        <section class="mx-auto max-w-[1400px] px-5 pb-16 sm:px-8 sm:pb-20">
          <article knReveal class="rounded-xl border border-hairline bg-paper p-6 sm:p-8">
            <p class="eyebrow text-clay">{{ region.title }}</p>
            <h3 class="mt-3 font-display text-2xl text-foreground sm:text-3xl">
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
