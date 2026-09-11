import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { LocalKnowledgeApiService } from './local-knowledge-api.service';
import { LocalKnowledgeItem } from './local-knowledge.models';

const SEEN_STORAGE_KEY = 'kn.localKnowledge.seenIds';
export const LOCAL_KNOWLEDGE_DESKTOP_COUNT = 3;

/** Laravel validates exclude_ids as a string with max:2000. */
const EXCLUDE_IDS_MAX_CHARS = 1800;
const EXCLUDE_IDS_MAX_COUNT = 40;

export type LocalKnowledgeFetchParams = {
  countryCode: string;
  pageContext?: string | null;
  geographicAreaCode?: string | null;
};

@Injectable({ providedIn: 'root' })
export class LocalKnowledgeStore {
  private readonly api = inject(LocalKnowledgeApiService);

  private readonly seenIds = signal<string[]>(readSeenIds());
  private readonly itemList = signal<LocalKnowledgeItem[]>([]);
  private readonly loading = signal(false);
  private readonly refreshingSlot = signal<number | null>(null);
  private lastParams: LocalKnowledgeFetchParams | null = null;
  private fetchGeneration = 0;
  private slotGeneration = [0, 0, 0];

  readonly items = computed(() => this.itemList());
  readonly current = computed(() => this.itemList()[0] ?? null);
  readonly isLoading = computed(() => this.loading());
  readonly refreshingIndex = computed(() => this.refreshingSlot());

  clear(): void {
    this.fetchGeneration += 1;
    this.bumpSlots();
    this.loading.set(false);
    this.refreshingSlot.set(null);
    this.itemList.set([]);
  }

  refresh(index = 0): void {
    if (!this.lastParams || this.refreshingSlot() !== null) {
      return;
    }

    const current = this.itemList();
    if (!current[index]) {
      return;
    }

    const generation = ++this.slotGeneration[index];
    this.refreshingSlot.set(index);

    this.request(
      this.lastParams,
      this.excludeIdsForRequest(current.map((item) => item.id)),
      1,
      (items) => {
        if (this.slotGeneration[index] !== generation) {
          return;
        }

        const nextItem = items[0];
        if (!nextItem) {
          this.refreshingSlot.set(null);
          return;
        }

        const next = [...this.itemList()];
        next[index] = nextItem;
        this.itemList.set(next);
        this.markSeen(nextItem.id);
        this.refreshingSlot.set(null);
      },
      () => {
        if (this.slotGeneration[index] !== generation) {
          return;
        }
        this.refreshingSlot.set(null);
      },
      true,
    );
  }

  fetchRandom(params: LocalKnowledgeFetchParams): void {
    this.lastParams = params;
    this.loading.set(true);
    const generation = ++this.fetchGeneration;
    this.bumpSlots();
    this.refreshingSlot.set(null);

    this.request(
      params,
      this.excludeIdsForRequest(),
      LOCAL_KNOWLEDGE_DESKTOP_COUNT,
      (items) => {
        if (generation !== this.fetchGeneration) {
          return;
        }

        this.applyItems(items);
        this.loading.set(false);
      },
      () => {
        if (generation !== this.fetchGeneration) {
          return;
        }
        this.loading.set(false);
      },
      false,
    );
  }

  private request(
    params: LocalKnowledgeFetchParams,
    excludeIds: string[],
    limit: number,
    onSuccess: (items: LocalKnowledgeItem[]) => void,
    onError: () => void,
    keepOnEmpty: boolean,
    isRetry = false,
  ): void {
    this.api
      .getRandom({
        countryCode: params.countryCode,
        pageContext: params.pageContext,
        geographicAreaCode: params.geographicAreaCode,
        excludeIds,
        limit,
      })
      .subscribe({
        next: (items) => {
          if (items.length > 0) {
            onSuccess(items);
            return;
          }

          if (!isRetry) {
            this.resetSeenExceptDisplayed();
            this.request(
              params,
              this.excludeIdsForRequest(),
              limit,
              onSuccess,
              onError,
              keepOnEmpty,
              true,
            );
            return;
          }

          if (keepOnEmpty) {
            onSuccess([]);
            return;
          }

          this.itemList.set([]);
          onSuccess([]);
        },
        error: (error: unknown) => {
          if (!isRetry && isExcludeIdsRejected(error)) {
            this.resetSeenExceptDisplayed();
            this.request(
              params,
              this.excludeIdsForRequest(),
              limit,
              onSuccess,
              onError,
              keepOnEmpty,
              true,
            );
            return;
          }

          onError();
        },
      });
  }

  private applyItems(items: LocalKnowledgeItem[]): void {
    this.itemList.set(items);
    for (const item of items) {
      this.markSeen(item.id);
    }
  }

  private excludeIdsForRequest(required: string[] = []): string[] {
    const requiredUnique = uniqueIds(required);
    const recentSeen = this.seenIds().filter((id) => !requiredUnique.includes(id));
    const budget = Math.max(EXCLUDE_IDS_MAX_COUNT - requiredUnique.length, 0);
    const recent = recentSeen.slice(-budget);
    return capExcludeIds([...requiredUnique, ...recent]);
  }

  private resetSeenExceptDisplayed(): void {
    const displayed = this.itemList().map((item) => item.id);
    this.seenIds.set(displayed);
    writeSeenIds(displayed);
  }

  private bumpSlots(): void {
    this.slotGeneration = this.slotGeneration.map((generation) => generation + 1);
  }

  private markSeen(id: string): void {
    const next = uniqueIds([...this.seenIds(), id]).slice(-EXCLUDE_IDS_MAX_COUNT);
    this.seenIds.set(next);
    writeSeenIds(next);
  }
}

function uniqueIds(ids: string[]): string[] {
  return Array.from(new Set(ids.filter((id) => id.trim() !== '')));
}

function capExcludeIds(ids: string[]): string[] {
  const kept: string[] = [];
  let length = 0;

  for (const id of uniqueIds(ids)) {
    const extra = kept.length === 0 ? id.length : id.length + 1;
    if (kept.length >= EXCLUDE_IDS_MAX_COUNT || length + extra > EXCLUDE_IDS_MAX_CHARS) {
      break;
    }
    kept.push(id);
    length += extra;
  }

  return kept;
}

function isExcludeIdsRejected(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === 422;
}

function readSeenIds(): string[] {
  try {
    const raw = sessionStorage.getItem(SEEN_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    const ids = Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : [];
    return uniqueIds(ids).slice(-EXCLUDE_IDS_MAX_COUNT);
  } catch {
    return [];
  }
}

function writeSeenIds(ids: string[]): void {
  try {
    sessionStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(ids.slice(-EXCLUDE_IDS_MAX_COUNT)));
  } catch {
    // Private mode / quota — skip persistence; in-memory still works for the tab.
  }
}
