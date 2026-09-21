import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { LocalKnowledgeSectionComponent } from '../local-knowledge/local-knowledge-section.component';
import { guideContentFor } from './content/guide-content.registry';
import { guideHubCardImage } from './guide-art';
import { countryDisplayName } from './guide-country-name';
import { guideCountryCode } from './guide-route';
import { guideSectionIcon } from './guide-topic-icons';

@Component({
  selector: 'kn-guide-hub-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideDynamicIcon, LocalKnowledgeSectionComponent],
  template: `
    @if (content(); as guide) {
      <section class="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-20">
        <ul class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          @for (card of guide.hubCards; track card.slug) {
            <li>
              <a
                [routerLink]="card.slug"
                [relativeTo]="guideRoute"
                class="group relative flex h-full flex-col overflow-hidden rounded-2xl border-2 border-primary bg-paper transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_50px_-26px_rgba(40,28,18,0.55)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <figure class="relative aspect-[16/9] overflow-hidden">
                  <img
                    [src]="imageFor(card.slug)"
                    alt=""
                    class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    loading="lazy"
                  />
                  <span
                    class="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent"
                    aria-hidden="true"
                  ></span>
                  <span
                    class="absolute left-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-ink/70 text-primary backdrop-blur-sm transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground sm:left-5 sm:top-5"
                  >
                    <svg
                      lucideIcon
                      [lucideIcon]="iconFor(card.slug)"
                      class="h-5 w-5"
                      aria-hidden="true"
                    ></svg>
                  </span>
                </figure>

                <div class="relative flex flex-1 flex-col p-5 sm:p-7">
                  <h2 class="font-display text-xl text-foreground sm:text-2xl">
                    {{ card.title }}
                  </h2>
                  <p class="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {{ card.lede }}
                  </p>
                </div>
              </a>
            </li>
          }
        </ul>

        <div class="mt-8 grid items-start gap-8 min-[1400px]:grid-cols-[56rem_minmax(0,1fr)]">
          <aside class="relative min-w-0 overflow-hidden rounded-2xl">
            <img
              src="/img/uganda/uganda-city-sunset.jpg"
              alt=""
              class="absolute inset-0 h-full w-full object-cover"
              aria-hidden="true"
              loading="lazy"
            />
            <span class="absolute inset-0 bg-ink/72" aria-hidden="true"></span>
            <div
              class="relative flex flex-col gap-5 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-12"
            >
              <div>
                <h2 class="font-display text-2xl text-ink-foreground sm:text-3xl">
                  Turn your ideas into a trip
                </h2>
                <p class="mt-2 max-w-xl text-ink-foreground/85">
                  Bring your interests, dates and destinations together when you’re ready.
                </p>
              </div>
              <a
                routerLink="/waitlist/join"
                class="inline-flex shrink-0 bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground hover:text-primary"
              >
                Plan My Trip
              </a>
            </div>
          </aside>
          <kn-local-knowledge-section [inset]="true" [flush]="true" />
        </div>
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

  protected imageFor(slug: string): string {
    return guideHubCardImage(slug);
  }

  protected iconFor(slug: string) {
    return guideSectionIcon(slug);
  }
}
