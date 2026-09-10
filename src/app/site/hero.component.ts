import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  LucideClock,
  LucideCloud,
  LucideCloudFog,
  LucideCloudLightning,
  LucideCloudRain,
  LucideCloudSnow,
  LucideCloudSun,
  LucideDynamicIcon,
  LucideSun,
  type LucideIconData,
} from '@lucide/angular';
import { resolveWaitlistSource } from '../core/lib/tracking';
import { WeatherApiService, type KampalaWeather } from '../core/services/weather-api.service';
import { RevealDirective } from '../shared/reveal.directive';
import { scrollToId } from '../shared/scroll-to';

type HeroSlide = {
  label: string;
  desktop: string;
  mobile: string;
  alt: string;
};

const HERO_SLIDES: readonly HeroSlide[] = [
  {
    label: 'Food & Local Life',
    desktop: '/img/hero_food_desktop.jpg',
    mobile: '/img/hero_food_mobile.jpg',
    alt: 'A Kampala vendor preparing a rolex at golden hour',
  },
  {
    label: 'Culture & Heritage',
    desktop: '/img/hero_culture_desktop.jpg',
    mobile: '/img/hero_culture_mobile.jpg',
    alt: 'An artisan shaping barkcloth in Kampala',
  },
  {
    label: 'Music, Nightlife & Entertainment',
    desktop: '/img/hero_nightlife_desktop.jpg',
    mobile: '/img/hero_nightlife_mobile.jpg',
    alt: 'Live music in a Kampala courtyard under warm evening lights',
  },
  {
    label: 'Nature & Wildlife',
    desktop: '/img/hero_nature_desktop.jpg',
    mobile: '/img/hero_nature_mobile.jpg',
    alt: 'Golden dawn on Lake Victoria',
  },
  {
    label: 'Adventure & Outdoors',
    desktop: '/img/hero_adventure_desktop.jpg',
    mobile: '/img/hero_adventure_mobile.jpg',
    alt: 'Rafting adventure on the Nile near Jinja',
  },
  {
    label: 'Events & Festivals',
    desktop: '/img/hero_events_desktop.jpg',
    mobile: '/img/hero_events_mobile.jpg',
    alt: 'Festival crowd in Kampala at dusk',
  },
];

const UGANDA_TIME_ZONE = 'Africa/Kampala';

