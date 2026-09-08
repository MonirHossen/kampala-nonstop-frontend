import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RevealDirective } from '../../shared/reveal.directive';
import { toTravelInfoChips } from '../guide-travel-info';
import { GuideTravelInformation } from '../guide.models';
import { GuideInfoTooltipComponent } from './guide-info-tooltip.component';

/**
 * Compact travel-information block for Guide pages. Sits inline inside a page
 * container and takes items from the already-loaded composition.
 */
@Component({
  selector: 'kn-guide-travel-info-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GuideInfoTooltipComponent, RevealDirective],
  template: `
    @if (chips().length > 0) {
      <div class="border-t border-hairline pt-9">
        <div class="flex flex-wrap items-end justify-between gap-x-8 gap-y-2" knReveal>
          <div>
            <p class="eyebrow text-clay">Travel information</p>
            <h2 class="mt-2 font-display text-2xl leading-tight text-foreground sm:text-[1.75rem]">
              {{ countryName() }} right now
            </h2>
          </div>
          <p class="max-w-sm text-[0.85rem] leading-relaxed text-muted-foreground">
            Short operational notes that change more often than the guide itself.
          </p>
        </div>

        <div class="mt-6 flex flex-wrap gap-2.5">
          @for (chip of chips(); track chip.id) {
            <kn-guide-info-tooltip
              [label]="chip.name ?? 'Info'"
              [body]="chip.value_text ?? ''"
              [hint]="chip.hint"
              [footnote]="chip.footnote"
              [icon]="chip.icon"
            />
          }
        </div>
      </div>
    }
  `,
})
export class GuideTravelInfoSectionComponent {
  readonly travelInformation = input<GuideTravelInformation[]>([]);
  readonly countryName = input('Uganda');

  protected readonly chips = computed(() => toTravelInfoChips(this.travelInformation()));
}
