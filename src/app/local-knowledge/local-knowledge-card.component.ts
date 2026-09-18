import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { LucideLightbulb, LucideRefreshCw, LucideX } from '@lucide/angular';
import { LocalKnowledgeItem } from './local-knowledge.models';
import { LocalKnowledgeStore } from './local-knowledge.store';

@Component({
  selector: 'kn-local-knowledge-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideLightbulb, LucideRefreshCw, LucideX],
  template: `
    <div
      class="relative flex h-full min-h-[18rem] flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-ink via-ink to-clay text-ink-foreground shadow-[0_26px_50px_-20px_rgba(28,20,12,0.55)] sm:min-h-[20rem]"
    >
      @if (showClose()) {
        <button
          type="button"
          class="absolute right-1.5 top-1.5 z-10 flex h-10 w-10 items-center justify-center rounded-md text-ink-foreground/50 transition-colors hover:text-ink-foreground"
          aria-label="Dismiss local knowledge"
          (click)="onClose($event)"
        >
          <svg lucideX class="pointer-events-none h-4 w-4" aria-hidden="true"></svg>
        </button>
      }

      @for (entry of [item()]; track entry.id) {
        <div
          class="kn-lk-card-copy flex flex-1 flex-col px-7 pb-16 pt-7 sm:px-8 sm:pb-[4.5rem] sm:pt-8"
          [class.pr-14]="showClose()"
          [class.kn-lk-card-copy--static]="reducedMotion"
        >
          <span class="flex items-center gap-2.5">
            <svg lucideLightbulb class="h-4 w-4 text-primary" aria-hidden="true"></svg>
            <span class="eyebrow text-primary">{{ entry.type?.name ?? 'Local knowledge' }}</span>
          </span>

          @if (entry.title) {
            <h3 class="mt-4 font-display text-xl leading-snug sm:text-[1.65rem]">{{ entry.title }}</h3>
          }

          <p class="mt-4 text-[1rem] leading-[1.7] text-ink-foreground/85 sm:text-[1.08rem]">
            {{ entry.content }}
          </p>

          @if (entry.explanation) {
            <p class="mt-4 text-[0.92rem] leading-relaxed text-ink-foreground/60 sm:text-[0.98rem]">
              {{ entry.explanation }}
            </p>
          }

          @if (entry.language; as language) {
            <p
              class="mt-auto border-t border-ink-foreground/12 pt-3.5 text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-ink-foreground/45"
            >
              {{ language.name }}
              @if (language.native_name && language.native_name !== language.name) {
                · {{ language.native_name }}
              }
            </p>
          }
        </div>
      }

      <button
        type="button"
        class="absolute bottom-1.5 right-1.5 z-10 flex h-10 w-10 items-center justify-center rounded-md text-ink-foreground/50 transition-colors hover:text-ink-foreground disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Show another local knowledge"
        [disabled]="isRefreshing()"
        (click)="store.refresh(refreshIndex())"
      >
        <svg
          lucideRefreshCw
          class="pointer-events-none h-4 w-4"
          [class.animate-spin]="isRefreshing()"
          aria-hidden="true"
        ></svg>
      </button>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }

    .kn-lk-card-copy {
      animation: kn-lk-copy-in 0.18s ease both;
    }

    .kn-lk-card-copy--static {
      animation: none;
    }

    @keyframes kn-lk-copy-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
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
