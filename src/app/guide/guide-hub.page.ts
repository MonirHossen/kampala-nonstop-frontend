import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideArrowRight } from '@lucide/angular';
import { RevealDirective } from '../shared/reveal.directive';
import { guideContentFor } from './content/guide-content.registry';
import { countryDisplayName } from './guide-country-name';
import { guideCountryCode } from './guide-route';

@Component({
  selector: 'kn-guide-hub-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideArrowRight, RevealDirective],
  template: `
    @if (content(); as guide) {
      <section class="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-20">
        <div knReveal>
          <p class="eyebrow text-clay">Start here</p>
          <h2 class="mt-3 font-display text-3xl text-foreground sm:text-4xl">
            Four ways into {{ guide.countryName }}
          </h2>
        </div>

        <ul class="mt-10 grid gap-4 sm:grid-cols-2">
          @for (card of guide.hubCards; track card.slug; let i = $index) {
            <li [knReveal]="i * 70">
              <a
                [routerLink]="card.slug"
                [relativeTo]="guideRoute"
                class="group flex h-full flex-col overflow-hidden rounded-xl border border-hairline bg-gradient-to-b from-paper to-sand/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-[0_18px_32px_-22px_rgba(40,28,18,0.5)] sm:p-8"
              >
                <h3 class="font-display text-2xl text-foreground sm:text-3xl">{{ card.title }}</h3>
                <p class="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {{ card.lede }}
                </p>
                <span
                  class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                >
                  {{ card.cta }}
                  <svg
                    lucideArrowRight
                    class="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  ></svg>
                </span>
              </a>
            </li>
          }
        </ul>
      </section>
    } @else {
      <section class="mx-auto max-w-[1400px] px-5 py-20 sm:px-8">
        <p class="eyebrow text-clay">Coming soon</p>
        <h2 class="mt-3 font-display text-3xl text-foreground">
          {{ countryName() }} guide is not published yet
        </h2>
        <p class="mt-3 max-w-lg text-muted-foreground">
          Uganda is the destination with a live guide today. Check back as Africa Nonstop expands.
        </p>
        <a
          routerLink="/ug/guide"
          class="mt-8 inline-flex bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          Open Uganda guide
        </a>
      </section>
    }
  `,
})
export class GuideHubPage {
  private readonly route = inject(ActivatedRoute);

  protected readonly countryCode = computed(() => guideCountryCode(this.route));
  protected readonly countryName = computed(() => countryDisplayName(this.countryCode()));
  protected readonly content = computed(() => guideContentFor(this.countryCode()));
  protected readonly guideRoute = this.route.parent ?? this.route;
}
