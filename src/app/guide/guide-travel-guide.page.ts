import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RevealDirective } from '../shared/reveal.directive';
import { LocalKnowledgeSectionComponent } from '../local-knowledge/local-knowledge-section.component';
import { GuideTopicGridComponent } from './components/guide-topic-grid.component';
import { GuideTopicPanelComponent } from './components/guide-topic-panel.component';
import { guideContentFor } from './content/guide-content.registry';
import type { GuideTopic } from './content/guide-content.types';
import { guideCountryCode } from './guide-route';
import { guideTopicImage } from './guide-art';

@Component({
  selector: 'kn-guide-travel-guide-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GuideTopicGridComponent, GuideTopicPanelComponent, RevealDirective, LocalKnowledgeSectionComponent],
  template: `
    @if (content(); as guide) {
      <section class="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16">
        <kn-guide-topic-grid
          [topics]="guide.travelGuideTopics"
          [selectedCode]="selectedTopic()?.code ?? null"
          panelId="travel-guide-topic-panel"
          (topicSelect)="selectTopic($event)"
        />

        <div
          id="travel-guide-topic-panel"
          tabindex="-1"
          class="mt-12 scroll-mt-[6.5rem] outline-none"
          knReveal
        >
          @if (selectedTopic(); as topic) {
            <figure class="relative mb-8 overflow-hidden rounded-2xl sm:mb-10">
              <img
                [src]="imageFor(topic.code)"
                alt=""
                class="aspect-[16/7] w-full object-cover sm:aspect-[16/6]"
                loading="lazy"
              />
              <span
                class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/50 via-ink/5 to-transparent"
                aria-hidden="true"
              ></span>
            </figure>
          }
          <div class="grid items-start gap-8 min-[1400px]:grid-cols-[56rem_minmax(0,1fr)]">
            <kn-guide-topic-panel class="min-w-0" [topic]="selectedTopic()" />
            <kn-local-knowledge-section [inset]="true" [flush]="true" />
          </div>
        </div>
      </section>
    }
  `,
})
export class GuideTravelGuidePage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly countryCode = computed(() => guideCountryCode(this.route));

  protected readonly content = computed(() => guideContentFor(this.countryCode()));
  protected readonly selectedCode = signal<string | null>(this.initialTopicCode());

  protected readonly selectedTopic = computed((): GuideTopic | null => {
    const topics = this.content()?.travelGuideTopics ?? [];
    const code = this.selectedCode();
    return topics.find((topic) => topic.code === code) ?? topics[0] ?? null;
  });

  protected readonly imageFor = guideTopicImage;

  protected selectTopic(topic: GuideTopic): void {
    this.selectedCode.set(topic.code);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { topic: topic.code },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private initialTopicCode(): string | null {
    return this.route.snapshot.queryParamMap.get('topic');
  }
}
