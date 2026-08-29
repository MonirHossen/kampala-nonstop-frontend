import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'kn-toaster',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,22rem)] flex-col gap-2"
      aria-live="polite"
    >
      @for (toast of toasts.toasts(); track toast.id) {
        <div
          class="reveal reveal-in pointer-events-auto flex items-start gap-3 border bg-paper px-4 py-3 shadow-[0_18px_40px_-24px_oklch(0.2_0.02_47/0.55)]"
          [class.border-primary]="toast.tone === 'success'"
          [class.border-destructive]="toast.tone === 'error'"
          role="status"
        >
          <p
            class="flex-1 text-sm"
            [class.text-foreground]="toast.tone === 'success'"
            [class.text-destructive]="toast.tone === 'error'"
          >
            {{ toast.message }}
          </p>
          <button
            type="button"
            class="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Dismiss"
            (click)="toasts.dismiss(toast.id)"
          >
            &times;
          </button>
        </div>
      }
    </div>
  `,
})
export class ToasterComponent {
  protected readonly toasts = inject(ToastService);
}
