import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { GuideTopic } from '../content/guide-content.types';
import { GuideNarrativeBlock } from '../guide-content-format';
import { guideTopicIcon } from '../guide-topic-icons';
import { GuideNarrativeBlocksComponent } from './guide-narrative-blocks.component';

@Component({
  selector: 'kn-guide-topic-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideDynamicIcon, GuideNarrativeBlocksComponent],
  template: `
    @if (topic(); as t) {
      <article class="min-w-0">


        <div>
          <div class="min-w-0">
            <h2 class="mt-3 flex items-center gap-3 font-display text-3xl leading-tight text-foreground sm:text-4xl">
              <span>{{ t.name }}</span>
              <span class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink text-primary">
                <svg lucideIcon [lucideIcon]="iconFor(t.code)" class="h-5 w-5" aria-hidden="true"></svg>
              </span>
            </h2>
            @if (t.description) {
              <p class="lede mt-3">{{ t.description }}</p>
            }
            <div class="mt-8">
              <kn-guide-narrative-blocks [blocks]="blocks()" [leadWithDropCap]="true" />
            </div>
          </div>
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
  readonly topic = input<GuideTopic | null>(null);

  protected readonly blocks = computed((): GuideNarrativeBlock[] => {
    const content = this.topic()?.content?.trim();
    if (!content) {
      return [];
    }

    const parts = content
      .split(/\n\s*\n/)
      .map((part) => part.trim())
      .filter(Boolean);
    const paragraphs = parts.length > 0 ? parts : [content];
    return paragraphs.map((text) => ({ type: 'paragraph', text }));
  });


  protected iconFor(code: string | null) {
    return guideTopicIcon(code);
  }
}
