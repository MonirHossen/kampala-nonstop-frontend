import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { GuideApiService } from '../guide-api.service';
import { toTravelInfoChips } from '../guide-travel-info';
import { GuideTravelInformation } from '../guide.models';
import { GuideInfoTooltipComponent, type GuideTooltipTone } from './guide-info-tooltip.component';

/**
 * Self-loading row of travel-information tooltips.
 *
 * Renders nothing until data arrives and stays silent on failure, so it can be
 * dropped into marketing surfaces without a Guide outage becoming visible.
 */
@Component({
  selector: 'kn-guide-travel-info-chips',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GuideInfoTooltipComponent],
  template: `
    @if (chips().length > 0) {
      <div class="flex flex-wrap gap-2">
        @for (chip of chips(); track chip.id) {
          <kn-guide-info-tooltip
            [label]="chip.name ?? 'Info'"
            [body]="chip.value_text ?? ''"
            [hint]="chip.hint"
            [footnote]="chip.footnote"
            [icon]="chip.icon"
            [tone]="tone()"
            [dense]="dense()"
          />
        }
      </div>
    }
  `,
})
export class GuideTravelInfoChipsComponent implements OnInit {
  private readonly guideApi = inject(GuideApiService);

  readonly countryCode = input('UG');
  readonly tone = input<GuideTooltipTone>('paper');
  readonly dense = input(false);

  private readonly items = signal<GuideTravelInformation[]>([]);
  protected readonly chips = computed(() => toTravelInfoChips(this.items()));

  ngOnInit(): void {
    this.guideApi.getGuide(this.countryCode()).subscribe({
      next: (guide) => this.items.set(guide.travel_information),
      error: () => this.items.set([]),
    });
  }
}
