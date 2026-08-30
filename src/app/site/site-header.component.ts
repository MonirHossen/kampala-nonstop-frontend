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
          class="inline-flex items-center"
          aria-label="Kampala Nonstop home"
        >
          <img
            [src]="
              scrolled()
                ? '/img/kampala_nonstop_logo.png'
                : '/img/kampala_nonstop_logo_white.png'
            "
            alt="Kampala Nonstop logo"
            class="h-8 w-auto transition-all sm:h-9"
          />
        </a>

        <nav class="flex items-center gap-6 sm:gap-8">
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
