import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RevealDirective } from '../shared/reveal.directive';
import { guideContentFor } from './content/guide-content.registry';
import { guideCountryCode } from './guide-route';

@Component({
  selector: 'kn-guide-travel-information-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, RouterLink],
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
            <div class="flex flex-wrap gap-2">
              @for (item of info.nav; track item.id) {
                <button
                  type="button"
                  class="rounded-full border px-3.5 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.12em] transition-colors"
                  [class]="
                    item.id === activeSection()
                      ? 'border-ink bg-ink text-ink-foreground'
                      : 'border-hairline bg-paper text-muted-foreground hover:border-primary/45 hover:text-foreground'
                  "
                  [attr.aria-pressed]="item.id === activeSection()"
                  (click)="activeSection.set(item.id)"
                >
                  {{ item.label }}
                </button>
              }
            </div>
          </nav>
        </div>

        @if (activeSection() === 'visa-information') {
          <div class="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div knReveal>
              <h3 class="font-display text-2xl text-foreground sm:text-3xl">{{ info.visaHeading }}</h3>
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
                <p class="eyebrow text-clay">{{ info.atAGlanceHeading }}</p>
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
          <div class="mt-12" knReveal>
            <h3 class="font-display text-2xl text-foreground sm:text-3xl">{{ info.flightsHeading }}</h3>
            <p class="mt-4 text-[1.02rem] leading-relaxed text-foreground/90">{{ info.flightsIntro }}</p>
            <p class="mt-4 text-[1.02rem] leading-relaxed text-foreground/90">
              <a
                [href]="info.airlineUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="font-semibold text-primary underline-offset-4 hover:underline"
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
          <div class="mt-12" knReveal>
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
          <div class="mt-12" knReveal>
            <h3 class="font-display text-2xl text-foreground sm:text-3xl">{{ info.moneyHeading }}</h3>
            <p class="mt-4 text-[1.02rem] leading-relaxed text-foreground/90">{{ info.moneyIntro }}</p>
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
            <div class="mt-6 space-y-4 text-[1.02rem] leading-relaxed text-foreground/90">
              @for (paragraph of info.moneyParagraphs; track $index) {
                <p>{{ paragraph }}</p>
              }
            </div>
          </div>
        }

        @if (activeSection() === 'health-safety') {
          <div class="mt-12" knReveal>
            <h3 class="font-display text-2xl text-foreground sm:text-3xl">{{ info.healthHeading }}</h3>
            <p class="mt-4 text-[1.02rem] leading-relaxed text-foreground/90">{{ info.healthIntro }}</p>
            <div class="mt-8 grid gap-4 sm:grid-cols-2">
              <div class="rounded-xl border border-hairline bg-paper p-6">
                <p class="eyebrow text-clay">{{ info.healthColumnHeading }}</p>
                <ul class="mt-4 space-y-3 text-sm leading-relaxed text-foreground">
                  @for (item of info.healthPoints; track item) {
                    <li class="flex gap-3">
                      <span class="mt-1.5 h-1.5 w-1.5 shrink-0 bg-primary" aria-hidden="true"></span>
                      {{ item }}
                    </li>
                  }
                </ul>
              </div>
              <div class="rounded-xl border border-hairline bg-paper p-6">
                <p class="eyebrow text-clay">{{ info.safetyColumnHeading }}</p>
                <ul class="mt-4 space-y-3 text-sm leading-relaxed text-foreground">
                  @for (item of info.safetyPoints; track item) {
                    <li class="flex gap-3">
                      <span class="mt-1.5 h-1.5 w-1.5 shrink-0 bg-primary" aria-hidden="true"></span>
                      {{ item }}
                    </li>
                  }
                </ul>
              </div>
            </div>
          </div>
        }

        @if (activeSection() === 'connectivity-power') {
          <div class="mt-12" knReveal>
            <h3 class="font-display text-2xl text-foreground sm:text-3xl">
              {{ info.connectivityHeading }}
            </h3>
            <div class="mt-8 grid gap-4 sm:grid-cols-2">
              <div class="rounded-xl border border-hairline bg-paper p-6">
                <p class="eyebrow text-clay">{{ info.connectivityColumnHeading }}</p>
                <ul class="mt-4 space-y-3 text-sm leading-relaxed text-foreground">
                  @for (item of info.connectivityPoints; track item) {
                    <li class="flex gap-3">
                      <span class="mt-1.5 h-1.5 w-1.5 shrink-0 bg-primary" aria-hidden="true"></span>
                      {{ item }}
                    </li>
                  }
                </ul>
              </div>
              <div class="rounded-xl border border-hairline bg-paper p-6">
                <p class="eyebrow text-clay">{{ info.electricityColumnHeading }}</p>
                <ul class="mt-4 space-y-3 text-sm leading-relaxed text-foreground">
                  @for (item of info.electricityPoints; track item) {
                    <li class="flex gap-3">
                      <span class="mt-1.5 h-1.5 w-1.5 shrink-0 bg-primary" aria-hidden="true"></span>
                      {{ item }}
                    </li>
                  }
                </ul>
              </div>
            </div>
          </div>
        }

        @if (activeSection() === 'what-to-pack') {
          <div class="mt-12" knReveal>
            <h3 class="font-display text-2xl text-foreground sm:text-3xl">{{ info.packHeading }}</h3>
            <p class="mt-4 text-[1.02rem] leading-relaxed text-foreground/90">{{ info.packIntro }}</p>
            <p class="mt-6 font-semibold text-foreground">{{ info.packListLabel }}</p>
            <ul class="mt-4 space-y-3 text-[1.02rem] leading-relaxed text-foreground/90">
              @for (item of info.packItems; track item) {
                <li class="flex gap-3">
                  <span class="mt-2.5 h-1.5 w-1.5 shrink-0 bg-primary" aria-hidden="true"></span>
                  {{ item }}
                </li>
              }
            </ul>
            <p class="mt-6 text-[1.02rem] leading-relaxed text-foreground/90">{{ info.packNote }}</p>
          </div>
        }

        @if (activeSection() === 'cultural-etiquette') {
          <div class="mt-12" knReveal>
            <h3 class="font-display text-2xl text-foreground sm:text-3xl">{{ info.etiquetteHeading }}</h3>
            <ul class="mt-6 space-y-3 text-[1.02rem] leading-relaxed text-foreground/90">
              @for (item of info.etiquettePoints; track item) {
                <li class="flex gap-3">
                  <span class="mt-2.5 h-1.5 w-1.5 shrink-0 bg-primary" aria-hidden="true"></span>
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
          <div class="mt-12" knReveal>
            <h3 class="font-display text-2xl text-foreground sm:text-3xl">{{ info.whenHeading }}</h3>
            <div class="mt-4 space-y-4 text-[1.02rem] leading-relaxed text-foreground/90">
              @for (paragraph of info.whenParagraphs; track $index) {
                <p>{{ paragraph }}</p>
              }
            </div>
          </div>
        }

        <div
          knReveal
          class="mt-16 rounded-xl bg-ink px-6 py-10 text-center text-ink-foreground sm:px-10 sm:py-12"
        >
          <p class="eyebrow text-primary">{{ info.ctaEyebrow }}</p>
          <h3 class="mt-4 font-display text-2xl sm:text-3xl">{{ info.ctaHeading }}</h3>
          <a
            routerLink="/waitlist/join"
            class="mt-8 inline-flex bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            {{ info.ctaLabel }}
          </a>
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
}
