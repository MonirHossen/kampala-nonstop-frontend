import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { extractApiError } from '../core/lib/api-error';
import { UserFavourite } from '../core/models/traveller.models';
import { UserApiService } from '../core/services/user-api.service';

@Component({
  selector: 'kn-dashboard-favourites-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div>
      <p class="eyebrow text-muted-foreground">Saved</p>
      <h1 class="font-display mt-2 text-3xl text-foreground sm:text-4xl">Favourites</h1>

      @if (message()) {
        <p role="status" class="mt-4 border-l-2 border-forest bg-forest/5 px-3 py-2.5 text-xs text-forest">
          {{ message() }}
        </p>
      }
      @if (error()) {
        <p
          role="alert"
          class="mt-4 border-l-2 border-destructive bg-destructive/5 px-3 py-2.5 text-xs text-destructive"
        >
          {{ error() }}
        </p>
      }

      <div class="mt-8 border border-hairline bg-paper">
        <div class="border-b border-hairline px-5 py-4">
          <h2 class="font-display text-xl text-foreground">Saved items</h2>
        </div>

        @if (loading()) {
          <p class="px-5 py-8 text-sm text-muted-foreground">Loading favourites&hellip;</p>
        } @else if (favourites().length === 0) {
          <p class="px-5 py-8 text-sm text-muted-foreground">
            No favourites yet. Save places, activities, or experiences while browsing.
          </p>
        } @else {
          <ul class="divide-y divide-hairline">
            @for (item of favourites(); track item.id) {
              <li class="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p class="text-sm font-medium capitalize text-foreground">
                    {{ item.favouritable_type }}
                  </p>
                  <p class="mt-1 text-xs text-muted-foreground">ID: {{ item.favouritable_id }}</p>
                  @if (item.notes) {
                    <p class="mt-1 text-sm text-muted-foreground">{{ item.notes }}</p>
                  }
                </div>
                <button
                  type="button"
                  (click)="remove(item)"
                  class="eyebrow border border-hairline px-3 py-2 text-destructive transition-colors hover:border-destructive"
                >
                  Remove
                </button>
              </li>
            }
          </ul>
        }
      </div>
    </div>
  `,
})
export class DashboardFavouritesPage implements OnInit {
  private readonly userApi = inject(UserApiService);

  protected readonly loading = signal(true);
  protected readonly favourites = signal<UserFavourite[]>([]);
  protected readonly error = signal<string | null>(null);
  protected readonly message = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  protected remove(favourite: UserFavourite): void {
    this.error.set(null);
    this.message.set(null);

    this.userApi.deleteFavourite(favourite.id).subscribe({
      next: () => {
        this.favourites.update((items) => items.filter((item) => item.id !== favourite.id));
        this.message.set('Favourite removed.');
      },
      error: (err: unknown) => this.error.set(extractApiError(err)),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.userApi.listFavourites().subscribe({
      next: (items) => {
        this.favourites.set(items);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(extractApiError(err));
        this.loading.set(false);
      },
    });
  }
}
