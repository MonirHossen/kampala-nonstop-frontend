import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { LucideLightbulb, LucideX } from '@lucide/angular';
import { filter } from 'rxjs';
import { LocalKnowledgeStore } from './local-knowledge.store';
import { countryCodeFromUrl, localKnowledgeContextFrom } from './page-context';

const POPUP_DELAY_MS = 8000;

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
  imports: [LucideLightbulb, LucideX],
  template: `
    @if (store.isVisible()) {
      @if (store.current(); as item) {
        <aside
          class="kn-lk-popup fixed bottom-4 right-4 z-[60] w-[min(92vw,22rem)]"
          role="status"
          aria-live="polite"
          [class.kn-lk-popup--static]="reducedMotion"
        >
          <div
            class="relative overflow-hidden rounded-xl bg-gradient-to-br from-ink via-ink to-clay text-ink-foreground shadow-[0_26px_50px_-20px_rgba(28,20,12,0.75)]"
          >
            <button
              type="button"
              class="absolute right-3 top-3 rounded-md p-1 text-ink-foreground/50 transition-colors hover:text-ink-foreground"
              aria-label="Dismiss local knowledge"
              (click)="store.dismiss()"
            >
              <svg lucideX class="h-4 w-4" aria-hidden="true"></svg>
            </button>

            <div class="px-5 py-4 pr-10">
              <span class="flex items-center gap-2">
                <svg lucideLightbulb class="h-3.5 w-3.5 text-primary" aria-hidden="true"></svg>
                <span class="eyebrow text-primary">{{ item.type?.name ?? 'Local knowledge' }}</span>
              </span>

              @if (item.title) {
                <h2 class="mt-2.5 font-display text-lg leading-snug">{{ item.title }}</h2>
              }

              <p class="mt-2.5 text-[0.9rem] leading-[1.65] text-ink-foreground/85">
                {{ item.content }}
              </p>

              @if (item.explanation) {
                <p class="mt-3 text-[0.82rem] leading-relaxed text-ink-foreground/60">
                  {{ item.explanation }}
                </p>
              }

              @if (item.language; as language) {
                <p
                  class="mt-3.5 border-t border-ink-foreground/12 pt-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-ink-foreground/45"
                >
                  {{ language.name }}
                  @if (language.native_name && language.native_name !== language.name) {
                    · {{ language.native_name }}
                  }
                </p>
              }
            </div>
          </div>
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
  protected readonly reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  ngOnInit(): void {
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

  private scheduleForUrl(url: string): void {
    this.clearTimer();
    this.store.dismiss();

    const path = url.split('?')[0].split('#')[0];
    if (this.isSuppressed(path)) {
      return;
    }

    const delay = this.reducedMotion ? 400 : POPUP_DELAY_MS;
    const countryCode = countryCodeFromUrl(path);
    const pageContext = localKnowledgeContextFrom(this.router.routerState.snapshot.root);

    this.timer = setTimeout(() => {
      this.store.fetchRandom({ countryCode, pageContext });
    }, delay);
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
