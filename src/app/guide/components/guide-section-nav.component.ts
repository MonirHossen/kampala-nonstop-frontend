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
import { LucideDynamicIcon } from '@lucide/angular';
import { guideNavIcon } from '../guide-topic-icons';
import { GuideJumpBarComponent } from './guide-jump-bar.component';
import {
  guideScrollBehavior,
  observeGuidePickerVisibility,
  scheduleRevealGuidePanel,
} from './guide-picker-reveal';

export type GuideSectionNavItem = {
  id: string;
  label: string;
};

@Component({
  selector: 'kn-guide-section-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideDynamicIcon, GuideJumpBarComponent],
  template: `
    <div
      #grid
      class="grid scroll-mt-20 grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2"
      role="listbox"
      [attr.aria-label]="ariaLabel()"
    >
      @for (item of items(); track item.id) {
        <button
          type="button"
          role="option"
          [attr.aria-selected]="isSelected(item)"
          [attr.aria-pressed]="isSelected(item)"
          (click)="select(item.id)"
          class="group relative flex min-h-11 items-center gap-2 overflow-hidden rounded-lg border px-2.5 py-1.5 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-3"
          [class]="cardClass(item)"
        >
          @if (isSelected(item)) {
            <span class="absolute inset-x-0 top-0 h-0.5 bg-primary" aria-hidden="true"></span>
          }

          <span
            class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors duration-300"
            [class]="iconWrapClass(item)"
          >
            <svg
              lucideIcon
              [lucideIcon]="iconFor(item.id)"
              class="h-3.5 w-3.5"
              aria-hidden="true"
            ></svg>
          </span>

          <span class="font-display text-[0.78rem] leading-snug sm:text-[0.82rem]">
            {{ item.label }}
          </span>
        </button>
      }
    </div>

    <kn-guide-jump-bar
      [visible]="showJumpBar()"
      [label]="selectedLabel()"
      [icon]="iconFor(selectedId())"
      backLabel="Sections"
      (back)="scrollToGrid()"
    />
  `,
})
export class GuideSectionNavComponent implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly grid = viewChild<ElementRef<HTMLElement>>('grid');

  readonly items = input.required<GuideSectionNavItem[]>();
  readonly selectedId = input.required<string>();
  readonly panelId = input.required<string>();
  readonly ariaLabel = input('Guide sections');
  readonly itemSelect = output<string>();

  private readonly gridVisible = signal(true);

  protected readonly selectedLabel = computed(() => {
    const id = this.selectedId();
    return this.items().find((item) => item.id === id)?.label ?? 'Sections';
  });

  protected readonly showJumpBar = computed(() => !this.gridVisible());

  ngAfterViewInit(): void {
    const grid = this.grid()?.nativeElement;
    if (grid) {
      observeGuidePickerVisibility(grid, (visible) => this.gridVisible.set(visible), this.destroyRef);
    }
  }

  protected select(id: string): void {
    this.itemSelect.emit(id);
    scheduleRevealGuidePanel(this.panelId());
  }

  protected scrollToGrid(): void {
    this.grid()?.nativeElement.scrollIntoView({
      behavior: guideScrollBehavior(),
      block: 'start',
    });
  }

  protected isSelected(item: GuideSectionNavItem): boolean {
    return item.id === this.selectedId();
  }

  protected cardClass(item: GuideSectionNavItem): string {
    if (this.isSelected(item)) {
      return 'border-ink bg-gradient-to-br from-ink via-ink to-clay text-ink-foreground shadow-[0_18px_34px_-18px_rgba(28,20,12,0.65)]';
    }

    return 'border-hairline bg-gradient-to-b from-paper to-sand/45 text-foreground hover:-translate-y-0.5 hover:border-primary/45 hover:to-primary/12 hover:shadow-[0_16px_30px_-20px_rgba(40,28,18,0.5)]';
  }

  protected iconWrapClass(item: GuideSectionNavItem): string {
    return this.isSelected(item)
      ? 'bg-primary text-primary-foreground'
      : 'bg-sand/80 text-clay group-hover:bg-primary/15 group-hover:text-primary';
  }

  protected iconFor(id: string) {
    return guideNavIcon(id);
  }
}
