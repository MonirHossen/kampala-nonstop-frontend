import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { LucideArrowRight, LucideDynamicIcon } from '@lucide/angular';
import { GuideRegion } from '../content/guide-content.types';
import { guideRegionIcon } from '../guide-topic-icons';
import { GuideJumpBarComponent } from './guide-jump-bar.component';
import {
  guideScrollBehavior,
  observeGuidePickerVisibility,
  scheduleRevealGuidePanel,
} from './guide-picker-reveal';

@Component({
  selector: 'kn-guide-regions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GuideJumpBarComponent, LucideDynamicIcon, LucideArrowRight],
  template: `
    <section>
      <div class="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-20">
        <div #picker class="scroll-mt-20">
          <h2 class="font-display text-3xl text-foreground sm:text-4xl">Find your bearings</h2>
          <p class="mt-3 max-w-xl text-muted-foreground">
            {{ intro() }}
          </p>

          <ul class="mt-8 grid gap-3 sm:grid-cols-2" role="listbox" aria-label="Uganda regions">
            @for (region of regions(); track region.code) {
              <li>
                <button
                  type="button"
                  role="option"
                  [attr.aria-selected]="isSelected(region)"
                  (click)="select(region)"
                  class="group relative flex h-full w-full flex-col overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  [class]="cardClass(region)"
                >
                  @if (isSelected(region)) {
                    <span class="absolute inset-x-0 top-0 h-0.5 bg-primary" aria-hidden="true"></span>
                  }

                  <span
                    class="pointer-events-none absolute -bottom-2 -right-0.5 font-display text-[4.5rem] leading-none"
                    [class]="isSelected(region) ? 'text-ink-foreground/[0.08]' : 'text-ink/[0.06]'"
                    aria-hidden="true"
                  >
                    {{ bearingLetter(region.code) }}
                  </span>

                  <span class="relative flex items-start justify-between gap-3">
                    <span class="kn-bearing" [attr.data-bearing]="region.code" aria-hidden="true">
                      <span class="n">N</span>
                      <span class="w">W</span>
                      <span class="c"></span>
                      <span class="e">E</span>
                      <span class="s">S</span>
                    </span>

                    <span
                      class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors duration-300"
                      [class]="iconWrapClass(region)"
                    >
                      <svg
                        lucideIcon
                        [lucideIcon]="iconFor(region.code)"
                        class="h-4 w-4"
                        aria-hidden="true"
                      ></svg>
                    </span>
                  </span>

                  <span class="relative mt-3 block font-display text-xl leading-tight sm:text-2xl">
                    {{ region.title }}
                  </span>

                  <span
                    class="relative mt-1.5 flex-1 text-[0.82rem] leading-relaxed"
                    [class]="isSelected(region) ? 'text-ink-foreground/70' : 'text-muted-foreground'"
                  >
                    {{ region.summary }}
                  </span>

                  <span class="relative mt-3 flex items-center justify-between gap-3">
                    <span
                      class="text-[0.62rem] font-semibold uppercase tracking-[0.14em]"
                      [class]="isSelected(region) ? 'text-ink-foreground/45' : 'text-muted-foreground'"
                    >
                      {{ region.keyAreas.length }}
                      {{ region.keyAreas.length === 1 ? 'destination' : 'destinations' }}
                    </span>
                    <span
                      class="inline-flex items-center gap-1 text-[0.82rem] font-semibold text-primary"
                    >
                      Open
                      <svg
                        lucideArrowRight
                        class="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      ></svg>
                    </span>
                  </span>
                </button>
              </li>
            }
          </ul>
        </div>
      </div>
    </section>

    <kn-guide-jump-bar
      [visible]="showJumpBar()"
      [label]="selectedLabel()"
      [icon]="iconFor(selectedCode())"
      backLabel="Regions"
      (back)="scrollToPicker()"
    />
  `,
  styles: `
    .kn-bearing {
      display: grid;
      width: 2.4rem;
      height: 2.4rem;
      grid-template-columns: 1fr 1fr 1fr;
      grid-template-rows: 1fr 1fr 1fr;
      place-items: center;
      font-size: 0.55rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      line-height: 1;
    }

    .kn-bearing .n {
      grid-area: 1 / 2;
    }
    .kn-bearing .w {
      grid-area: 2 / 1;
    }
    .kn-bearing .c {
      grid-area: 2 / 2;
      width: 0.34rem;
      height: 0.34rem;
      border-radius: 1px;
      background: currentColor;
      opacity: 0.28;
    }
    .kn-bearing .e {
      grid-area: 2 / 3;
    }
    .kn-bearing .s {
      grid-area: 3 / 2;
    }

    .kn-bearing .n,
    .kn-bearing .e,
    .kn-bearing .s,
    .kn-bearing .w {
      opacity: 0.32;
    }

    .kn-bearing[data-bearing='NORTH'] .n,
    .kn-bearing[data-bearing='EAST'] .e,
    .kn-bearing[data-bearing='WEST'] .w {
      color: var(--color-primary);
      opacity: 1;
    }

    .kn-bearing[data-bearing='CENTRAL'] .c {
      background: var(--color-primary);
      opacity: 1;
    }
  `,
})
export class GuideRegionsComponent implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly picker = viewChild<ElementRef<HTMLElement>>('picker');

  readonly regions = input.required<GuideRegion[]>();
  readonly intro = input.required<string>();
  readonly selectedCode = input<string | null>(null);
  readonly panelId = input.required<string>();
  readonly regionSelect = output<GuideRegion>();

  private readonly pickerVisible = signal(true);

  protected readonly selectedLabel = computed(() => {
    const code = this.selectedCode();
    return this.regions().find((region) => region.code === code)?.title ?? 'Regions';
  });

  protected readonly showJumpBar = computed(() => !this.pickerVisible());

  ngAfterViewInit(): void {
    const picker = this.picker()?.nativeElement;
    if (picker) {
      observeGuidePickerVisibility(
        picker,
        (visible) => this.pickerVisible.set(visible),
        this.destroyRef,
      );
    }
  }

  protected select(region: GuideRegion): void {
    this.regionSelect.emit(region);
    scheduleRevealGuidePanel(this.panelId());
  }

  protected scrollToPicker(): void {
    this.picker()?.nativeElement.scrollIntoView({
      behavior: guideScrollBehavior(),
      block: 'start',
    });
  }

  protected isSelected(region: GuideRegion): boolean {
    return region.code === this.selectedCode();
  }

  protected bearingLetter(code: string): string {
    switch (code) {
      case 'WEST':
        return 'W';
      case 'EAST':
        return 'E';
      case 'NORTH':
        return 'N';
      default:
        return 'C';
    }
  }

  protected cardClass(region: GuideRegion): string {
    if (this.isSelected(region)) {
      return 'border-ink bg-gradient-to-br from-ink via-ink to-clay text-ink-foreground shadow-[0_22px_40px_-20px_rgba(28,20,12,0.7)]';
    }

    return 'border-hairline bg-gradient-to-b from-paper to-sand/50 text-foreground hover:-translate-y-1 hover:border-primary/45 hover:to-primary/10 hover:shadow-[0_18px_34px_-22px_rgba(40,28,18,0.5)]';
  }

  protected iconWrapClass(region: GuideRegion): string {
    return this.isSelected(region)
      ? 'bg-primary text-primary-foreground'
      : 'bg-sand/90 text-clay group-hover:bg-primary/15 group-hover:text-primary';
  }

  protected iconFor(code: string | null) {
    return guideRegionIcon(code);
  }
}
