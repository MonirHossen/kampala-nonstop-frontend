import { ChangeDetectionStrategy, Component, OnInit, inject, input, output, signal } from '@angular/core';
import {
  LucideCalendarDays,
  LucideEllipsis,
  LucideLandmark,
  LucideMountain,
  LucideMusic,
  LucideSparkles,
  LucideTreePine,
  LucideTrophy,
  LucideUtensilsCrossed,
} from '@lucide/angular';
import { type InterestOption } from '../core/lib/interests';
import { WaitlistApiService } from '../core/services/waitlist-api.service';

@Component({
  selector: 'kn-interest-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideUtensilsCrossed,
    LucideLandmark,
    LucideMusic,
    LucideTreePine,
    LucideMountain,
    LucideCalendarDays,
    LucideSparkles,
    LucideTrophy,
    LucideEllipsis,
  ],
  template: `
    <fieldset class="border-0 p-0">
      @if (variant() === 'join') {
        <legend class="text-[0.95rem] font-semibold text-[#1c1917]">
          What interests you?
          <span class="font-normal text-[#78716c]">(Select all that apply)</span>
        </legend>
      } @else {
        <legend class="font-display text-xl text-foreground sm:text-2xl">What interests you?</legend>
        <p class="mt-1 text-sm text-muted-foreground">Select all that apply.</p>
      }

      @if (loading()) {
        <p class="mt-4 text-sm text-muted-foreground">Loading interests&hellip;</p>
      } @else if (loadError()) {
        <p class="mt-4 text-sm text-destructive" role="alert">{{ loadError() }}</p>
      } @else if (variant() === 'join') {
        <div class="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          @for (interest of interests(); track interest.code) {
            @let active = selected().includes(interest.code);
            <button
              type="button"
              [attr.aria-pressed]="active"
              (click)="toggle.emit(interest.code)"
              class="flex min-h-[4.75rem] flex-col items-center justify-center gap-1.5 rounded-lg border px-2 py-3 text-center transition-all duration-150"
              [class]="
                active
                  ? 'border-[#f97316] bg-[#fff7ed] shadow-[inset_0_0_0_1px_#f97316]'
                  : 'border-[#e7e5e4] bg-white hover:border-[#fdba74]'
              "
            >
              @switch (interest.code) {
                @case ('food_local_life') {
                  <svg lucideUtensilsCrossed class="h-[1.15rem] w-[1.15rem] text-[#f97316]"></svg>
                }
                @case ('culture_heritage') {
                  <svg lucideLandmark class="h-[1.15rem] w-[1.15rem] text-[#f97316]"></svg>
                }
                @case ('music_nightlife_entertainment') {
                  <svg lucideMusic class="h-[1.15rem] w-[1.15rem] text-[#f97316]"></svg>
                }
                @case ('nature_wildlife') {
                  <svg lucideTreePine class="h-[1.15rem] w-[1.15rem] text-[#f97316]"></svg>
                }
                @case ('adventure_outdoors') {
                  <svg lucideMountain class="h-[1.15rem] w-[1.15rem] text-[#f97316]"></svg>
                }
                @case ('events_festivals') {
                  <svg lucideCalendarDays class="h-[1.15rem] w-[1.15rem] text-[#f97316]"></svg>
                }
                @case ('wellness_relaxation') {
                  <svg lucideSparkles class="h-[1.15rem] w-[1.15rem] text-[#f97316]"></svg>
                }
                @case ('sports_recreation') {
                  <svg lucideTrophy class="h-[1.15rem] w-[1.15rem] text-[#f97316]"></svg>
                }
                @default {
                  <svg lucideEllipsis class="h-[1.15rem] w-[1.15rem] text-[#f97316]"></svg>
                }
              }
              <span
                class="text-[0.72rem] font-semibold leading-tight sm:text-[0.76rem]"
                [class]="active ? 'text-[#c2410c]' : 'text-[#9a3412]'"
                >{{ interest.name }}</span
              >
            </button>
          }
        </div>
      } @else {
        <div class="mt-5 flex flex-wrap gap-2.5">
          @for (interest of interests(); track interest.code) {
            @let active = selected().includes(interest.code);
            <button
              type="button"
              [attr.aria-pressed]="active"
              (click)="toggle.emit(interest.code)"
              class="flex items-center gap-2 border px-4 py-3 text-[0.9rem] transition-all duration-200 min-h-11"
              [class]="
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input text-foreground hover:border-foreground'
              "
            >
              {{ interest.name }}
            </button>
          }
        </div>
      }
    </fieldset>
  `,
})
export class InterestSelectorComponent implements OnInit {
  readonly selected = input<string[]>([]);
  readonly variant = input<'default' | 'join'>('default');
  readonly toggle = output<string>();

  private readonly waitlistApi = inject(WaitlistApiService);

  protected readonly interests = signal<InterestOption[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);

  ngOnInit(): void {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.loadError.set(null);
    try {
      const rows = await this.waitlistApi.listInterestTypes();
      this.interests.set(rows);
    } catch {
      this.loadError.set('Could not load interests. Please refresh and try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
