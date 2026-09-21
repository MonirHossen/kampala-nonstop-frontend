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

const UGANDA_OUTLINE_D =
  'M10.4 90.33 L10.69 86.67 L12.16 83.0 L13.33 79.33 L14.07 74.93 L15.09 70.53 L15.97 63.2 L16.56 55.13 L16.12 49.27 L18.03 43.84 L20.67 46.33 L25.36 40.47 L31.67 30.2 L35.33 21.4 L30.2 14.8 L34.6 12.16 L47.8 8.93 L62.47 8.2 L74.93 9.67 L85.49 12.16 L90.77 22.13 L89.89 27.27 L88.13 33.87 L88.87 41.93 L86.67 50.73 L83.0 56.6 L80.07 62.47 L78.16 69.07 L76.11 76.4 L73.17 83.0 L66.13 87.84 L53.67 90.33 L44.13 89.6 L35.33 88.43 L27.27 89.01 L20.67 90.77 Z';

const UGANDA_LAKE_VICTORIA_D =
  'M76.7 78.6 L75.89 82.19 L73.54 85.35 L69.95 87.69 L65.54 88.94 L60.86 88.94 L56.45 87.69 L52.86 85.35 L50.51 82.19 L49.7 78.6 L50.51 75.01 L52.86 71.85 L56.45 69.51 L60.86 68.26 L65.54 68.26 L69.95 69.51 L73.54 71.85 L75.89 75.01 Z';

const UGANDA_LAKE_ALBERT_D =
  'M33.8 47.8 L33.58 50.06 L32.96 52.04 L32.0 53.52 L30.83 54.3 L29.57 54.3 L28.4 53.52 L27.44 52.04 L26.82 50.06 L26.6 47.8 L26.82 45.54 L27.44 43.56 L28.4 42.08 L29.57 41.3 L30.83 41.3 L32.0 42.08 L32.96 43.56 L33.58 45.54 Z';

const UGANDA_PINS: Readonly<Record<string, { x: number; y: number }>> = {
  NORTH: { x: 50.0, y: 28.44 },
  WEST: { x: 19.93, y: 59.53 },
  CENTRAL: { x: 52.5, y: 57.5 },
  EAST: { x: 63.2, y: 62.91 },
};

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

                  <span class="relative flex items-center justify-between gap-3">
                    <span
                      class="kn-minmap relative block w-16 shrink-0 sm:w-[4.25rem]"
                      [class]="
                        isSelected(region)
                          ? 'text-ink-foreground/85'
                          : 'text-ink/75'
                      "
                    >
                      <svg
                        viewBox="0 0 100 100"
                        class="h-auto w-full overflow-visible"
                        role="img"
                        [attr.aria-label]="region.title + ' region highlighted on the map of Uganda'"
                        focusable="false"
                      >
                        <defs>
                          <clipPath [attr.id]="'kn-ug-clip-' + region.code">
                            <path [attr.d]="ugandaOutline()"></path>
                          </clipPath>
                        </defs>

                        <path [attr.d]="ugandaOutline()" class="kn-map-land"></path>

                        <path
                          [attr.d]="lakeVictoria()"
                          [attr.clip-path]="'url(#' + 'kn-ug-clip-' + region.code + ')'"
                          class="kn-map-lake"
                        ></path>

                        <path [attr.d]="lakeAlbert()" class="kn-map-lake"></path>

                        <circle
                          [attr.cx]="pinFor(region.code).x"
                          [attr.cy]="pinFor(region.code).y"
                          r="3.6"
                          class="kn-map-halo"
                        ></circle>
                        <circle
                          [attr.cx]="pinFor(region.code).x"
                          [attr.cy]="pinFor(region.code).y"
                          r="2.4"
                          class="kn-map-pin"
                        ></circle>
                      </svg>
                    </span>

                    <span
                      class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-300"
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

                  <span class="relative mt-3 inline-flex items-center gap-1 text-[0.82rem] font-semibold text-primary">
                      Open
                      <svg
                        lucideArrowRight
                        class="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      ></svg>
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
    .kn-minmap {
      color: inherit;
    }

    .kn-map-land {
      fill: currentColor;
      fill-opacity: 0.16;
      stroke: currentColor;
      stroke-opacity: 0.95;
      stroke-width: 1.1;
      stroke-linejoin: round;
    }

    .kn-map-lake {
      fill: currentColor;
      fill-opacity: 0.28;
      stroke: none;
    }

    .kn-map-halo {
      fill: none;
      stroke: var(--color-primary);
      stroke-width: 1;
      stroke-opacity: 0.6;
    }

    .kn-map-pin {
      fill: var(--color-primary);
      stroke: var(--color-primary-foreground);
      stroke-width: 1.3;
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

  protected ugandaOutline(): string {
    return UGANDA_OUTLINE_D;
  }

  protected lakeVictoria(): string {
    return UGANDA_LAKE_VICTORIA_D;
  }

  protected lakeAlbert(): string {
    return UGANDA_LAKE_ALBERT_D;
  }

  protected pinFor(code: string): { x: number; y: number } {
    return UGANDA_PINS[code] ?? { x: 50, y: 50 };
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
