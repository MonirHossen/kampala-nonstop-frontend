import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideArrowRight } from '@lucide/angular';
import { extractApiError } from '../core/lib/api-error';
import { resolveWaitlistSource } from '../core/lib/tracking';
import { RevealDirective } from '../shared/reveal.directive';
import { SiteFooterComponent } from '../site/site-footer.component';
import { SiteHeaderComponent } from '../site/site-header.component';
import { GuideApiService } from './guide-api.service';
import { CountryGuide, GuideLoadState } from './guide.models';
import { GuideHeroComponent } from './components/guide-hero.component';
import { GuideQuickInfoComponent } from './components/guide-quick-info.component';
import { GuideRegionsComponent } from './components/guide-regions.component';
import { GuideStateComponent } from './components/guide-state.component';
import { GuideTravelInfoSectionComponent } from './components/guide-travel-info-section.component';
import { countryDisplayName } from './guide-country-name';

@Component({
  selector: 'kn-guide-landing-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SiteHeaderComponent,
    SiteFooterComponent,
    GuideHeroComponent,
    GuideQuickInfoComponent,
    GuideRegionsComponent,
    GuideStateComponent,
    GuideTravelInfoSectionComponent,
    RevealDirective,
    RouterLink,
    LucideArrowRight,
  ],
  template: `
    <div class="flex min-h-screen flex-col bg-background">
      <kn-site-header [lightBackground]="true" />

      @if (state().status === 'ready') {
        <kn-guide-hero
          [crumbs]="crumbs()"
          eyebrow="Country guide"
          [title]="countryName() + ' essentials'"
          [lede]="
            'Practical facts, travel information and regional notes — then open the full Travel Guide for topic-by-topic advice.'
          "
          backgroundImage="/img/hero_culture_desktop.jpg"
        />

        <main class="flex-1">
          <section class="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16">
            <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12" knReveal>
              <div>
                <p class="eyebrow text-clay">Start here</p>
                <h2 class="mt-3 font-display text-3xl text-foreground sm:text-4xl">
                  Plan with local context
                </h2>
                <p class="mt-4 max-w-2xl text-muted-foreground">
                  This landing page shows live essentials and travel information for
                  {{ countryName() }}. Dive into Entry & Visas, Arrival, Getting Around, Money,
                  Health, What to Pack and more in the Travel Guide.
                </p>

                <a
                  [routerLink]="['/guide', countryCode(), 'travel']"
                  class="mt-8 inline-flex items-center gap-2 bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                >
                  Open Travel Guide
                  <svg lucideArrowRight class="h-4 w-4" aria-hidden="true"></svg>
                </a>

                @if (guide()!.travel_guide.length > 0) {
                  <div class="mt-14">
                    <div class="flex items-baseline justify-between gap-4 border-b-2 border-ink pb-3">
                      <h3 class="eyebrow text-clay">In the Travel Guide</h3>
                      <span class="text-[0.7rem] text-muted-foreground">
                        {{ guide()!.travel_guide.length }} topics
                      </span>
                    </div>

                    <ul class="divide-y divide-hairline">
                      @for (topic of guide()!.travel_guide; track topic.id; let i = $index) {
                        <li>
                          <a
                            [routerLink]="['/guide', countryCode(), 'travel']"
                            [queryParams]="{ topic: topic.code }"
                            class="group grid grid-cols-[2.25rem_1fr] items-baseline gap-3 py-3.5 transition-colors hover:bg-sand/40 sm:grid-cols-[2.75rem_1fr]"
                          >
                            <span
                              class="text-[0.7rem] font-bold tabular-nums text-muted-foreground/70 transition-colors group-hover:text-primary"
                            >
                              {{ (i + 1).toString().padStart(2, '0') }}
                            </span>
                            <span class="min-w-0">
                              <span
                                class="font-display text-[1.15rem] leading-tight text-foreground transition-colors group-hover:text-primary"
                              >
                                {{ topic.name }}
                              </span>
                              @if (topic.description) {
                                <span
                                  class="mt-1 line-clamp-1 block text-[0.82rem] leading-relaxed text-muted-foreground"
                                >
                                  {{ topic.description }}
                                </span>
                              }
                            </span>
                          </a>
                        </li>
                      }
                    </ul>
                  </div>
                }
              </div>

              <kn-guide-quick-info
                [essentials]="guide()!.essentials"
                [countryName]="countryName()"
                [countryCode]="countryCode()"
              />
            </div>
          </section>

          @if (guide()!.regions.length > 0) {
            <kn-guide-regions [regions]="guide()!.regions" />
          }

          <div class="mx-auto max-w-[1400px] px-5 pb-16 sm:px-8 sm:pb-20">
            <kn-guide-travel-info-section
              [travelInformation]="guide()!.travel_information"
              [countryName]="countryName()"
            />
          </div>

          <section class="bg-ink text-ink-foreground">
            <div class="mx-auto flex max-w-[1400px] flex-col gap-6 px-5 py-16 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-20">
              <div knReveal>
                <p class="eyebrow text-primary">Next step</p>
                <h2 class="mt-3 font-display text-3xl sm:text-4xl">Plan my trip</h2>
                <p class="mt-3 max-w-lg text-ink-foreground/70">
                  Join the waitlist and tell us what you want from {{ countryName() }} — we will
                  shape the first release around real travellers.
                </p>
              </div>
              <a
                routerLink="/waitlist/join"
                [queryParams]="{ source: waitlistSource }"
                class="inline-flex shrink-0 bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Join the Waitlist
              </a>
            </div>
          </section>
        </main>
      } @else {
        <main class="flex-1 pt-24">
          <kn-guide-state [state]="state()" />
        </main>
      }

      <kn-site-footer class="mt-auto" />
    </div>
  `,
})
export class GuideLandingPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly guideApi = inject(GuideApiService);

  protected readonly state = signal<GuideLoadState>({ status: 'loading' });
  protected readonly waitlistSource = resolveWaitlistSource();

  protected readonly guide = computed(() => {
    const s = this.state();
    return s.status === 'ready' ? s.guide : null;
  });

  protected readonly countryCode = computed(() => this.guide()?.country_code ?? this.paramCode());

  protected readonly countryName = computed(() => countryDisplayName(this.countryCode()));

  protected readonly crumbs = computed(() => [
    { label: 'Guide', link: '/guide' },
    { label: this.countryName() },
  ]);

  ngOnInit(): void {
    const code = this.paramCode();
    this.load(code);
  }

  private paramCode(): string {
    return (this.route.snapshot.paramMap.get('countryCode') ?? 'UG').trim().toUpperCase();
  }

  private load(code: string): void {
    this.state.set({ status: 'loading' });

    this.guideApi.getGuide(code).subscribe({
      next: (guide: CountryGuide) => {
        const empty =
          guide.essentials.length === 0 &&
          guide.travel_guide.length === 0 &&
          guide.travel_information.length === 0 &&
          guide.regions.length === 0;

        this.state.set(empty ? { status: 'empty' } : { status: 'ready', guide });
      },
      error: (error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.state.set({ status: 'empty' });
          return;
        }

        this.state.set({
          status: 'error',
          message: extractApiError(error, 'Could not load this country guide.'),
        });
      },
    });
  }
}
