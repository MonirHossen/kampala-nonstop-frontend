import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
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
      <section class="bg-sand/45" aria-label="Local knowledge">
        <div class="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-20">
          <div class="mx-auto max-w-4xl">
            <kn-local-knowledge-card [item]="item" />
          </div>
        </div>
      </section>
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
