import { Injectable, computed, inject, signal } from '@angular/core';
import { LocalKnowledgeApiService } from './local-knowledge-api.service';
import { LocalKnowledgeItem } from './local-knowledge.models';

const SEEN_STORAGE_KEY = 'kn.localKnowledge.seenIds';

@Injectable({ providedIn: 'root' })
export class LocalKnowledgeStore {
  private readonly api = inject(LocalKnowledgeApiService);

  private readonly seenIds = signal<string[]>(readSeenIds());
  private readonly item = signal<LocalKnowledgeItem | null>(null);
  private readonly visible = signal(false);

  readonly current = computed(() => this.item());
  readonly isVisible = computed(() => this.visible() && this.item() !== null);

  show(item: LocalKnowledgeItem): void {
    this.item.set(item);
    this.visible.set(true);
    this.markSeen(item.id);
  }

  dismiss(): void {
    this.visible.set(false);
    this.item.set(null);
  }

  fetchRandom(params: {
    countryCode: string;
    pageContext?: string | null;
    geographicAreaCode?: string | null;
  }): void {
    this.api
      .getRandom({
        countryCode: params.countryCode,
        pageContext: params.pageContext,
        geographicAreaCode: params.geographicAreaCode,
        excludeIds: this.seenIds(),
      })
      .subscribe({
        next: (item) => {
          if (item) {
            this.show(item);
          }
        },
        error: () => {
          this.dismiss();
        },
      });
  }

  private markSeen(id: string): void {
    const next = Array.from(new Set([...this.seenIds(), id]));
    this.seenIds.set(next);
    writeSeenIds(next);
  }
}

function readSeenIds(): string[] {
  try {
    const raw = sessionStorage.getItem(SEEN_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function writeSeenIds(ids: string[]): void {
  try {
    sessionStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Private mode / quota — skip persistence; in-memory still works for the tab.
  }
}
