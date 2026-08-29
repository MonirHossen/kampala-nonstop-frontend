import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'kn-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-[90] flex items-center justify-center bg-ink/60 px-4"
      role="dialog"
      aria-modal="true"
      (click)="cancelled.emit()"
    >
      <div
        class="w-full max-w-md border border-hairline bg-paper p-6"
        (click)="$event.stopPropagation()"
      >
        <h2 class="font-display text-xl text-foreground">{{ title() }}</h2>
        <p class="mt-2 text-sm text-muted-foreground">{{ body() }}</p>
        <div class="mt-7 flex justify-end gap-3">
          <button
            type="button"
            (click)="cancelled.emit()"
            class="eyebrow border border-input px-4 py-2.5 text-foreground hover:border-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            (click)="confirmed.emit()"
            class="eyebrow bg-destructive px-4 py-2.5 text-destructive-foreground hover:opacity-90"
          >
            {{ confirmLabel() }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  readonly title = input.required<string>();
  readonly body = input.required<string>();
  readonly confirmLabel = input('Delete');
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