@Component({
  selector: 'kn-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, RouterLink, LucideClock, LucideDynamicIcon],
  template: `
    <section class="relative min-h-[100svh] bg-ink">
      <!-- Clips the drifting background art without trapping hero popovers. -->
      <div class="absolute inset-0 overflow-hidden">
        @if (outgoingSlide(); as outgoing) {
          <picture
            class="absolute inset-0 z-10 transition-opacity duration-[2000ms] ease-in-out"
            [class.opacity-100]="!isFading()"
            [class.opacity-0]="isFading()"
          >
            <source media="(max-width: 767px)" [srcset]="outgoing.mobile" />
            <img
              [src]="outgoing.desktop"
              [alt]="outgoing.alt"
              class="h-full w-full object-cover object-center opacity-100"
            />
          </picture>
        }

        <picture
          class="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
          [class.opacity-100]="outgoingSlide() === null || isFading()"
          [class.opacity-0]="outgoingSlide() !== null && !isFading()"
        >
          <source media="(max-width: 767px)" [srcset]="activeSlide().mobile" />
          <img
            [src]="activeSlide().desktop"
            [alt]="activeSlide().alt"
            [attr.fetchpriority]="activeSlideIndex() === 0 ? 'high' : null"
            class="h-full w-full object-cover object-center opacity-100"
          />
        </picture>
        <div class="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-transparent"></div>
      </div>

      <div class="relative z-20 mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-end px-5 pb-14 pt-28 sm:px-8 sm:pb-20">
        <div knReveal class="max-w-4xl">
          <div class="flex items-center gap-3">
            <span class="h-px w-10 bg-primary"></span>
            <p class="eyebrow text-ink-foreground/85">Uganda . Travel . Culture . Concierge</p>
          </div>

          <h1 class="hero-headline mt-5 text-ink-foreground">
            Join our early access list and
            <br />
            win a <em class="text-primary not-italic">return flight to Uganda</em>
          </h1>

          <p class="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-ink-foreground/75 sm:text-[1.15rem]">
            Be the first to experience personalised trip planning, local insights and unforgettable experiences in Uganda.
          </p>

          <div class="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              routerLink="/waitlist/join"
              [queryParams]="{ source: joinSource() }"
              class="eyebrow cursor-pointer bg-primary text-primary-foreground px-8 py-4 text-center transition-transform duration-300 hover:-translate-y-0.5"
            >
              Join the Waitlist
            </a>
          </div>

          <div class="mt-12 border-t border-ink-foreground/15 pt-5">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
              <p class="flex items-center gap-2.5 text-sm text-ink-foreground/70">
                <span class="relative flex h-1.5 w-1.5 shrink-0">
                  <span
                    class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"
                  ></span>
                  <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary"></span>
                </span>
                {{ launchNote() }}
              </p>

              <div
                class="grid grid-cols-2 gap-2.5 sm:gap-3"
                aria-live="polite"
              >
                <div
                  class="group flex min-w-0 items-center gap-3 rounded-2xl border border-ink-foreground/20 bg-ink-foreground/[0.08] px-3.5 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-primary/45 hover:bg-ink-foreground/[0.14] sm:min-w-[11.5rem] sm:px-4 sm:py-3.5"
                >
                  <span
                    class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary ring-1 ring-primary/35 transition duration-300 group-hover:bg-primary/30"
                  >
                    <svg
                      lucideIcon
                      [lucideIcon]="weatherIcon()"
                      class="h-5 w-5"
                      aria-hidden="true"
                    ></svg>
                  </span>
                  <div class="min-w-0">
                    @if (weather(); as w) {
                      <p class="truncate text-[0.68rem] uppercase tracking-[0.14em] text-ink-foreground/55">
                        {{ w.location }}
                      </p>
                      <p class="mt-0.5 truncate font-display text-lg leading-none text-ink-foreground sm:text-xl">
                        {{ formatTemp(w.temperature_c) }}
                      </p>
                      <p class="mt-1 truncate text-[0.78rem] text-ink-foreground/70">{{ w.condition }}</p>
                    } @else {
                      <p class="truncate text-[0.68rem] uppercase tracking-[0.14em] text-ink-foreground/55">
                        Kampala
                      </p>
                      <p class="mt-0.5 font-display text-lg leading-none text-ink-foreground/80 sm:text-xl">—</p>
                      <p class="mt-1 text-[0.78rem] text-ink-foreground/55">Weather updating</p>
                    }
                  </div>
                </div>

                <div
                  class="group flex min-w-0 items-center gap-3 rounded-2xl border border-ink-foreground/20 bg-ink-foreground/[0.08] px-3.5 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-primary/45 hover:bg-ink-foreground/[0.14] sm:min-w-[11.5rem] sm:px-4 sm:py-3.5"
                >
                  <span
                    class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary ring-1 ring-primary/35 transition duration-300 group-hover:bg-primary/30"
                  >
                    <svg lucideClock class="h-5 w-5" aria-hidden="true"></svg>
                  </span>
                  <div class="min-w-0">
                    <p class="truncate text-[0.68rem] uppercase tracking-[0.14em] text-ink-foreground/55">
                      Local time
                    </p>
                    <p class="mt-0.5 font-display text-lg leading-none tabular-nums text-ink-foreground sm:text-xl">
                      {{ localTime() }}
                    </p>
                    <p class="mt-1 text-[0.78rem] text-ink-foreground/70">EAT · Uganda</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class HeroComponent implements OnInit, OnDestroy {
  private readonly weatherApi = inject(WeatherApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly launchNote = input.required<string>();
  protected readonly activeSlideIndex = signal(0);
  protected readonly outgoingSlide = signal<HeroSlide | null>(null);
  protected readonly isFading = signal(false);
  protected readonly weather = signal<KampalaWeather | null>(null);

  private readonly ugandaTimeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: UGANDA_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  protected readonly localTime = signal(this.formatUgandaTime());
  protected readonly weatherIcon = computed(() => this.iconForCondition(this.weather()?.condition));
  protected readonly activeSlide = () => HERO_SLIDES[this.activeSlideIndex()];

  private slideStartTimer?: ReturnType<typeof setTimeout>;
  private slideInterval?: ReturnType<typeof setInterval>;
  private fadeEndTimer?: ReturnType<typeof setTimeout>;
  private fadeStartFrame?: number;
  private fadeStartFrameNested?: number;
  private clockInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.startLocalClock();
    this.loadWeather();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.preloadSlide(1);
    this.slideStartTimer = window.setTimeout(() => {
      this.advanceSlide();
      this.slideInterval = window.setInterval(() => this.advanceSlide(), 2250);
    }, 250);
  }

  ngOnDestroy(): void {
    if (this.slideStartTimer) clearTimeout(this.slideStartTimer);
    if (this.slideInterval) clearInterval(this.slideInterval);
    if (this.fadeEndTimer) clearTimeout(this.fadeEndTimer);
    if (this.clockInterval) clearInterval(this.clockInterval);
    if (this.fadeStartFrame) cancelAnimationFrame(this.fadeStartFrame);
    if (this.fadeStartFrameNested) cancelAnimationFrame(this.fadeStartFrameNested);
  }

  protected joinSource(): string {
    return resolveWaitlistSource();
  }

  protected goTo(id: string): void {
    scrollToId(id);
  }

  protected formatTemp(celsius: number): string {
    const rounded = Math.round(celsius);
    return `${rounded}°C`;
  }

  private iconForCondition(condition: string | undefined): LucideIconData {
    const label = (condition ?? '').toLowerCase();

    if (label.includes('thunder')) return LucideCloudLightning.icon;
    if (label.includes('snow')) return LucideCloudSnow.icon;
    if (label.includes('drizzle') || label.includes('rain')) return LucideCloudRain.icon;
    if (label.includes('fog')) return LucideCloudFog.icon;
    if (label.includes('overcast') || label === 'unknown') return LucideCloud.icon;
    if (label.includes('partly') || label.includes('mainly')) return LucideCloudSun.icon;
    if (label.includes('clear')) return LucideSun.icon;

    return LucideCloudSun.icon;
  }

  private loadWeather(): void {
    this.weatherApi
      .getKampala()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.weather.set(data),
        error: () => this.weather.set(null),
      });
  }

  private startLocalClock(): void {
    this.localTime.set(this.formatUgandaTime());
    this.clockInterval = window.setInterval(() => {
      this.localTime.set(this.formatUgandaTime());
    }, 60_000);
  }

  private formatUgandaTime(): string {
    return this.ugandaTimeFormatter.format(new Date());
  }

  private advanceSlide(): void {
    this.outgoingSlide.set(this.activeSlide());
    this.isFading.set(false);
    this.activeSlideIndex.update((index) => (index + 1) % HERO_SLIDES.length);
    this.preloadSlide((this.activeSlideIndex() + 1) % HERO_SLIDES.length);

    this.fadeStartFrame = window.requestAnimationFrame(() => {
      this.fadeStartFrameNested = window.requestAnimationFrame(() => this.isFading.set(true));
    });
    this.fadeEndTimer = window.setTimeout(() => {
      this.outgoingSlide.set(null);
      this.isFading.set(false);
    }, 2040);
  }

  private preloadSlide(index: number): void {
    const slide = HERO_SLIDES[index];
    const image = new Image();
    image.src = window.matchMedia('(max-width: 767px)').matches ? slide.mobile : slide.desktop;
  }
}
