import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideChevronUp, LucideDynamicIcon, type LucideIconData } from '@lucide/angular';

@Component({
  selector: 'kn-guide-jump-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideDynamicIcon, LucideChevronUp],
  template: `
    @if (visible()) {
      <div
        class="fixed inset-x-0 top-14 z-40 border-b border-hairline bg-background/95 px-5 py-2 backdrop-blur-sm md:hidden"
      >
        <button
          type="button"
          class="mx-auto flex w-full max-w-[1400px] items-center gap-2.5 text-left"
          (click)="back.emit()"
        >
          <span
            class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"
          >
            <svg lucideIcon [lucideIcon]="icon()" class="h-3.5 w-3.5" aria-hidden="true"></svg>
          </span>
          <span class="min-w-0 flex-1 truncate font-display text-sm text-foreground">
            {{ label() }}
          </span>
          <span class="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-primary">
            {{ backLabel() }}
          </span>
          <svg lucideChevronUp class="h-4 w-4 text-clay" aria-hidden="true"></svg>
        </button>
      </div>
    }
  `,
})
export class GuideJumpBarComponent {
  readonly visible = input(false);
  readonly label = input.required<string>();
  readonly icon = input.required<LucideIconData>();
  readonly backLabel = input('Sections');
  readonly back = output<void>();
}
