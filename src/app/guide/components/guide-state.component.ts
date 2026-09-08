import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GuideLoadState } from '../guide.models';

@Component({
  selector: 'kn-guide-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @switch (state().status) {
      @case ('loading') {
        <div class="mx-auto max-w-[1400px] px-5 py-16 sm:px-8" aria-busy="true" aria-live="polite">
          <div class="h-4 w-40 animate-pulse bg-muted"></div>
          <div class="mt-6 h-10 w-72 max-w-full animate-pulse bg-muted"></div>
          <div class="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            @for (_ of skeletonCards; track $index) {
              <div class="h-36 animate-pulse bg-muted"></div>
            }
          </div>
          <div class="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div class="h-64 animate-pulse bg-muted"></div>
            <div class="h-64 animate-pulse bg-muted"></div>
          </div>
        </div>
      }
      @case ('error') {
        <div class="mx-auto max-w-[1400px] px-5 py-20 sm:px-8">
          <p class="eyebrow text-destructive">Unable to load</p>
          <h2 class="mt-3 font-display text-3xl text-foreground">Guide unavailable</h2>
          <p class="mt-3 max-w-lg text-muted-foreground" role="alert">{{ errorMessage() }}</p>
          <a
            routerLink="/"
            class="mt-8 inline-flex bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Back home
          </a>
        </div>
      }
      @case ('empty') {
        <div class="mx-auto max-w-[1400px] px-5 py-20 sm:px-8">
          <p class="eyebrow text-clay">Country guide</p>
          <h2 class="mt-3 font-display text-3xl text-foreground">No guide published yet</h2>
          <p class="mt-3 max-w-lg text-muted-foreground">
            We do not have a live guide for this destination. Uganda is available to explore now.
          </p>
          <a
            routerLink="/guide/UG"
            class="mt-8 inline-flex bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Open Uganda guide
          </a>
        </div>
      }
    }
  `,
})
export class GuideStateComponent {
  readonly state = input.required<GuideLoadState>();
  protected readonly skeletonCards = Array.from({ length: 10 });
  protected readonly errorMessage = computed(() => {
    const s = this.state();
    return s.status === 'error' ? s.message : '';
  });
}
