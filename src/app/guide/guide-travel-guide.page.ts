import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RevealDirective } from '../shared/reveal.directive';
import { GuideTopicGridComponent } from './components/guide-topic-grid.component';
import { GuideTopicPanelComponent } from './components/guide-topic-panel.component';
import { guideContentFor } from './content/guide-content.registry';
import type { GuideTopic } from './content/guide-content.types';
import { guideCountryCode } from './guide-route';

@Component({
  selector: 'kn-guide-travel-guide-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GuideTopicGridComponent, GuideTopicPanelComponent, RevealDirective],
  template: `
    @if (content(); as guide) {
      <section class="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16">
        <div knReveal>
          <kn-guide-topic-grid
            [topics]="guide.travelGuideTopics"
            [selectedCode]="selectedTopic()?.code ?? null"
            panelId="travel-guide-topic-panel"
            (topicSelect)="selectTopic($event)"
          />
        </div>

        <div
          id="travel-guide-topic-panel"
          tabindex="-1"
          class="mt-12 scroll-mt-[6.5rem] outline-none"
          knReveal
        >
          <kn-guide-topic-panel [topic]="selectedTopic()" />
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
