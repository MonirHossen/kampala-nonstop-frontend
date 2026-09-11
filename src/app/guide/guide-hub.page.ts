import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { guideContentFor } from './content/guide-content.registry';
import { countryDisplayName } from './guide-country-name';
import { guideCountryCode } from './guide-route';
import { guideSectionIcon } from './guide-topic-icons';

@Component({
  selector: 'kn-guide-hub-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideDynamicIcon],
  template: `
    @if (content(); as guide) {
      <section class="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-20">
        <ul class="grid gap-5 sm:grid-cols-2">
          @for (card of guide.hubCards; track card.slug) {
            <li>
              <a
                [routerLink]="card.slug"
                [relativeTo]="guideRoute"
                class="group flex h-full flex-col rounded-xl border border-hairline bg-paper p-6 transition-all duration-300 hover:border-primary hover:shadow-[0_18px_32px_-22px_rgba(40,28,18,0.5)] sm:p-8"
              >
                <span
                  class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/12 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                >
                  <svg
                    lucideIcon
                    [lucideIcon]="iconFor(card.slug)"
                    class="h-6 w-6"
                    aria-hidden="true"
                  ></svg>
                </span>
                <h2 class="mt-5 font-display text-2xl text-foreground sm:text-3xl">{{ card.title }}</h2>
                <p class="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {{ card.lede }}
                </p>
                <span
                  class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                >
                  Explore {{ card.title }}
                  <span aria-hidden="true">→</span>
                </span>
              </a>
            </li>
          }
        </ul>

        <aside class="mt-8 rounded-xl bg-sand/60 p-6 sm:p-8">
          <h2 class="font-display text-2xl text-foreground">Turn your ideas into a trip</h2>
          <p class="mt-2 text-muted-foreground">
            Bring your interests, dates and destinations together when you’re ready.
          </p>
          <a
            routerLink="/waitlist/join"
            class="mt-5 inline-flex border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Plan My Trip
          </a>
        </aside>
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

  protected iconFor(slug: string) {
    return guideSectionIcon(slug);
  }
}
