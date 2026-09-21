import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { GuideTopic } from '../content/guide-content.types';
import { GuideNarrativeBlock } from '../guide-content-format';
import { guideTopicImage } from '../guide-art';
import { guideTopicIcon } from '../guide-topic-icons';
import { GuideNarrativeBlocksComponent } from './guide-narrative-blocks.component';

@Component({
  selector: 'kn-guide-topic-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideDynamicIcon, GuideNarrativeBlocksComponent],
  template: `
    @if (topic(); as t) {
      <article class="min-w-0">
        <figure class="relative mb-8 overflow-hidden rounded-2xl sm:mb-10">
          <img
            [src]="imageFor(t.code)"
            alt=""
            class="aspect-[16/7] w-full object-cover sm:aspect-[16/6]"
            loading="lazy"
          />
          <span
            class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/50 via-ink/5 to-transparent"
            aria-hidden="true"
          ></span>
        </figure>

        <div class="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
          <aside class="lg:border-r lg:border-hairline lg:pr-10">
            <span
              class="mt-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-primary"
            >
              <svg
                lucideIcon
                [lucideIcon]="iconFor(t.code)"
                class="h-5 w-5"
                aria-hidden="true"
              ></svg>
            </span>
            <p class="eyebrow mt-5 text-clay">Travel guide</p>
            <span class="mt-6 block h-px w-10 bg-hairline" aria-hidden="true"></span>
          </aside>

          <div class="min-w-0">
            <h2 class="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl">
              {{ t.name }}
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

  protected imageFor(code: string | null): string {
    return guideTopicImage(code);
  }

  protected iconFor(code: string | null) {
    return guideTopicIcon(code);
  }
}