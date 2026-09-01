import { ChangeDetectionStrategy, Component, HostListener, computed, inject, input, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { resolveWaitlistSource } from '../core/lib/tracking';
import { scrollToId } from '../shared/scroll-to';

@Component({
  selector: 'kn-site-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <header
      class="fixed inset-x-0 top-0 z-50 transition-colors duration-500"
      [class]="
        headerSolid()
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
              headerSolid()
                ? '/img/kampala_nonstop_logo.png'
                : '/img/kampala_nonstop_logo_white.png'
            "
            alt="Kampala Nonstop logo"
            class="h-8 w-auto transition-all sm:h-9"
          />
        </a>

        <nav class="flex items-center gap-6 sm:gap-8">
          @if (showJoinCta()) {
            <button
              type="button"
              (click)="goToJoin()"
              class="eyebrow cursor-pointer bg-primary text-primary-foreground px-4 py-2.5 transition-transform duration-300 hover:-translate-y-0.5 sm:px-5"
            >
              Join the Waitlist
            </button>
          }
        </nav>
      </div>
    </header>
  `,
})
export class SiteHeaderComponent {
  /** Use on light-background pages so the dark logo and solid header show immediately. */
  readonly lightBackground = input(false);

  private readonly router = inject(Router);

  protected readonly scrolled = signal(false);
  protected readonly showJoinCta = signal(!this.isJoinPath(this.router.url));
  protected readonly headerSolid = computed(() => this.lightBackground() || this.scrolled());

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.showJoinCta.set(!this.isJoinPath(event.urlAfterRedirects)));
  }

  @HostListener('window:scroll')
  protected onScroll(): void {
    this.scrolled.set(window.scrollY > 40);
  }

  /** On the join page this scrolls to the form; anywhere else it navigates there. */
  protected goToJoin(): void {
    if (this.isJoinPath(this.router.url)) {
      scrollToId('waitlist');
      return;
    }

    void this.router.navigate(['/waitlist/join'], {
      queryParams: { source: resolveWaitlistSource() },
    });
  }

  private isJoinPath(url: string): boolean {
    return url.split('?')[0].split('#')[0] === '/waitlist/join';
  }
}
