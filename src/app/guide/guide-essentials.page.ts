import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { extractApiError } from '../core/lib/api-error';
import { GuideNarrativeBlocksComponent } from './components/guide-narrative-blocks.component';
import { GuideQuickInfoComponent } from './components/guide-quick-info.component';
import { EssentialsIndexComponent } from './components/essentials-index.component';
import { GuideProgressiveImageDirective } from './components/guide-progressive-image.directive';
import { GuideStateComponent } from './components/guide-state.component';
import { GuideNarrativeBlock } from './guide-content-format';
import { guideContentFor } from './content/guide-content.registry';
import { guideEssentialsImage } from './guide-art';
import { GuideApiService } from './guide-api.service';
import { countryDisplayName } from './guide-country-name';
import { GuideEssential, GuideLoadState } from './guide.models';
import { guideCountryCode } from './guide-route';
import { UGANDA_ESSENTIALS_FALLBACK } from './content/uganda-essentials-fallback';

const NARRATIVE_CODES = new Set([
  'ABOUT',
  'HISTORY',
  'CULTURE_TRADITIONS',
  'FOOD_DRINK_SOCIAL',
  'LANGUAGES_COMMUNICATION',
  'GEOGRAPHY_CLIMATE',
  'MAJOR_DESTINATIONS',
  'TOURISM_GLANCE',
  'KAMPALA_CITY_LIFE',
  'SAFETY_REASSURANCE',
  'COST_OF_LIVING',
  'PUBLIC_HOLIDAYS',
  'LOCAL_ETIQUETTE',
]);

type NarrativePanel = {
  id: string;
  label: string;
  kind: 'narrative' | 'facts';
  code: string;
  heading: string;
  blocks: GuideNarrativeBlock[];
};

type NarrativeBlock = GuideNarrativeBlock;

@Component({
  selector: 'kn-guide-essentials-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    GuideQuickInfoComponent,
    EssentialsIndexComponent,
    GuideProgressiveImageDirective,
    GuideStateComponent,
    GuideNarrativeBlocksComponent,
  ],
  template: `
    @switch (state().status) {
      @case ('loading') {
        <kn-guide-state [state]="state()" />
      }
      @case ('error') {
        <kn-guide-state [state]="state()" />
      }
      @case ('empty') {
        <kn-guide-state [state]="state()" />
      }
      @case ('ready') {
        <div class="mx-auto grid max-w-[1400px] gap-8 px-5 py-8 sm:px-8 md:grid-cols-[240px_minmax(0,1fr)] md:gap-10 md:py-12">
          <kn-essentials-index [items]="allSections()" />
          <div class="min-w-0 space-y-14">
            @for (panel of allSections(); track panel.id) {
              <section [id]="panel.id" [attr.data-section-id]="panel.id" tabindex="-1" [attr.aria-label]="panel.label"
                class="scroll-mt-[9.5rem] outline-none md:scroll-mt-[5.5rem]">
                @if (panel.kind === 'facts') {
                  <kn-guide-quick-info [essentials]="facts()" [countryName]="countryName()" [countryCode]="countryCode()" />
                } @else {
                <h2 [id]="anchor(panel.code) + '-heading'" class="font-display text-3xl text-foreground sm:text-4xl">{{ panel.heading }}</h2>
                <figure class="relative mb-10 mt-6 overflow-hidden rounded-2xl">
                  <img [knProgressiveImage]="sectionImage(panel.code)" alt="" width="1600" height="700"
                    class="aspect-[16/7] w-full object-cover sm:aspect-[16/6]" loading="lazy" />
                  <span class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" aria-hidden="true"></span>
                </figure>
                <kn-guide-narrative-blocks [blocks]="panel.blocks" />
                }
              </section>
            }
          </div>
        </div>
      }
    }
  `,
})
export class GuideEssentialsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly guideApi = inject(GuideApiService);

  protected readonly countryCode = computed(() => guideCountryCode(this.route));
  protected readonly countryName = computed(() => {
    const fromRegistry = guideContentFor(this.countryCode())?.countryName;
    return fromRegistry ?? countryDisplayName(this.countryCode());
  });
  protected readonly state = signal<GuideLoadState>({ status: 'loading' });

  protected readonly facts = computed((): GuideEssential[] => {
    const current = this.state();
    return current.status === 'ready' ? current.essentials.filter((item) => !isNarrative(item)) : [];
  });

  protected readonly allSections = computed((): NarrativePanel[] => {
    const current = this.state();
    if (current.status !== 'ready') return [];
    return [
      ...current.essentials.filter(isNarrative).map(toPanel),
      { id: 'key-facts', code: 'KEY_FACTS', label: 'Key facts', heading: 'Key facts', kind: 'facts', blocks: [] },
    ];
  });

  protected readonly anchor = tabQueryValue;

  protected sectionImage(code: string): string {
    return guideEssentialsImage(code);
  }

  ngOnInit(): void {
    const code = this.countryCode();
    const fallback = fallbackEssentials(code);
    // Render the published snapshot while live content refreshes in the background.
    if (fallback.length > 0) this.state.set({ status: 'ready', essentials: fallback });

    this.guideApi.getEssentials(code).subscribe({
      next: (essentials) => {
        const records = new Map(fallback.map(item => [item.code ?? item.id, item]));
        essentials.forEach(item => records.set(item.code ?? item.id, item));
        const merged = [...records.values()].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        this.state.set(merged.length > 0 ? { status: 'ready', essentials: merged } : { status: 'empty' });
      },
      error: (error: unknown) => {
        if (fallback.length > 0) {
          this.state.set({ status: 'ready', essentials: fallback });
          return;
        }

        const message =
          error instanceof HttpErrorResponse
            ? extractApiError(error)
            : 'The essentials list could not be loaded.';
        this.state.set({ status: 'error', message });
      },
    });
  }

}

