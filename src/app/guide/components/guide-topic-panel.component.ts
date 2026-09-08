import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { GuideTravelTopic } from '../guide.models';

@Component({
  selector: 'kn-guide-topic-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (topic(); as t) {
      <article class="min-w-0">
        <p class="eyebrow text-clay">Travel guide</p>
        <h2 class="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl">
          {{ t.name }}
        </h2>
        @if (t.description) {
          <p class="mt-3 text-[1.05rem] leading-relaxed text-muted-foreground">{{ t.description }}</p>
        }
        <div class="mt-8 space-y-5 text-[1.02rem] leading-relaxed text-foreground/90">
          @for (paragraph of paragraphs(); track $index) {
            <p>{{ paragraph }}</p>
          }
        </div>
      </article>
    } @else {
      <div class="border border-dashed border-hairline bg-paper/60 p-8 text-muted-foreground">
        Select a topic to read the guide.
      </div>
    }
  `,
})
export class GuideTopicPanelComponent {
  readonly topic = input<GuideTravelTopic | null>(null);

  protected readonly paragraphs = computed(() => {
    const content = this.topic()?.content?.trim();
    if (!content) {
      return [] as string[];
    }

    const parts = content.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
    return parts.length > 0 ? parts : [content];
  });
}
