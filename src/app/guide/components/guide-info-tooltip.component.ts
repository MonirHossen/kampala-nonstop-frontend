import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { LucideDynamicIcon, LucidePlus, type LucideIconData } from '@lucide/angular';

const TOOLTIP_WIDTH_PX = 336;
/** Rough popover height, used to decide whether it fits above the chip. */
const TOOLTIP_HEIGHT_PX = 210;

/** `paper` sits on light sections; `ink` sits on the dark hero. */
export type GuideTooltipTone = 'paper' | 'ink';

/**
 * Trigger chip + anchored popover for a single travel-information item.
 * The chip stays scannable; the full editorial value lives in the popover.
 */
@Component({
  selector: 'kn-guide-info-tooltip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideDynamicIcon, LucidePlus],
  host: { class: 'relative inline-flex' },
  template: `
    <button
      type="button"
      class="group inline-flex items-center gap-2.5 rounded-lg border py-2 pl-2.5 pr-3 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      [class]="chipClass()"
      [attr.aria-expanded]="open()"
      [attr.aria-describedby]="open() ? tooltipId : null"
      (click)="toggle($event)"
      (mouseenter)="show()"
      (mouseleave)="scheduleHide()"
      (focus)="show()"
      (blur)="scheduleHide()"
    >
      <svg
        lucideIcon
        [lucideIcon]="icon()"
        class="h-4 w-4 shrink-0 transition-colors"
        [class]="iconClass()"
        aria-hidden="true"
      ></svg>

      <span class="min-w-0">
        <span
          class="block text-[0.63rem] font-bold uppercase tracking-[0.17em] transition-colors"
          [class]="labelClass()"
        >
          {{ label() }}
        </span>
        @if (hint(); as hintText) {
          <span
            class="mt-px truncate text-[0.83rem] font-semibold leading-tight transition-colors"
            [class]="valueClass()"
          >
            {{ hintText }}
          </span>
        }
      </span>

      <svg
        lucidePlus
        class="ml-0.5 h-3 w-3 shrink-0 transition-transform duration-300"
        [class]="plusClass()"
        aria-hidden="true"
      ></svg>
    </button>

    @if (open()) {
      <div
        [id]="tooltipId"
        role="tooltip"
        class="kn-tip absolute z-50"
        [class]="positionClasses()"
        [style.width.px]="width"
        (mouseenter)="show()"
        (mouseleave)="scheduleHide()"
      >
        <div class="relative rounded-xl shadow-[0_26px_50px_-20px_rgba(28,20,12,0.75)]" [class]="panelClass()">
          <span
            class="absolute h-3 w-3 rotate-45 rounded-[2px]"
            [class]="arrowClass()"
            aria-hidden="true"
          ></span>

          <div class="relative px-5 py-4">
            <span class="flex items-center gap-2">
              <span class="h-1.5 w-1.5 bg-primary" aria-hidden="true"></span>
              <span class="eyebrow text-primary">{{ label() }}</span>
            </span>

            <p class="mt-2.5 text-[0.9rem] leading-[1.65]" [class]="bodyClass()">{{ body() }}</p>

            @if (footnote(); as note) {
              <p
                class="mt-3.5 border-t pt-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.15em]"
                [class]="footnoteClass()"
              >
                {{ note }}
              </p>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .kn-tip {
      animation: kn-tip-in 0.18s cubic-bezier(0.19, 1, 0.22, 1) both;
    }

    @keyframes kn-tip-in {
      from {
        opacity: 0;
        transform: translate3d(0, 4px, 0);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .kn-tip {
        animation: none;
      }
    }
  `,
})
export class GuideInfoTooltipComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  readonly label = input.required<string>();
  readonly body = input.required<string>();
  readonly icon = input.required<LucideIconData>();
  readonly hint = input<string | null>(null);
  readonly footnote = input<string | null>(null);
  readonly tone = input<GuideTooltipTone>('paper');
  /** Hides the chip value on small screens so a row of chips stays compact. */
  readonly dense = input(false);

  protected readonly width = TOOLTIP_WIDTH_PX;
  protected readonly tooltipId = `kn-tip-${Math.random().toString(36).slice(2, 9)}`;

  protected readonly open = signal(false);
  private readonly side = signal<'top' | 'bottom'>('top');
  private readonly align = signal<'start' | 'end'>('start');

  private readonly onInk = computed(() => this.tone() === 'ink');

  protected readonly chipClass = computed(() => {
    if (this.onInk()) {
      return this.open()
        ? 'border-paper bg-paper'
        : 'border-ink-foreground/25 bg-ink-foreground/10 backdrop-blur-sm hover:border-primary/60 hover:bg-ink-foreground/[0.16]';
    }

    return this.open()
      ? 'border-ink bg-gradient-to-br from-ink to-clay'
      : 'border-hairline bg-gradient-to-b from-paper to-sand/45 hover:border-primary/45 hover:to-primary/12';
  });

  protected readonly iconClass = computed(() => {
    if (this.onInk()) {
      return this.open() ? 'text-primary' : 'text-primary';
    }

    return this.open() ? 'text-primary' : 'text-clay group-hover:text-primary';
  });

  protected readonly labelClass = computed(() => {
    if (this.onInk()) {
      return this.open() ? 'text-muted-foreground' : 'text-ink-foreground/60';
    }

    return this.open() ? 'text-ink-foreground/55' : 'text-muted-foreground';
  });

  protected readonly valueClass = computed(() => {
    const visibility = this.dense() ? 'hidden sm:block' : 'block';

    if (this.onInk()) {
      return `${visibility} ${this.open() ? 'text-foreground' : 'text-ink-foreground'}`;
    }

    return `${visibility} ${this.open() ? 'text-ink-foreground' : 'text-foreground'}`;
  });

  protected readonly plusClass = computed(() => {
    if (this.open()) {
      return 'rotate-45 text-primary';
    }

    return this.onInk()
      ? 'text-ink-foreground/50 group-hover:text-primary'
      : 'text-muted-foreground/70 group-hover:text-ink';
  });

  protected readonly panelClass = computed(() =>
    this.onInk()
      ? 'bg-gradient-to-br from-paper via-paper to-sand text-foreground'
      : 'bg-gradient-to-br from-ink via-ink to-clay text-ink-foreground',
  );

  protected readonly bodyClass = computed(() =>
    this.onInk() ? 'text-foreground/80' : 'text-ink-foreground/85',
  );

  protected readonly footnoteClass = computed(() =>
    this.onInk()
      ? 'border-hairline text-muted-foreground'
      : 'border-ink-foreground/12 text-ink-foreground/45',
  );

  protected readonly positionClasses = computed(() => {
    const vertical =
      this.side() === 'top' ? 'bottom-[calc(100%+0.7rem)]' : 'top-[calc(100%+0.7rem)]';
    const horizontal = this.align() === 'start' ? 'left-0' : 'right-0';
    return `${vertical} ${horizontal}`;
  });

  protected readonly arrowClass = computed(() => {
    const vertical = this.side() === 'top' ? '-bottom-1.5' : '-top-1.5';
    const horizontal = this.align() === 'start' ? 'left-6' : 'right-6';
    const surface = this.onInk() ? 'bg-paper' : 'bg-ink';
    return `${vertical} ${horizontal} ${surface}`;
  });

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.open.set(false);
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  protected toggle(event: MouseEvent): void {
    event.stopPropagation();

    if (this.open()) {
      this.open.set(false);
      return;
    }

    this.show();
  }

  protected show(): void {
    this.clearHideTimer();
    this.resolvePlacement();
    this.open.set(true);
  }

  /** Small grace period so the pointer can travel from chip to popover. */
  protected scheduleHide(): void {
    this.clearHideTimer();
    this.hideTimer = setTimeout(() => this.open.set(false), 160);
  }

  /** Opens above whenever it fits, otherwise falls to whichever side has room. */
  private resolvePlacement(): void {
    const rect = this.host.nativeElement.getBoundingClientRect();
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;

    this.side.set(
      spaceAbove >= TOOLTIP_HEIGHT_PX || spaceAbove >= spaceBelow ? 'top' : 'bottom',
    );
    this.align.set(rect.left + TOOLTIP_WIDTH_PX > window.innerWidth - 16 ? 'end' : 'start');
  }

  private clearHideTimer(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }
}
