import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { LocalKnowledgeCardComponent } from './local-knowledge-card.component';
import { LocalKnowledgeStore } from './local-knowledge.store';
import { countryCodeFromUrl, localKnowledgeContextFrom } from './page-context';

const POPUP_DELAY_MS = 8000;
const PHONE_QUERY = '(max-width: 767px)';

const SUPPRESSED_PREFIXES = [
  '/admin',
  '/dashboard',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/auth',
];

@Component({
  selector: 'kn-local-knowledge-popup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LocalKnowledgeCardComponent],
  template: `
    @if (overlayOpen() && isPhone()) {
      @if (store.current(); as item) {
        <aside
          class="kn-lk-popup fixed bottom-4 right-4 z-[60] w-[min(92vw,22rem)] md:hidden"
          role="status"
          aria-live="polite"
          [class.kn-lk-popup--static]="reducedMotion"
        >
          <kn-local-knowledge-card
            [item]="item"
            [showClose]="true"
            [refreshIndex]="0"
            (close)="dismissOverlay()"
          />
        </aside>
      }
    }
  `,
  styles: `
    .kn-lk-popup {
      animation: kn-lk-in 0.22s cubic-bezier(0.19, 1, 0.22, 1) both;
    }

    .kn-lk-popup--static {
      animation: none;
    }

    @keyframes kn-lk-in {
      from {
        opacity: 0;
        transform: translate3d(0, 10px, 0);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .kn-lk-popup {
        animation: none;
      }
    }
  `,
})
export class LocalKnowledgePopupComponent implements OnInit {
  protected readonly store = inject(LocalKnowledgeStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private timer: ReturnType<typeof setTimeout> | null = null;
  private phoneQuery: MediaQueryList | null = null;
  private dismissed = false;

  protected readonly overlayOpen = signal(false);
  protected readonly isPhone = signal(false);
  protected readonly reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.phoneQuery = window.matchMedia(PHONE_QUERY);
      this.isPhone.set(this.phoneQuery.matches);
      this.phoneQuery.addEventListener('change', this.onViewportChange);
      this.destroyRef.onDestroy(() => {
        this.phoneQuery?.removeEventListener('change', this.onViewportChange);
      });
    }

    this.scheduleForUrl(this.router.url);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.scheduleForUrl(event.urlAfterRedirects);
      });

    this.destroyRef.onDestroy(() => this.clearTimer());
  }

  protected dismissOverlay(): void {
    this.dismissed = true;
    this.clearTimer();
    this.overlayOpen.set(false);
  }

  private readonly onViewportChange = (event: MediaQueryListEvent): void => {
    this.isPhone.set(event.matches);
    if (!event.matches) {
      this.clearTimer();
      this.overlayOpen.set(false);
      return;
    }

    const path = this.pathFromUrl(this.router.url);
    if (!this.dismissed && !this.isSuppressed(path) && this.store.current()) {
      this.overlayOpen.set(true);
    }
  };

  private scheduleForUrl(url: string): void {
    this.clearTimer();
    this.dismissed = false;
    this.overlayOpen.set(false);

    const path = this.pathFromUrl(url);
    if (this.isSuppressed(path)) {
      this.store.clear();
      return;
    }

    const countryCode = countryCodeFromUrl(path);
    const pageContext = localKnowledgeContextFrom(this.router.routerState.snapshot.root);
    this.store.fetchRandom({ countryCode, pageContext });

    if (!this.isPhone()) {
      return;
    }

    const delay = this.reducedMotion ? 400 : POPUP_DELAY_MS;
    this.timer = setTimeout(() => {
      if (
        !this.dismissed &&
        this.isPhone() &&
        !this.isSuppressed(this.pathFromUrl(this.router.url))
      ) {
        this.overlayOpen.set(true);
      }
    }, delay);
  }

  private pathFromUrl(url: string): string {
    return url.split('?')[0].split('#')[0];
  }

  private isSuppressed(path: string): boolean {
    return SUPPRESSED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
