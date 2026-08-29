import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideCheck } from '@lucide/angular';
import { INTERESTS } from '../core/lib/interests';

@Component({
  selector: 'kn-interest-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideCheck],
  template: `
    <fieldset>
      <legend class="font-display text-xl text-foreground sm:text-2xl">What interests you?</legend>
      <p class="mt-1 text-sm text-muted-foreground">Select all that apply.</p>

      <div class="mt-5 flex flex-wrap gap-2.5">
        @for (interest of interests; track interest) {
          @let active = selected().includes(interest);
          <button
            type="button"
            [attr.aria-pressed]="active"
            (click)="toggle.emit(interest)"
            class="flex items-center gap-2 border px-4 py-3 text-[0.9rem] transition-all duration-200 min-h-11"
            [class]="
              active
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input text-foreground hover:border-foreground'
            "
          >
            @if (active) {
              <svg lucideCheck class="h-3.5 w-3.5"></svg>
            }
            {{ interest }}
          </button>
        }
      </div>
    </fieldset>
  `,
})
export class InterestSelectorComponent {
  readonly selected = input<string[]>([]);
  readonly toggle = output<string>();

  protected readonly interests = INTERESTS;
}