function isNarrative(item: GuideEssential): boolean {
  if (item.code && NARRATIVE_CODES.has(item.code)) {
    return true;
  }

  return item.value_data?.['display'] === 'narrative';
}

function narrativeHeading(item: GuideEssential): string {
  const heading = item.value_data?.['heading'];
  if (typeof heading === 'string' && heading.trim() !== '') {
    return heading;
  }

  return item.name || 'Essentials';
}

function toPanel(item: GuideEssential): NarrativePanel {
  return {
    id: tabQueryValue(item.code ?? item.id),
    label: narrativeHeading(item),
    kind: 'narrative',
    code: item.code ?? item.id,
    heading: narrativeHeading(item),
    blocks: narrativeBlocks(item),
  };
}

function narrativeBlocks(item: GuideEssential): NarrativeBlock[] {
  const raw = item.value_data?.['blocks'];
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map(normaliseBlock).filter((block): block is NarrativeBlock => block !== null);
  }

  return narrativeParagraphs(item).map((text) => ({ type: 'paragraph', text }));
}

function normaliseBlock(raw: unknown): NarrativeBlock | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const block = raw as Record<string, unknown>;
  if (block['type'] === 'paragraph' && typeof block['text'] === 'string') {
    return { type: 'paragraph', text: block['text'] };
  }
  if (block['type'] === 'subheading' && typeof block['text'] === 'string') {
    return { type: 'subheading', text: block['text'] };
  }
  if (block['type'] === 'list' && Array.isArray(block['items'])) {
    const items = block['items']
      .map((entry) => {
        if (typeof entry === 'string') {
          return { text: entry };
        }
        if (entry && typeof entry === 'object') {
          const item = entry as Record<string, unknown>;
          const text = typeof item['text'] === 'string' ? item['text'] : '';
          const label = typeof item['label'] === 'string' ? item['label'] : undefined;
          return text ? { label, text } : null;
        }
        return null;
      })
      .filter((entry): entry is { label?: string; text: string } => entry !== null);

    return items.length > 0 ? { type: 'list', items } : null;
  }
  if (block['type'] === 'rates' && Array.isArray(block['rows'])) {
    const rows = block['rows']
      .map((entry) => {
        if (!entry || typeof entry !== 'object') {
          return null;
        }
        const row = entry as Record<string, unknown>;
        if (typeof row['currency'] !== 'string' || typeof row['range'] !== 'string') {
          return null;
        }
        return { currency: row['currency'], range: row['range'] };
      })
      .filter((entry): entry is { currency: string; range: string } => entry !== null);

    return rows.length > 0 ? { type: 'rates', rows } : null;
  }

  return null;
}

function narrativeParagraphs(item: GuideEssential): string[] {
  const raw = item.value_data?.['paragraphs'];
  if (Array.isArray(raw)) {
    const paragraphs = raw.filter((part): part is string => typeof part === 'string' && part.trim() !== '');
    if (paragraphs.length > 0) {
      return paragraphs;
    }
  }

  const text = item.value_text?.trim();
  if (!text) {
    return [];
  }

  const parts = text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  return parts.length > 0 ? parts : [text];
}

function fallbackEssentials(countryCode: string): GuideEssential[] {
  if (countryCode.toUpperCase() === 'UG') return UGANDA_ESSENTIALS_FALLBACK;
  const content = guideContentFor(countryCode);
  if (!content) {
    return [];
  }

  const codes = ['ABOUT', 'HISTORY'] as const;
  return content.essentialsNarrative.map((section, index) => ({
    id: `fallback-${codes[index] ?? index}`,
    code: codes[index] ?? `NARRATIVE_${index + 1}`,
    name: section.heading,
    value_text: section.paragraphs.join('\n\n'),
    value_data: {
      display: 'narrative',
      heading: section.heading,
      paragraphs: section.paragraphs,
    },
    sort_order: index + 1,
  }));
}

function tabQueryValue(code: string): string {
  return code.toLowerCase().replaceAll('_', '-');
}
