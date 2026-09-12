import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { extractApiError } from '../core/lib/api-error';
import { GuideQuickInfoComponent } from './components/guide-quick-info.component';
import { GuideSectionNavComponent } from './components/guide-section-nav.component';
import { GuideStateComponent } from './components/guide-state.component';
import { guideContentFor } from './content/guide-content.registry';
import { GuideApiService } from './guide-api.service';
import { countryDisplayName } from './guide-country-name';
import { GuideEssential, GuideLoadState } from './guide.models';
import { guideCountryCode } from './guide-route';

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

const HIDDEN_TAB_CODES = new Set(['HISTORY']);

type NarrativeBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'list'; items: { label?: string; text: string }[] }
  | { type: 'rates'; rows: { currency: string; range: string }[] };

type EssentialsTab = {
  code: string;
  label: string;
};

type NarrativePanel = {
  code: string;
  heading: string;
  blocks: NarrativeBlock[];
  extras: NarrativePanel[];
};

@Component({
  selector: 'kn-guide-essentials-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GuideQuickInfoComponent, GuideSectionNavComponent, GuideStateComponent],
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
        <section class="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16">
          <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
            <kn-guide-quick-info
              class="lg:col-start-2 lg:row-start-1"
              [essentials]="facts()"
              [countryName]="countryName()"
              [countryCode]="countryCode()"
            />

            <div class="lg:col-start-1 lg:row-start-1">
              <nav aria-label="Uganda essentials sections">
                <kn-guide-section-nav
                  [items]="sectionItems()"
                  [selectedId]="selectedCode()"
                  panelId="essentials-section-panel"
                  ariaLabel="Uganda essentials sections"
                  (itemSelect)="selectTab($event)"
                />
              </nav>

              <div
                id="essentials-section-panel"
                tabindex="-1"
                class="mt-10 scroll-mt-[6.5rem] outline-none"
              >
                @if (selectedPanel(); as panel) {
                  <article>
                    @for (section of panelSections(panel); track section.code) {
                      <div class="mb-10 last:mb-0">
                        <h2 class="font-display text-3xl text-foreground sm:text-4xl">
                          {{ section.heading }}
                        </h2>
                        <div class="mt-5 space-y-4 text-[1.02rem] leading-relaxed text-foreground/90">
                          @for (block of section.blocks; track $index) {
                            @switch (block.type) {
                              @case ('paragraph') {
                                <p>{{ block.text }}</p>
                              }
                              @case ('subheading') {
                                <h3 class="pt-2 font-display text-2xl text-foreground">{{ block.text }}</h3>
                              }
                              @case ('list') {
                                <ul class="list-disc space-y-2 pl-5">
                                  @for (item of block.items; track $index) {
                                    <li>
                                      @if (item.label) {
                                        <strong>{{ item.label }}</strong>
                                        — {{ item.text }}
                                      } @else {
                                        {{ item.text }}
                                      }
                                    </li>
                                  }
                                </ul>
                              }
                              @case ('rates') {
                                <dl class="grid gap-2 sm:grid-cols-3">
                                  @for (row of block.rows; track row.currency) {
                                    <div class="rounded-xl border border-hairline bg-paper px-4 py-3">
                                      <dt class="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                                        {{ row.currency }}
                                      </dt>
                                      <dd class="mt-1 text-sm text-foreground">{{ row.range }}</dd>
                                    </div>
                                  }
                                </dl>
                              }
                            }
                          }
                        </div>
                      </div>
                    }
                  </article>
                }
              </div>
            </div>
          </div>
        </section>
      }
    }
  `,
})
export class GuideEssentialsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly guideApi = inject(GuideApiService);

  protected readonly countryCode = computed(() => guideCountryCode(this.route));
  protected readonly countryName = computed(() => {
    const fromRegistry = guideContentFor(this.countryCode())?.countryName;
    return fromRegistry ?? countryDisplayName(this.countryCode());
  });
  protected readonly state = signal<GuideLoadState>({ status: 'loading' });
  protected readonly selectedCode = signal<string>(this.initialTabCode());

  protected readonly facts = computed((): GuideEssential[] => {
    const current = this.state();
    return current.status === 'ready' ? current.essentials.filter((item) => !isNarrative(item)) : [];
  });

  protected readonly tabs = computed((): EssentialsTab[] => {
    const current = this.state();
    if (current.status !== 'ready') {
      return [];
    }

    const narrativeTabs = current.essentials
      .filter((item) => isNarrative(item) && item.code && !HIDDEN_TAB_CODES.has(item.code))
      .map((item) => ({
        code: item.code as string,
        label: narrativeHeading(item),
      }));

    return narrativeTabs;
  });

  protected readonly sectionItems = computed(() =>
    this.tabs().map((tab) => ({ id: tab.code, label: tab.label })),
  );

  protected readonly selectedPanel = computed((): NarrativePanel | null => {
    const current = this.state();
    if (current.status !== 'ready') {
      return null;
    }

    const code = this.selectedCode();

    const item = current.essentials.find((entry) => entry.code === code);
    if (!item) {
      return null;
    }

    const extras =
      code === 'ABOUT'
        ? current.essentials.filter((entry) => entry.code === 'HISTORY').map(toPanel)
        : [];

    return { ...toPanel(item), extras };
  });

  protected panelSections(panel: NarrativePanel): NarrativePanel[] {
    return [panel, ...panel.extras];
  }

  ngOnInit(): void {
    const code = this.countryCode();
    const fallback = fallbackEssentials(code);

    this.guideApi.getEssentials(code).subscribe({
      next: (essentials) => {
        const merged = essentials.length > 0 ? essentials : fallback;
        this.state.set(merged.length > 0 ? { status: 'ready', essentials: merged } : { status: 'empty' });
        this.ensureSelectedTab();
      },
      error: (error: unknown) => {
        if (fallback.length > 0) {
          this.state.set({ status: 'ready', essentials: fallback });
          this.ensureSelectedTab();
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

  protected selectTab(code: string): void {
    this.selectedCode.set(code);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { section: tabQueryValue(code) },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private initialTabCode(): string {
    const requested = this.route.snapshot.queryParamMap.get('section');
    return requested ? tabCodeFromQuery(requested) : 'ABOUT';
  }

  private ensureSelectedTab(): void {
    const available = this.tabs().map((tab) => tab.code);
    if (available.includes(this.selectedCode())) {
      return;
    }

    this.selectedCode.set(available[0] ?? 'ABOUT');
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
    code: item.code ?? item.id,
    heading: narrativeHeading(item),
    blocks: narrativeBlocks(item),
    extras: [],
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

function tabCodeFromQuery(value: string): string {
  return value.trim().toUpperCase().replaceAll('-', '_');
}
