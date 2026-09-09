import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { GuideTopic } from '../content/guide-content.types';
import { guideTopicIcon } from '../guide-topic-icons';

@Component({
  selector: 'kn-guide-topic-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideDynamicIcon],
  template: `
    <div class="flex items-baseline justify-between gap-4 border-b-2 border-ink pb-3">
      <h2 class="eyebrow text-clay">Browse topics</h2>
      <span class="text-[0.7rem] text-muted-foreground">{{ topics().length }} topics</span>
    </div>

    <div
      class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5"
      role="listbox"
      aria-label="Travel guide topics"
    >
      @for (topic of topics(); track topic.code) {
        <button
          type="button"
          role="option"
          [attr.aria-selected]="isSelected(topic)"
          (click)="topicSelect.emit(topic)"
          class="group relative flex flex-col items-start gap-3 overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-5"
          [class]="cardClass(topic)"
        >
          <span
            class="inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-300"
            [class]="iconWrapClass(topic)"
          >
            <svg
              lucideIcon
              [lucideIcon]="iconFor(topic.code)"
              class="h-[1.15rem] w-[1.15rem]"
              aria-hidden="true"
            ></svg>
          </span>

          <span class="font-display text-[1.05rem] leading-tight">{{ topic.name }}</span>

          @if (topic.description) {
            <span
              class="line-clamp-2 text-[0.78rem] leading-relaxed"
              [class]="isSelected(topic) ? 'text-ink-foreground/60' : 'text-muted-foreground'"
            >
              {{ topic.description }}
            </span>
          }
        </button>
      }
    </div>
  `,
})
export class GuideTopicGridComponent {
  readonly topics = input.required<GuideTopic[]>();
  readonly selectedCode = input<string | null>(null);
  readonly topicSelect = output<GuideTopic>();

  protected isSelected(topic: GuideTopic): boolean {
    return topic.code === this.selectedCode();
  }

  protected cardClass(topic: GuideTopic): string {
    if (this.isSelected(topic)) {
      return 'border-ink bg-gradient-to-br from-ink via-ink to-clay text-ink-foreground shadow-[0_18px_34px_-18px_rgba(28,20,12,0.65)]';
    }

    return 'border-hairline bg-gradient-to-b from-paper to-sand/45 text-foreground hover:-translate-y-1 hover:border-primary/45 hover:to-primary/12 hover:shadow-[0_16px_30px_-20px_rgba(40,28,18,0.5)]';
  }

  protected iconWrapClass(topic: GuideTopic): string {
    return this.isSelected(topic)
      ? 'bg-primary text-primary-foreground'
      : 'bg-sand/80 text-clay group-hover:bg-primary/15 group-hover:text-primary';
  }

  protected iconFor(code: string | null): ReturnType<typeof guideTopicIcon> {
    return guideTopicIcon(code);
  }
}
