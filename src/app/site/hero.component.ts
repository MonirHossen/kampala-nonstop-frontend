import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { resolveWaitlistSource } from '../core/lib/tracking';
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
    desktop: '/img/hero_food_desktop.png',
    mobile: '/img/hero_food_mobile.png',
    alt: 'A Kampala vendor preparing a rolex at golden hour',
  },
  {
    label: 'Culture & Heritage',
    desktop: '/img/hero_culture_desktop.png',
    mobile: '/img/hero_culture_mobile.png',
    alt: 'An artisan shaping barkcloth in Kampala',
  },
  {
    label: 'Music, Nightlife & Entertainment',
    desktop: '/img/hero_nightlife_desktop.png',
    mobile: '/img/hero_nightlife_mobile.png',
    alt: 'Live music in a Kampala courtyard under warm evening lights',
  },
  {
    label: 'Nature & Wildlife',
    desktop: '/img/hero_nature_desktop.png',
    mobile: '/img/hero_nature_mobile.png',
    alt: 'Golden dawn on Lake Victoria',
  },
  {
    label: 'Adventure & Outdoors',
    desktop: '/img/hero_adventure_desktop.png',
    mobile: '/img/hero_adventure_mobile.png',
    alt: 'Rafting adventure on the Nile near Jinja',
  },
  {
    label: 'Events & Festivals',
    desktop: '/img/hero_events_desktop.png',
    mobile: '/img/hero_events_mobile.png',
    alt: 'Festival crowd in Kampala at dusk',
  },
];

@Component({
  selector: 'kn-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, RouterLink],
  template: `
    <section class="relative min-h-[100svh] overflow-hidden bg-ink">
      <div class="absolute inset-0">
        @if (outgoingSlide(); as outgoing) {
          <picture
            class="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
            [class.opacity-100]="!isFading()"
            [class.opacity-0]="isFading()"
          >
            <source media="(max-width: 767px)" [srcset]="outgoing.mobile" />
            <img
              [src]="outgoing.desktop"
              [alt]="outgoing.alt"
              class="h-full w-full object-cover object-center opacity-[0.78]"
            />
          </picture>
        }

        <picture
          class="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
          [class.opacity-100]="outgoingSlide() === null || isFading()"
          [class.opacity-0]="outgoingSlide() !== null && !isFading()"
        >
          <source media="(max-width: 767px)" [srcset]="activeSlide().mobile" />
          <img
            [src]="activeSlide().desktop"
            [alt]="activeSlide().alt"
            [attr.fetchpriority]="activeSlideIndex() === 0 ? 'high' : null"
            class="h-full w-full object-cover object-center opacity-[0.78]"
          />
        </picture>
        <div class="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-transparent"></div>
      </div>

      <div class="relative mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-end px-5 pb-14 pt-28 sm:px-8 sm:pb-20">
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
            <button
              type="button"
              (click)="goTo('experiences')"
              class="eyebrow cursor-pointer border border-ink-foreground/30 px-8 py-4 text-ink-foreground transition-colors duration-300 hover:border-primary hover:text-primary"
            >
              Experiences
            </button>
          </div>

          <div
            class="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-ink-foreground/15 pt-5"
          >
            <p class="flex items-center gap-2.5 text-sm text-ink-foreground/70">
              <span class="relative flex h-1.5 w-1.5">
                <span
                  class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"
                ></span>
                <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary"></span>
              </span>
              {{ launchNote() }}
            </p>
          </div>
        </div>
      </div>

    </section>
  `,
})
export class HeroComponent implements OnInit, OnDestroy {
  readonly launchNote = input.required<string>();
  protected readonly activeSlideIndex = signal(0);
  protected readonly outgoingSlide = signal<HeroSlide | null>(null);
  protected readonly isFading = signal(false);
  protected readonly activeSlide = () => HERO_SLIDES[this.activeSlideIndex()];

  private slideStartTimer?: ReturnType<typeof setTimeout>;
  private slideInterval?: ReturnType<typeof setInterval>;
  private fadeStartTimer?: ReturnType<typeof setTimeout>;
  private fadeEndTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.preloadSlide(1);
    this.slideStartTimer = window.setTimeout(() => {
      this.advanceSlide();
      this.slideInterval = window.setInterval(() => this.advanceSlide(), 3500);
    }, 2000);
  }

  ngOnDestroy(): void {
    if (this.slideStartTimer) clearTimeout(this.slideStartTimer);
    if (this.slideInterval) clearInterval(this.slideInterval);
    if (this.fadeStartTimer) clearTimeout(this.fadeStartTimer);
    if (this.fadeEndTimer) clearTimeout(this.fadeEndTimer);
  }

  protected joinSource(): string {
    return resolveWaitlistSource();
  }

  protected goTo(id: string): void {
    scrollToId(id);
  }

  private advanceSlide(): void {
    this.outgoingSlide.set(this.activeSlide());
    this.isFading.set(false);
    this.activeSlideIndex.update((index) => (index + 1) % HERO_SLIDES.length);
    this.preloadSlide((this.activeSlideIndex() + 1) % HERO_SLIDES.length);

    this.fadeStartTimer = window.setTimeout(() => this.isFading.set(true), 40);
    this.fadeEndTimer = window.setTimeout(() => {
      this.outgoingSlide.set(null);
      this.isFading.set(false);
    }, 1540);
  }

  private preloadSlide(index: number): void {
    const slide = HERO_SLIDES[index];
    const image = new Image();
    image.src = window.matchMedia('(max-width: 767px)').matches ? slide.mobile : slide.desktop;
  }
}
