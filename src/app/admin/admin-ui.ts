import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideLoaderCircle } from '@lucide/angular';

@Component({
  selector: 'kn-loading-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideLoaderCircle],
  template: `
    <div class="flex items-center justify-center gap-2.5 py-16 text-sm text-muted-foreground">
      <svg lucideLoaderCircle class="h-4 w-4 animate-spin"></svg>
      {{ label() }}&hellip;
    </div>
  `,
})
export class LoadingStateComponent {
  readonly label = input('Loading');
}

@Component({
  selector: 'kn-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="border border-dashed border-input px-6 py-16 text-center">
      <p class="font-display text-xl text-foreground">{{ title() }}</p>
      <p class="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{{ body() }}</p>
    </div>
  `,
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly body = input.required<string>();
}

@Component({
  selector: 'kn-error-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="border-l-2 border-destructive bg-destructive/5 px-5 py-4">
      <p class="text-sm text-destructive">{{ message() }}</p>
      <button
        type="button"
        (click)="retry.emit()"
        class="eyebrow mt-2 text-destructive underline-offset-4 hover:underline"
      >
        Try again
      </button>
    </div>
  `,
})
export class ErrorStateComponent {
  readonly message = input.required<string>();
  readonly retry = output<void>();
}

@Component({
  selector: 'kn-stat-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="border border-hairline bg-paper px-5 py-5">
      <p class="eyebrow text-muted-foreground">{{ label() }}</p>
      <p class="font-display mt-2 text-3xl leading-none text-foreground">{{ value() }}</p>
    </div>
  `,
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<number | string>();
}

const STATUS_TONES: Record<string, string> = {
  new: 'border-primary/40 text-primary',
  contacted: 'border-clay/40 text-clay',
  converted: 'border-forest/40 text-forest',
  archived: 'border-input text-muted-foreground',
};

@Component({
  selector: 'kn-status-pill',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="eyebrow inline-flex border px-2 py-1 text-[0.6rem]" [class]="tone()">
      {{ status() }}
    </span>
  `,
})
export class StatusPillComponent {
  readonly status = input.required<string>();

  protected tone(): string {
    return STATUS_TONES[this.status()] ?? 'border-input text-muted-foreground';
  }
}
