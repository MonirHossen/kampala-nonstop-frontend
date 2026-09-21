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
import { guideRegionMap } from '../guide-art';
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
          <p class="mt-3 max-w-2xl text-muted-foreground">
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
                  class="group relative flex h-full w-full overflow-hidden rounded-xl border text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  [class]="cardClass(region)"
                >
                  @if (isSelected(region)) {
                    <span class="absolute inset-x-0 top-0 z-10 h-0.5 bg-primary" aria-hidden="true"></span>
                  }

                  <span
                    class="relative flex w-[7.25rem] shrink-0 items-center justify-center self-stretch border-r p-2.5 sm:w-32 sm:p-3"
                    [class]="mapPanelClass(region)"
                  >
                    <img
                      [src]="mapSrc(region)"
                      width="500"
                      height="508"
                      [alt]="'Wikipedia locator map of the ' + region.title + ' Region, Uganda'"
                      class="kn-region-map h-auto w-full max-w-[6.5rem] drop-shadow-sm transition-transform duration-500 group-hover:scale-[1.03] sm:max-w-[7rem]"
                      loading="eager"
                      decoding="async"
                    />
                  </span>

                  <span class="relative flex min-w-0 flex-1 flex-col p-3.5 sm:p-4">
                    <span class="flex items-start justify-between gap-2">
                      <span class="font-display text-lg leading-tight sm:text-xl">
                        {{ region.title }}
                      </span>
                      <span
                        class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-300"
                        [class]="iconWrapClass(region)"
                      >
                        <svg
                          lucideIcon
                          [lucideIcon]="iconFor(region.code)"
                          class="h-3.5 w-3.5"
                          aria-hidden="true"
                        ></svg>
                      </span>
                    </span>

                    <span
                      class="mt-1.5 flex-1 text-[0.8rem] leading-relaxed"
                      [class]="isSelected(region) ? 'text-ink-foreground/70' : 'text-muted-foreground'"
                    >
                      {{ region.summary }}
                    </span>

                    <span
                      class="mt-3 inline-flex items-center gap-1 text-[0.8rem] font-semibold text-primary"
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
    .kn-region-map {
      aspect-ratio: 1441 / 1466;
      object-fit: contain;
    }

    .kn-map-panel {
      background: #e8e8e8;
      border-color: color-mix(in oklab, var(--color-hairline) 80%, transparent);
    }

    .kn-map-panel-selected {
      background: color-mix(in oklab, var(--color-ink-foreground) 6%, transparent);
      border-color: color-mix(in oklab, var(--color-ink-foreground) 10%, transparent);
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

  protected mapSrc(region: GuideRegion): string {
    return region.mapSrc || guideRegionMap(region.code);
  }

  protected mapPanelClass(region: GuideRegion): string {
    return this.isSelected(region) ? 'kn-map-panel-selected' : 'kn-map-panel';
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
