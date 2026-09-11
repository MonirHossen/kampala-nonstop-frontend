import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LocalKnowledgeCardComponent } from './local-knowledge-card.component';
import { LocalKnowledgeStore } from './local-knowledge.store';

@Component({
  selector: 'kn-local-knowledge-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LocalKnowledgeCardComponent],
  template: `
    @if (store.items().length > 0) {
      @if (inset()) {
        <section class="mt-12 hidden md:block" aria-label="Local knowledge">
          <p class="eyebrow text-clay">Local knowledge</p>
          <div class="mt-5 grid gap-4 sm:grid-cols-2">
            @for (item of insetItems(); track item.id; let index = $index) {
              <kn-local-knowledge-card [item]="item" [refreshIndex]="index" />
            }
          </div>
        </section>
      } @else {
        <section class="hidden bg-sand/45 md:block" aria-label="Local knowledge">
          <div class="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-20">
            <div class="flex items-center gap-3">
              <span class="h-px w-10 bg-primary"></span>
              <p class="eyebrow text-clay">Local knowledge</p>
            </div>
            <h2
              class="mt-4 max-w-xl font-display text-[1.65rem] leading-tight text-foreground sm:text-[2rem]"
            >
              A little of Uganda, before you go.
            </h2>
            <div [class]="gridClass()">
              @for (item of store.items(); track item.id; let index = $index) {
                <kn-local-knowledge-card [item]="item" [refreshIndex]="index" />
              }
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
export class LocalKnowledgeSectionComponent {
  protected readonly store = inject(LocalKnowledgeStore);

  /** Skip the wide page gutter when the parent already constrains width. */
  readonly inset = input(false);

  protected readonly insetItems = computed(() => this.store.items().slice(0, 2));

  protected readonly gridClass = computed(() => {
    const count = this.store.items().length;
    if (count >= 3) {
      return 'mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5';
    }
    if (count === 1) {
      return 'mt-10 grid max-w-lg gap-4';
    }
    return 'mt-10 grid gap-4 md:grid-cols-2 lg:gap-5';
  });
}
