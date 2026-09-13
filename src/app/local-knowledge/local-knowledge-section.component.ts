import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { LocalKnowledgeCardComponent } from './local-knowledge-card.component';
import { LocalKnowledgeStore } from './local-knowledge.store';
import { countryCodeFromUrl, localKnowledgeContextFrom } from './page-context';

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
  selector: 'kn-local-knowledge-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LocalKnowledgeCardComponent],
  template: `
    @if (store.current(); as item) {
      @if (inset()) {
        <section class="mt-12" aria-label="Local knowledge">
          <p class="eyebrow text-clay">Local knowledge</p>
          <div class="mt-5 max-w-2xl">
            <kn-local-knowledge-card [item]="item" />
          </div>
        </section>
      } @else {
        <section class="bg-background" aria-label="Local knowledge">
          <div class="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-20">
            <div
              class="grid items-start gap-8 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[minmax(0,22rem)_minmax(0,40rem)]"
            >
              <header class="max-w-md">
                <div class="flex items-center gap-3">
                  <span class="h-px w-10 bg-primary"></span>
                  <p class="eyebrow text-clay">Local knowledge</p>
                </div>
                <h2
                  class="mt-4 font-display text-[1.65rem] leading-tight text-foreground sm:text-[2rem]"
                >
                  A little of Uganda, before you go.
                </h2>
                <p class="mt-3 text-[0.95rem] leading-relaxed text-foreground/65">
                  One tip at a time — culture, phrases, and practical know-how from locals.
                </p>
              </header>

              <div class="w-full max-w-2xl lg:max-w-none">
                <kn-local-knowledge-card [item]="item" />
              </div>
            </div>
          </div>
        </section>
      }
    }
  `,
  styles: `
    :host {
      display: contents;
    }
  `,
})
export class LocalKnowledgeSectionComponent implements OnInit {
  protected readonly store = inject(LocalKnowledgeStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  /** Skip the wide page gutter when the parent already constrains width. */
  readonly inset = input(false);

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
  }

  private scheduleForUrl(url: string): void {
    const path = url.split('?')[0].split('#')[0];
    if (this.isSuppressed(path)) {
      this.store.clear();
      return;
    }

    const countryCode = countryCodeFromUrl(path);
    const pageContext = localKnowledgeContextFrom(this.router.routerState.snapshot.root);
    this.store.fetchRandom({ countryCode, pageContext });
  }

  private isSuppressed(path: string): boolean {
    return SUPPRESSED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
  }
}
