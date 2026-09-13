import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { LucideLightbulb, LucideRefreshCw, LucideX } from '@lucide/angular';
import { LocalKnowledgeItem } from './local-knowledge.models';
import { LocalKnowledgeStore } from './local-knowledge.store';

@Component({
  selector: 'kn-local-knowledge-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideLightbulb, LucideRefreshCw, LucideX],
  template: `
    <article
      class="relative overflow-hidden rounded-xl bg-gradient-to-br from-ink via-ink to-clay text-ink-foreground shadow-[0_26px_50px_-22px_rgba(28,20,12,0.55)]"
    >
      @if (showClose()) {
        <button
          type="button"
          class="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-md text-ink-foreground/50 transition-colors hover:text-ink-foreground"
          aria-label="Dismiss local knowledge"
          (click)="onClose($event)"
        >
          <svg lucideX class="pointer-events-none h-4 w-4" aria-hidden="true"></svg>
        </button>
      }

      @for (entry of [item()]; track entry.id) {
        <div
          class="kn-lk-card-copy relative px-6 py-6 sm:px-8 sm:py-8"
          [class.pr-12]="showClose()"
          [class.kn-lk-card-copy--static]="reducedMotion"
        >
          <span class="flex items-center gap-2">
            <svg lucideLightbulb class="h-3.5 w-3.5 text-primary" aria-hidden="true"></svg>
            <span class="eyebrow text-primary">{{ entry.type?.name ?? 'Local knowledge' }}</span>
          </span>

          @if (entry.title) {
            <h3 class="mt-4 font-display text-[1.45rem] leading-snug sm:text-[1.75rem]">
              {{ entry.title }}
            </h3>
          }

          <p class="mt-3 max-w-prose text-[0.98rem] leading-[1.75] text-ink-foreground/85 sm:text-[1.05rem]">
            {{ entry.content }}
          </p>

          @if (entry.explanation) {
            <p class="mt-3 max-w-prose text-[0.9rem] leading-relaxed text-ink-foreground/55">
              {{ entry.explanation }}
            </p>
          }

          <div
            class="mt-7 flex flex-col gap-3 border-t border-ink-foreground/12 pt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <p
              class="min-h-[1.1rem] text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink-foreground/45"
            >
              @if (entry.language; as language) {
                {{ language.name }}
                @if (language.native_name && language.native_name !== language.name) {
                  · {{ language.native_name }}
                }
              } @else if (entry.geographic_area; as area) {
                {{ area.name }}
              }
            </p>

            <button
              type="button"
              class="inline-flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-md text-ink-foreground/55 transition-colors hover:bg-ink-foreground/10 hover:text-ink-foreground disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto"
              aria-label="Show another local knowledge"
              [disabled]="isRefreshing()"
              (click)="store.refresh(refreshIndex())"
            >
              <svg
                lucideRefreshCw
                class="h-4 w-4"
                [class.animate-spin]="isRefreshing()"
                aria-hidden="true"
              ></svg>
            </button>
          </div>
        </div>
      }
    </article>
  `,
  styles: `
    :host {
      display: block;
    }

    .kn-lk-card-copy {
      animation: kn-lk-copy-in 0.2s ease both;
    }

    .kn-lk-card-copy--static {
      animation: none;
    }

    @keyframes kn-lk-copy-in {
      from {
        opacity: 0;
        transform: translateY(4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .kn-lk-card-copy {
        animation: none;
      }
    }
  `,
})
export class LocalKnowledgeCardComponent {
  protected readonly store = inject(LocalKnowledgeStore);

  readonly item = input.required<LocalKnowledgeItem>();
  readonly showClose = input(false);
  readonly refreshIndex = input(0);
  readonly close = output<void>();

  protected readonly reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  protected isRefreshing(): boolean {
    return this.store.refreshingIndex() === this.refreshIndex();
  }

  protected onClose(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.close.emit();
  }
}
