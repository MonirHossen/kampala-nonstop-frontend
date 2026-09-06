import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { extractApiError } from '../core/lib/api-error';
import { UserFavourite } from '../core/models/traveller.models';
import { UserApiService } from '../core/services/user-api.service';

const FAVOURITE_TYPES = [
  'place',
  'activity',
  'event',
  'tour',
  'service',
  'organisation',
  'experience',
] as const;

@Component({
  selector: 'kn-dashboard-favourites-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
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

      <form
        [formGroup]="addForm"
        (ngSubmit)="add()"
        class="mt-8 border border-hairline bg-paper p-6"
      >
        <h2 class="font-display text-xl text-foreground">Add favourite</h2>
        <p class="mt-2 text-sm text-muted-foreground">
          Save any listing by type and ID. Heart buttons on browse pages come later.
        </p>

        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label class="eyebrow text-muted-foreground" for="favouritable_type">Type</label>
            <select
              id="favouritable_type"
              formControlName="favouritable_type"
              class="mt-2 h-11 w-full border-b border-input bg-transparent outline-none focus:border-primary"
            >
              @for (type of types; track type) {
                <option [value]="type">{{ type }}</option>
              }
            </select>
          </div>
          <div>
            <label class="eyebrow text-muted-foreground" for="favouritable_id">Item ID (UUID)</label>
            <input
              id="favouritable_id"
              formControlName="favouritable_id"
              placeholder="0199a000-0000-7000-8000-000000000001"
              class="mt-2 h-11 w-full border-b border-input bg-transparent outline-none focus:border-primary"
            />
          </div>
          <div class="sm:col-span-2">
            <label class="eyebrow text-muted-foreground" for="notes">Notes (optional)</label>
            <input
              id="notes"
              formControlName="notes"
              maxlength="500"
              placeholder="Must visit"
              class="mt-2 h-11 w-full border-b border-input bg-transparent outline-none focus:border-primary"
            />
          </div>
        </div>

        <button
          type="submit"
          [disabled]="addForm.invalid || saving()"
          class="eyebrow mt-6 border border-foreground bg-foreground px-5 py-3 text-background transition-opacity disabled:opacity-50"
        >
          {{ saving() ? 'Saving…' : 'Save favourite' }}
        </button>
      </form>

      <div class="mt-8 border border-hairline bg-paper">
        <div class="border-b border-hairline px-5 py-4">
          <h2 class="font-display text-xl text-foreground">Saved items</h2>
        </div>

        @if (loading()) {
          <p class="px-5 py-8 text-sm text-muted-foreground">Loading favourites&hellip;</p>
        } @else if (favourites().length === 0) {
          <p class="px-5 py-8 text-sm text-muted-foreground">
            No favourites yet. Use the form above to save one.
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
  private readonly fb = inject(FormBuilder);

  protected readonly types = FAVOURITE_TYPES;
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly favourites = signal<UserFavourite[]>([]);
  protected readonly error = signal<string | null>(null);
  protected readonly message = signal<string | null>(null);

  protected readonly addForm = this.fb.nonNullable.group({
    favouritable_type: ['place' as (typeof FAVOURITE_TYPES)[number], Validators.required],
    favouritable_id: ['', [Validators.required, Validators.pattern(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    )]],
    notes: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  protected add(): void {
    if (this.addForm.invalid || this.saving()) {
      return;
    }

    this.error.set(null);
    this.message.set(null);
    this.saving.set(true);

    const { favouritable_type, favouritable_id, notes } = this.addForm.getRawValue();

    this.userApi
      .addFavourite({
        favouritable_type,
        favouritable_id,
        notes: notes.trim() || null,
      })
      .subscribe({
        next: (favourite) => {
          this.favourites.update((items) => [favourite, ...items]);
          this.addForm.patchValue({ favouritable_id: '', notes: '' });
          this.message.set('Favourite saved.');
          this.saving.set(false);
        },
        error: (err: unknown) => {
          this.error.set(extractApiError(err));
          this.saving.set(false);
        },
      });
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
