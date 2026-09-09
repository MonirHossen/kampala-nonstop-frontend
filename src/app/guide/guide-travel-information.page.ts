import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RevealDirective } from '../shared/reveal.directive';
import { guideContentFor } from './content/guide-content.registry';
import { guideCountryCode } from './guide-route';

@Component({
  selector: 'kn-guide-travel-information-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    @if (content(); as guide) {
      @let info = guide.travelInformation;
      <section class="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16">
        <div class="grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div knReveal>
            <h2 class="font-display text-3xl text-foreground sm:text-4xl">{{ info.introHeading }}</h2>
            <p class="mt-4 text-[1.05rem] leading-relaxed text-muted-foreground">{{ info.intro }}</p>

            <h3 class="mt-12 font-display text-2xl text-foreground sm:text-3xl">
              {{ info.visaHeading }}
            </h3>
            <div class="mt-4 space-y-4 text-[1.02rem] leading-relaxed text-foreground/90">
              @for (paragraph of info.visaParagraphs; track $index) {
                <p>{{ paragraph }}</p>
              }
            </div>
            <a
              [href]="info.officialPortalUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-5 inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              {{ info.officialPortalLabel }}
            </a>

            <h3 class="mt-12 font-display text-2xl text-foreground sm:text-3xl">
              {{ info.visaFreeHeading }}
            </h3>
            <div class="mt-4 space-y-4 text-[1.02rem] leading-relaxed text-foreground/90">
              @for (paragraph of info.visaFreeParagraphs; track $index) {
                <p>{{ paragraph }}</p>
              }
            </div>
          </div>

          <aside knReveal class="space-y-6">
            <div class="rounded-xl border border-hairline bg-paper p-6">
              <p class="eyebrow text-clay">At a glance</p>
              <ul class="mt-4 space-y-3 text-sm leading-relaxed text-foreground">
                @for (item of info.atAGlance; track item) {
                  <li class="flex gap-3">
                    <span class="mt-1.5 h-1.5 w-1.5 shrink-0 bg-primary" aria-hidden="true"></span>
                    {{ item }}
                  </li>
                }
              </ul>
            </div>
          </aside>
        </div>

        <div class="mt-16" knReveal>
          <h3 class="font-display text-2xl text-foreground sm:text-3xl">{{ info.costsHeading }}</h3>
          <p class="mt-3 text-muted-foreground">{{ info.costsIntro }}</p>

          <ul class="mt-8 grid gap-4 sm:grid-cols-2">
            @for (cost of info.costs; track cost.name) {
              <li
                class="rounded-xl border border-hairline bg-gradient-to-b from-paper to-sand/40 p-6"
              >
                <p class="eyebrow text-clay">{{ cost.name }}</p>
                <p class="mt-2 font-display text-3xl text-foreground">{{ cost.price }}</p>
                <p class="mt-3 text-sm leading-relaxed text-muted-foreground">{{ cost.note }}</p>
              </li>
            }
          </ul>
          <p class="mt-6 text-sm text-muted-foreground">{{ info.costsFootnote }}</p>
        </div>
      </section>
    }
  `,
})
export class GuideTravelInformationPage {
  private readonly route = inject(ActivatedRoute);

  private readonly countryCode = computed(() => guideCountryCode(this.route));

  protected readonly content = computed(() => guideContentFor(this.countryCode()));
}
