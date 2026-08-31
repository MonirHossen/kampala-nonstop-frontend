import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { resolveWaitlistSource } from '../core/lib/tracking';
import { RevealDirective } from '../shared/reveal.directive';
import { scrollToId } from '../shared/scroll-to';

@Component({
  selector: 'kn-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, RouterLink],
  template: `
    <section class="relative min-h-[100svh] overflow-hidden bg-ink">
      <div class="absolute inset-0">
        <img
          src="/img/hero-kampala.jpg"
          alt="Kampala's hills and skyline glowing at golden hour"
          width="1920"
          height="1280"
          class="drift h-full w-full object-cover object-center opacity-[0.78]"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-transparent"></div>
      </div>

      <div
        class="relative mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-end px-5 pb-14 pt-28 sm:px-8 sm:pb-20"
      >
        <div knReveal class="max-w-4xl">
          <div class="flex items-center gap-3">
            <span class="h-px w-10 bg-primary"></span>
            <p class="eyebrow text-ink-foreground/85">Uganda . Travel . Culture . Concierge</p>
          </div>

          <h1
            class="mt-5 text-[42px] leading-[1.05] font-bold text-ink-foreground [font-family:'Noto_Sans_KR',sans-serif] md:text-[52px] lg:text-[64px]"
          >
            Join our waiting list and 
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
              class="eyebrow bg-primary text-primary-foreground px-8 py-4 text-center transition-transform duration-300 hover:-translate-y-0.5"
            >
              Join the Waitlist
            </a>
            <button
              type="button"
              (click)="goTo('experiences')"
              class="eyebrow border border-ink-foreground/30 px-8 py-4 text-ink-foreground transition-colors duration-300 hover:border-primary hover:text-primary"
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
export class HeroComponent {
  readonly launchNote = input.required<string>();

  protected joinSource(): string {
    return resolveWaitlistSource();
  }

  protected goTo(id: string): void {
    scrollToId(id);
  }
}
