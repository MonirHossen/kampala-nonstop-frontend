import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RevealDirective } from '../shared/reveal.directive';
import { GuideNarrativeBlocksComponent } from './components/guide-narrative-blocks.component';
import { GuideSectionNavComponent } from './components/guide-section-nav.component';
import { GuideTextLinkComponent } from './components/guide-text-link.component';
import { GuideNarrativeBlock } from './guide-content-format';
import { guideContentFor } from './content/guide-content.registry';
import { guideInfoSectionImage } from './guide-art';
import { guideCountryCode } from './guide-route';

@Component({
  selector: 'kn-guide-travel-information-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RevealDirective,
    RouterLink,
    GuideSectionNavComponent,
    GuideTextLinkComponent,
    GuideNarrativeBlocksComponent,
  ],
  template: `
    @if (content(); as guide) {
      @let info = guide.travelInformation;
      <section class="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16">
        <div knReveal>
          <h2 class="font-display text-3xl text-foreground sm:text-4xl">{{ info.introHeading }}</h2>
          <p class="mt-4 max-w-3xl text-[1.05rem] leading-relaxed text-muted-foreground">
            {{ info.intro }}
          </p>

          <nav class="mt-8" aria-label="Travel information sections">
            <kn-guide-section-nav
              [items]="info.nav"
              [selectedId]="activeSection()"
              panelId="travel-information-section-panel"
              ariaLabel="Travel information sections"
              (itemSelect)="activeSection.set($event)"
            />
          </nav>
        </div>

        <div
          id="travel-information-section-panel"
          tabindex="-1"
          class="mt-12 scroll-mt-[6.5rem] outline-none"
        >
        @if (activeSection() === 'visa-information') {
          <figure class="relative mb-10 overflow-hidden rounded-2xl">
            <img
              [src]="infoImage('visa-information')"
              alt=""
              class="aspect-[16/7] w-full object-cover sm:aspect-[16/6]"
              loading="lazy"
            />
            <span
              class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent"
              aria-hidden="true"
            ></span>
          </figure>

          <div class="grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div knReveal>
              <h3 class="font-display text-2xl text-foreground sm:text-3xl">{{ info.visaHeading }}</h3>
              <div class="mt-4">
                <kn-guide-narrative-blocks [blocks]="toBlocks(info.visaParagraphs)" />
              </div>
              <a
                knGuideLink
                [href]="info.officialPortalUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-5 text-sm"
                [external]="true"
              >
                {{ info.officialPortalLabel }}
              </a>

              <h3 class="mt-12 font-display text-2xl text-foreground sm:text-3xl">
                {{ info.visaFreeHeading }}
              </h3>
              <div class="mt-4">
                <kn-guide-narrative-blocks [blocks]="toBlocks(info.visaFreeParagraphs)" />
              </div>
            </div>

            <aside knReveal class="space-y-6">
              <div class="rounded-xl border border-hairline bg-paper p-6">
                <p class="eyebrow text-clay">{{ info.atAGlanceHeading }}</p>
                <ul class="mt-4 space-y-4 text-sm leading-relaxed text-foreground">
                  @for (item of info.atAGlance; track item) {
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
                <li class="rounded-xl border border-hairline bg-gradient-to-b from-paper to-sand/40 p-6">
                  <p class="eyebrow text-clay">{{ cost.name }}</p>
                  <p class="mt-2 font-display text-3xl text-foreground">{{ cost.price }}</p>
                  @if (cost.note) {
                    <p class="mt-3 text-sm leading-relaxed text-muted-foreground">{{ cost.note }}</p>
                  }
                </li>
              }
            </ul>
            <p class="mt-6 text-sm text-muted-foreground">{{ info.costsFootnote }}</p>
          </div>
        }

        @if (activeSection() === 'flights-to-uganda') {
          <figure class="relative mb-10 overflow-hidden rounded-2xl">
            <img
              [src]="infoImage('flights-to-uganda')"
              alt=""
              class="aspect-[16/7] w-full object-cover sm:aspect-[16/6]"
              loading="lazy"
            />
            <span
              class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent"
              aria-hidden="true"
            ></span>
          </figure>

          <div knReveal>
            <h3 class="font-display text-2xl text-foreground sm:text-3xl">{{ info.flightsHeading }}</h3>
            <p class="mt-4 text-[1.02rem] leading-relaxed text-foreground/90">{{ info.flightsIntro }}</p>
            <p class="mt-4 text-[1.02rem] leading-relaxed text-foreground/90">
              <a
                knGuideLink
                [href]="info.airlineUrl"
                target="_blank"
                rel="noopener noreferrer"
                [external]="true"
              >
                {{ info.airlineName }}
              </a>
              {{ info.airlineSuffix }}
            </p>
            <ul class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              @for (destination of info.flightDestinations; track destination) {
                <li class="rounded-xl border border-hairline bg-paper px-4 py-3 text-sm">
                  {{ destination }}
                </li>
              }
            </ul>
            <p class="mt-6 text-[1.02rem] leading-relaxed text-foreground/90">{{ info.flightsNote }}</p>
            <p class="mt-4 text-[1.02rem] leading-relaxed text-foreground/90">
              {{ info.flightsSchedules }}
            </p>

            <h4 class="mt-12 font-display text-xl text-foreground sm:text-2xl">
              {{ info.airportHeading }}
            </h4>
            <p class="mt-4 text-[1.02rem] leading-relaxed text-foreground/90">{{ info.airportIntro }}</p>
            <p class="mt-4 text-[1.02rem] leading-relaxed text-foreground/90">
              {{ info.transferBefore }}
              <strong>{{ info.transferEmphasis }}</strong
              >{{ info.transferAfter }}
            </p>
          </div>
        }

        @if (activeSection() === 'arrival-getting-around') {
          <figure class="relative mb-10 overflow-hidden rounded-2xl">
            <img
              [src]="infoImage('arrival-getting-around')"
              alt=""
              class="aspect-[16/7] w-full object-cover sm:aspect-[16/6]"
              loading="lazy"
            />
            <span
              class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent"
              aria-hidden="true"
            ></span>
          </figure>

          <div knReveal>
            <h3 class="font-display text-2xl text-foreground sm:text-3xl">
              {{ info.gettingAroundHeading }}
            </h3>
            <h4 class="mt-8 font-display text-xl text-foreground sm:text-2xl">
              {{ info.transportHeading }}
            </h4>
            <p class="mt-4 text-[1.02rem] leading-relaxed text-foreground/90">
              {{ info.transportIntro }}
            </p>
            <ul class="mt-6 grid gap-4 sm:grid-cols-2">
              @for (option of info.transportOptions; track option.name) {
                <li class="rounded-xl border border-hairline bg-paper p-5">
                  <p class="font-display text-lg text-foreground">{{ option.name }}</p>
                  <p class="mt-2 text-sm leading-relaxed text-muted-foreground">{{ option.detail }}</p>
                </li>
              }
            </ul>
            <p class="mt-6 text-[1.02rem] leading-relaxed text-foreground/90">{{ info.transportNote }}</p>
          </div>
        }

        @if (activeSection() === 'money-payments') {
          <figure class="relative mb-10 overflow-hidden rounded-2xl">
            <img
              [src]="infoImage('money-payments')"
              alt=""
              class="aspect-[16/7] w-full object-cover sm:aspect-[16/6]"
              loading="lazy"
            />
            <span
              class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent"
              aria-hidden="true"
            ></span>
          </figure>

          <div knReveal>
            <h3 class="font-display text-2xl text-foreground sm:text-3xl">{{ info.moneyHeading }}</h3>
            <div class="mt-4">
              <kn-guide-narrative-blocks [blocks]="toBlocks([info.moneyIntro])" />
            </div>
            <p class="mt-4 text-[1.02rem] leading-relaxed text-foreground/90">{{ info.moneyGuideLabel }}</p>
            <ul class="mt-6 grid gap-4 sm:grid-cols-3">
              @for (row of info.fx; track row.currency) {
                <li class="rounded-xl border border-hairline bg-paper p-5">
                  <div class="flex items-baseline justify-between">
                    <p class="font-display text-2xl text-foreground">1 {{ row.currency }}</p>
                    <p class="text-sm text-muted-foreground">{{ row.unit }}</p>
                  </div>
                  <div class="mt-3 flex items-baseline justify-between text-sm">
                    <span class="text-muted-foreground">Range</span>
                    <span class="font-semibold tabular-nums">{{ row.lower }} - {{ row.upper }}</span>
                  </div>
                </li>
              }
            </ul>
            <div class="mt-6">
              <kn-guide-narrative-blocks [blocks]="toBlocks(info.moneyParagraphs)" />
            </div>
          </div>
        }

        @if (activeSection() === 'health-safety') {
          <figure class="relative mb-10 overflow-hidden rounded-2xl">
            <img
              [src]="infoImage('health-safety')"
              alt=""
              class="aspect-[16/7] w-full object-cover sm:aspect-[16/6]"
              loading="lazy"
            />
            <span
              class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent"
              aria-hidden="true"
            ></span>
          </figure>

          <div knReveal>
            <h3 class="font-display text-2xl text-foreground sm:text-3xl">{{ info.healthHeading }}</h3>
            <div class="mt-4">
              <kn-guide-narrative-blocks [blocks]="toBlocks([info.healthIntro])" />
            </div>
            <div class="mt-8 grid gap-4 sm:grid-cols-2">
              <div class="rounded-xl border border-hairline bg-paper p-6">
                <p class="eyebrow text-clay">{{ info.healthColumnHeading }}</p>
                <ul class="mt-4 space-y-4 text-sm leading-relaxed text-foreground">
                  @for (item of info.healthPoints; track item) {
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
                      {{ item }}
                    </li>
                  }
                </ul>
              </div>
              <div class="rounded-xl border border-hairline bg-paper p-6">
                <p class="eyebrow text-clay">{{ info.safetyColumnHeading }}</p>
                <ul class="mt-4 space-y-4 text-sm leading-relaxed text-foreground">
                  @for (item of info.safetyPoints; track item) {
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
                      {{ item }}
                    </li>
                  }
                </ul>
              </div>
            </div>
          </div>
        }

        @if (activeSection() === 'connectivity-power') {
          <figure class="relative mb-10 overflow-hidden rounded-2xl">
            <img
              [src]="infoImage('connectivity-power')"
              alt=""
              class="aspect-[16/7] w-full object-cover sm:aspect-[16/6]"
              loading="lazy"
            />
            <span
              class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent"
              aria-hidden="true"
            ></span>
          </figure>

          <div knReveal>
            <h3 class="font-display text-2xl text-foreground sm:text-3xl">
              {{ info.connectivityHeading }}
            </h3>
            <div class="mt-8 grid gap-4 sm:grid-cols-2">
              <div class="rounded-xl border border-hairline bg-paper p-6">
                <p class="eyebrow text-clay">{{ info.connectivityColumnHeading }}</p>
                <ul class="mt-4 space-y-4 text-sm leading-relaxed text-foreground">
                  @for (item of info.connectivityPoints; track item) {
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
                      {{ item }}
                    </li>
                  }
                </ul>
              </div>
              <div class="rounded-xl border border-hairline bg-paper p-6">
                <p class="eyebrow text-clay">{{ info.electricityColumnHeading }}</p>
                <ul class="mt-4 space-y-4 text-sm leading-relaxed text-foreground">
                  @for (item of info.electricityPoints; track item) {
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
                      {{ item }}
                    </li>
                  }
                </ul>
              </div>
            </div>
          </div>
        }

        @if (activeSection() === 'what-to-pack') {
          <figure class="relative mb-10 overflow-hidden rounded-2xl">
            <img
              [src]="infoImage('what-to-pack')"
              alt=""
              class="aspect-[16/7] w-full object-cover sm:aspect-[16/6]"
              loading="lazy"
            />
            <span
              class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent"
              aria-hidden="true"
            ></span>
          </figure>

          <div knReveal>
            <h3 class="font-display text-2xl text-foreground sm:text-3xl">{{ info.packHeading }}</h3>
            <div class="mt-4">
              <kn-guide-narrative-blocks [blocks]="toBlocks([info.packIntro])" />
            </div>
            <p class="mt-6 font-semibold text-foreground">{{ info.packListLabel }}</p>
            <ul class="mt-5 space-y-4 text-[1.02rem] leading-relaxed text-foreground/90">
              @for (item of info.packItems; track item) {
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
                  {{ item }}
                </li>
              }
            </ul>
            <p class="mt-6 text-[1.02rem] leading-relaxed text-foreground/90">{{ info.packNote }}</p>
          </div>
        }

        @if (activeSection() === 'cultural-etiquette') {
          <figure class="relative mb-10 overflow-hidden rounded-2xl">
            <img
              [src]="infoImage('cultural-etiquette')"
              alt=""
              class="aspect-[16/7] w-full object-cover sm:aspect-[16/6]"
              loading="lazy"
            />
            <span
              class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent"
              aria-hidden="true"
            ></span>
          </figure>

          <div knReveal>
            <h3 class="font-display text-2xl text-foreground sm:text-3xl">{{ info.etiquetteHeading }}</h3>
            <ul class="mt-6 space-y-4 text-[1.02rem] leading-relaxed text-foreground/90">
              @for (item of info.etiquettePoints; track item) {
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
                  {{ item }}
                </li>
              }
            </ul>
            <p class="mt-6 text-[1.02rem] leading-relaxed text-foreground/90">
              {{ info.etiquetteCloseBefore }}
              <strong>{{ info.etiquetteMale }}</strong>
              {{ info.etiquetteMaleNote }}
              <strong>{{ info.etiquetteFemale }}</strong>
              {{ info.etiquetteCloseAfter }}
            </p>
          </div>
        }

        @if (activeSection() === 'when-to-travel') {
          <figure class="relative mb-10 overflow-hidden rounded-2xl">
            <img
              [src]="infoImage('when-to-travel')"
              alt=""
              class="aspect-[16/7] w-full object-cover sm:aspect-[16/6]"
              loading="lazy"
            />
            <span
              class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent"
              aria-hidden="true"
            ></span>
          </figure>

          <div knReveal>
            <h3 class="font-display text-2xl text-foreground sm:text-3xl">{{ info.whenHeading }}</h3>
            <div class="mt-4">
              <kn-guide-narrative-blocks [blocks]="toBlocks(info.whenParagraphs)" />
            </div>
          </div>
        }
        </div>

        <div knReveal class="relative mt-16 overflow-hidden rounded-2xl">
          <img
            src="/img/uganda/uganda-mosque.jpg"
            alt=""
            class="absolute inset-0 h-full w-full object-cover"
            aria-hidden="true"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-ink/78" aria-hidden="true"></div>
          <div class="relative px-6 py-10 text-center text-ink-foreground sm:px-10 sm:py-12">
            <p class="eyebrow text-primary">{{ info.ctaEyebrow }}</p>
            <h3 class="mt-4 font-display text-2xl sm:text-3xl">{{ info.ctaHeading }}</h3>
            <a
              routerLink="/waitlist/join"
              class="mt-8 inline-flex bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              {{ info.ctaLabel }}
            </a>
          </div>
        </div>
      </section>
    }
  `,
})
export class GuideTravelInformationPage {
  private readonly route = inject(ActivatedRoute);

  private readonly countryCode = computed(() => guideCountryCode(this.route));

  protected readonly content = computed(() => guideContentFor(this.countryCode()));
  protected readonly activeSection = signal('visa-information');

  protected infoImage(id: string): string {
    return guideInfoSectionImage(id);
  }

  protected toBlocks(strings: string[]): GuideNarrativeBlock[] {
    return strings.map((text) => ({ type: 'paragraph', text }));
  }
}