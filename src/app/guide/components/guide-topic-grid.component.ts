import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { LucideArrowUp, LucideDynamicIcon } from '@lucide/angular';
import { GuideTopic } from '../content/guide-content.types';
import { guideTopicIcon } from '../guide-topic-icons';
import { RevealDirective } from '../../shared/reveal.directive';
import {
  guideScrollBehavior,
  GUIDE_HEADER_OFFSET_PX,
  scheduleRevealGuidePanel,
} from './guide-picker-reveal';

@Component({
  selector: 'kn-guide-topic-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideDynamicIcon, RevealDirective],
  template: `
    <div #picker class="scroll-mt-20" knReveal>
      <div
        class="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5"
        role="listbox"
        aria-label="Travel guide topics"
      >
        @for (topic of topics(); track topic.code) {
          <button
            type="button"
            role="option"
            [attr.aria-selected]="isSelected(topic)"
            (click)="select(topic)"
            class="group relative flex h-full flex-col items-stretch gap-2 overflow-hidden rounded-2xl border p-3 text-left outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-4"
            [class]="cardClass(topic)"
          >
            <span class="flex items-center gap-2">
              <span class="min-w-0 font-display text-[1.05rem] leading-snug">{{ topic.name }}</span>
              <span
                class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300"
                [class]="iconWrapClass(topic)"
              >
                <svg
                  lucideIcon
                  [lucideIcon]="iconFor(topic.code)"
                  class="h-[1.05rem] w-[1.05rem]"
                  aria-hidden="true"
                ></svg>
              </span>
            </span>

            @if (topic.description) {
              <span
                class="line-clamp-2 text-[0.78rem] leading-relaxed"
                [class]="textClass(topic)"
              >
                {{ topic.description }}
              </span>
            }

            <span class="mt-auto flex items-center gap-2">
              <span class="h-px flex-1" [class]="ruleClass(topic)"></span>
              <span
                class="text-xl leading-none transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                [class]="arrowClass(topic)"
                aria-hidden="true"
                >→</span
              >
            </span>
          </button>
        }
      </div>
    </div>

    <!-- Keep fixed navigation outside the reveal animation's containing block. -->
    @if (showBackToTopics()) {
      <button
        type="button"
        aria-label="Back to travel guide topics"
        title="Back to topics"
        (click)="scrollToPicker()"
        class="fixed right-5 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-40 flex h-12 w-12 items-center justify-center rounded-full border border-clay bg-background text-clay shadow-lg transition-colors hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 md:right-8"
      >
        <svg lucideIcon [lucideIcon]="arrowUp" class="h-6 w-6" aria-hidden="true"></svg>
      </button>
    }
  `,
})
export class GuideTopicGridComponent implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly picker = viewChild<ElementRef<HTMLElement>>('picker');

  readonly topics = input.required<GuideTopic[]>();
  readonly selectedCode = input<string | null>(null);
  readonly panelId = input.required<string>();
  readonly topicSelect = output<GuideTopic>();

  protected readonly arrowUp = LucideArrowUp;
  protected readonly showBackToTopics = signal(false);

  ngAfterViewInit(): void {
    const picker = this.picker()?.nativeElement;
    if (picker && typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        ([entry]) => this.showBackToTopics.set(
          !entry.isIntersecting && entry.boundingClientRect.bottom <= GUIDE_HEADER_OFFSET_PX,
        ),
        { threshold: 0, rootMargin: `-${GUIDE_HEADER_OFFSET_PX}px 0px 0px 0px` },
      );
      observer.observe(picker);
      this.destroyRef.onDestroy(() => observer.disconnect());
    }
  }

  protected select(topic: GuideTopic): void {
    this.topicSelect.emit(topic);
    scheduleRevealGuidePanel(this.panelId());
  }

  protected scrollToPicker(): void {
    const picker = this.picker()?.nativeElement;
    picker?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
    picker?.scrollIntoView({
      behavior: guideScrollBehavior(),
      block: 'start',
    });
  }

  protected isSelected(topic: GuideTopic): boolean {
    return topic.code === this.selectedCode();
  }

  protected cardClass(topic: GuideTopic): string {
    if (this.isSelected(topic)) {
      return 'border-ink bg-gradient-to-br from-ink via-ink to-clay text-ink-foreground shadow-[0_18px_34px_-18px_rgba(28,20,12,0.65)]';
    }

    return 'border-hairline bg-gradient-to-b from-paper to-sand/45 text-foreground hover:-translate-y-1 hover:border-primary/45 hover:to-primary/12 hover:shadow-[0_16px_30px_-20px_rgba(40,28,18,0.5)]';
  }

  protected arrowClass(topic: GuideTopic): string {
    return this.isSelected(topic)
      ? 'text-primary'
      : 'text-clay/45 group-hover:text-primary';
  }

  protected ruleClass(topic: GuideTopic): string {
    return this.isSelected(topic)
      ? 'bg-ink-foreground/20'
      : 'bg-hairline/80';
  }

  protected textClass(topic: GuideTopic): string {
    return this.isSelected(topic) ? 'text-ink-foreground/60' : 'text-muted-foreground';
  }

  protected iconWrapClass(topic: GuideTopic): string {
    return this.isSelected(topic)
      ? 'bg-primary text-primary-foreground shadow-[0_10px_18px_-12px_rgba(196,87,45,0.7)]'
      : 'bg-sand/80 text-clay group-hover:bg-primary/15 group-hover:text-primary';
  }

  protected iconFor(code: string | null): ReturnType<typeof guideTopicIcon> {
    return guideTopicIcon(code);
  }
}
