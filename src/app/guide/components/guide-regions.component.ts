import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { GuideRegion } from '../content/guide-content.types';

@Component({
  selector: 'kn-guide-regions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section>
      <div class="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-20">
        <h2 class="font-display text-3xl text-foreground sm:text-4xl">Find your bearings</h2>
        <p class="mt-3 max-w-xl text-muted-foreground">
          {{ intro() }}
        </p>

        <ul class="mt-10 grid gap-4 sm:grid-cols-2" role="listbox" aria-label="Uganda regions">
          @for (region of regions(); track region.code) {
            <li>
              <button
                type="button"
                role="option"
                [attr.aria-selected]="isSelected(region)"
                (click)="regionSelect.emit(region)"
                class="flex h-full w-full flex-col p-6 text-left rounded-xl border transition-colors"
                [class]="cardClass(region)"
              >
                <h3 class="font-display text-xl">{{ region.title }}</h3>
                <p
                  class="mt-2 text-sm leading-relaxed"
                  [class]="isSelected(region) ? 'text-ink-foreground/70' : 'text-muted-foreground'"
                >
                  {{ region.summary }}
                </p>
              </button>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
})
export class GuideRegionsComponent {
  readonly regions = input.required<GuideRegion[]>();
  readonly intro = input.required<string>();
  readonly selectedCode = input<string | null>(null);
  readonly regionSelect = output<GuideRegion>();

  protected isSelected(region: GuideRegion): boolean {
    return region.code === this.selectedCode();
  }

  protected cardClass(region: GuideRegion): string {
    if (this.isSelected(region)) {
      return 'border-ink bg-ink text-ink-foreground';
    }

    return 'border-hairline bg-paper text-foreground hover:border-primary/45';
  }
}
