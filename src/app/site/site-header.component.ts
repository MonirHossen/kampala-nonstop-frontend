import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { scrollToId } from '../shared/scroll-to';

@Component({
  selector: 'kn-site-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <header
      class="fixed inset-x-0 top-0 z-50 transition-colors duration-500"
      [class]="
        scrolled()
          ? 'bg-background/92 border-b border-hairline backdrop-blur-sm'
          : 'bg-transparent'
      "
    >
      <div
        class="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 sm:h-[76px] sm:px-8"
      >
        <a
          routerLink="/"
          class="font-display text-[1.05rem] leading-none tracking-tight transition-colors sm:text-[1.2rem]"
          [class]="scrolled() ? 'text-foreground' : 'text-ink-foreground'"
        >
          Kampala<span class="text-primary">Nonstop</span>
        </a>

        <nav class="flex items-center gap-6 sm:gap-8">
          <button
            type="button"
            (click)="goTo('experiences')"
            class="eyebrow hidden transition-opacity hover:opacity-60 sm:block"
            [class]="scrolled() ? 'text-muted-foreground' : 'text-ink-foreground/80'"
          >
            Experiences
          </button>
          <button
            type="button"
            (click)="goTo('waitlist')"
            class="eyebrow bg-primary text-primary-foreground px-4 py-2.5 transition-transform duration-300 hover:-translate-y-0.5 sm:px-5"
          >
            Join the Waitlist
          </button>
        </nav>
      </div>
    </header>
  `,
})
export class SiteHeaderComponent {
  protected readonly scrolled = signal(false);

  @HostListener('window:scroll')
  protected onScroll(): void {
    this.scrolled.set(window.scrollY > 40);
  }

  protected goTo(id: string): void {
    scrollToId(id);
  }
}
