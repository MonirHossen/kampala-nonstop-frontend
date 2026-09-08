import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { extractApiError } from '../core/lib/api-error';
import { resolveWaitlistSource } from '../core/lib/tracking';
import { SiteFooterComponent } from '../site/site-footer.component';
import { SiteHeaderComponent } from '../site/site-header.component';
import { GuideApiService } from './guide-api.service';
import { CountryGuide, GuideLoadState, GuideTravelTopic } from './guide.models';
import { GuideHeroComponent } from './components/guide-hero.component';
import { GuideQuickInfoComponent } from './components/guide-quick-info.component';
import { GuideStateComponent } from './components/guide-state.component';
import { GuideTopicGridComponent } from './components/guide-topic-grid.component';
import { GuideTopicPanelComponent } from './components/guide-topic-panel.component';
import { GuideTravelInfoSectionComponent } from './components/guide-travel-info-section.component';
import { countryDisplayName } from './guide-country-name';

@Component({
  selector: 'kn-travel-guide-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SiteHeaderComponent,
    SiteFooterComponent,
    GuideHeroComponent,
    GuideTopicGridComponent,
    GuideTopicPanelComponent,
    GuideQuickInfoComponent,
    GuideStateComponent,
    GuideTravelInfoSectionComponent,
    RouterLink,
  ],
  template: `
    <div class="flex min-h-screen flex-col bg-background">
      <kn-site-header [lightBackground]="true" />

      @if (state().status === 'ready') {
        <kn-guide-hero
          [crumbs]="crumbs()"
          eyebrow="Travel guide"
          [title]="'Travel Guide — ' + countryName()"
          [lede]="
            'Topic-by-topic advice for visitors: visas, arrival, transport, money, health, packing and more.'
          "
          backgroundImage="/img/hero_adventure_desktop.jpg"
        />

        <main class="flex-1">
          <section class="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 sm:py-16">
            @if (guide()!.travel_guide.length > 0) {
              <kn-guide-topic-grid
                [topics]="guide()!.travel_guide"
                [selectedCode]="selectedCode()"
                (topicSelect)="onSelectTopic($event)"
              />

              <div class="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_400px]">
                <kn-guide-topic-panel [topic]="selectedTopic()" />
                <kn-guide-quick-info
                  [essentials]="guide()!.essentials"
                  [countryName]="countryName()"
                  [countryCode]="countryCode()"
                />
              </div>
            } @else {
              <p class="text-muted-foreground">No travel guide topics are published for this country yet.</p>
            }

            <div class="mt-14">
              <kn-guide-travel-info-section
                [travelInformation]="guide()!.travel_information"
                [countryName]="countryName()"
              />
            </div>

            <div class="mt-12 flex flex-wrap items-center gap-4 border-t border-hairline pt-10">
              <a
                [routerLink]="['/guide', countryCode()]"
                class="text-sm font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                Back to {{ countryName() }} overview
              </a>
              <a
                routerLink="/waitlist/join"
                [queryParams]="{ source: waitlistSource }"
                class="inline-flex bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Plan My Trip
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
export class TravelGuidePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly guideApi = inject(GuideApiService);

  protected readonly state = signal<GuideLoadState>({ status: 'loading' });
  protected readonly selectedCode = signal<string | null>(null);
  protected readonly waitlistSource = resolveWaitlistSource();

  protected readonly guide = computed(() => {
    const s = this.state();
    return s.status === 'ready' ? s.guide : null;
  });

  protected readonly countryCode = computed(() => this.guide()?.country_code ?? this.paramCode());

  protected readonly countryName = computed(() => countryDisplayName(this.countryCode()));

  protected readonly crumbs = computed(() => [
    { label: 'Guide', link: '/guide' },
    { label: this.countryName(), link: ['/guide', this.countryCode()] },
    { label: 'Travel Guide' },
  ]);

  protected readonly selectedTopic = computed(() => {
    const topics = this.guide()?.travel_guide ?? [];
    const code = this.selectedCode();
    return topics.find((topic) => topic.code === code) ?? topics[0] ?? null;
  });

  ngOnInit(): void {
    const code = this.paramCode();
    this.load(code);

    this.route.queryParamMap.subscribe((params) => {
      const topic = params.get('topic')?.trim().toUpperCase() || null;
      if (topic) {
        this.selectedCode.set(topic);
      }
    });
  }

  protected onSelectTopic(topic: GuideTravelTopic): void {
    if (!topic.code) {
      return;
    }

    this.selectedCode.set(topic.code);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { topic: topic.code },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private paramCode(): string {
    return (this.route.snapshot.paramMap.get('countryCode') ?? 'UG').trim().toUpperCase();
  }

  private load(code: string): void {
    this.state.set({ status: 'loading' });

    this.guideApi.getGuide(code).subscribe({
      next: (guide: CountryGuide) => {
        if (guide.travel_guide.length === 0 && guide.essentials.length === 0) {
          this.state.set({ status: 'empty' });
          return;
        }

        this.state.set({ status: 'ready', guide });

        const fromQuery = this.route.snapshot.queryParamMap.get('topic')?.trim().toUpperCase();
        const match = guide.travel_guide.find((topic) => topic.code === fromQuery);
        this.selectedCode.set(match?.code ?? guide.travel_guide[0]?.code ?? null);
      },
      error: (error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.state.set({ status: 'empty' });
          return;
        }

        this.state.set({
          status: 'error',
          message: extractApiError(error, 'Could not load this travel guide.'),
        });
      },
    });
  }
}
