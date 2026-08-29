import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideArrowUpDown, LucideDownload, LucideSearch, LucideTrash2 } from '@lucide/angular';
import { COUNTRIES } from '../core/lib/countries';
import { INTERESTS } from '../core/lib/interests';
import {
  WaitlistService,
  toCsv,
  type WaitlistEntry,
  type WaitlistQuery,
  type WaitlistStatus,
} from '../core/services/waitlist.service';
import { ToastService } from '../shared/toast.service';
import {
  EmptyStateComponent,
  ErrorStateComponent,
  LoadingStateComponent,
} from './admin-ui';
import { ConfirmDialogComponent } from './confirm-dialog.component';

const STATUSES: WaitlistStatus[] = ['new', 'contacted', 'converted', 'archived'];
const PAGE_SIZE = 20;

@Component({
  selector: 'kn-waitlist-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    DatePipe,
    LucideArrowUpDown,
    LucideDownload,
    LucideSearch,
    LucideTrash2,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
  ],
  template: `
    <div class="mx-auto max-w-[1500px]">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="eyebrow text-muted-foreground">Registrations</p>
          <h1 class="font-display mt-2 text-3xl text-foreground sm:text-4xl">Waitlist</h1>
        </div>
        <div class="flex items-center gap-3">
          @if (selected().length > 0) {
            <button
              type="button"
              (click)="pendingDelete.set(selected())"
              class="eyebrow flex items-center gap-2 border border-destructive px-4 py-2.5 text-destructive hover:bg-destructive/5"
            >
              <svg lucideTrash2 class="h-3.5 w-3.5"></svg>
              Delete {{ selected().length }}
            </button>
          }
          <button
            type="button"
            (click)="onExport()"
            [disabled]="rows().length === 0"
            class="eyebrow flex items-center gap-2 border border-input px-4 py-2.5 text-foreground hover:border-foreground disabled:opacity-50"
          >
            <svg lucideDownload class="h-3.5 w-3.5"></svg>
            Export CSV
          </button>
        </div>
      </header>

      <div class="mt-7 grid gap-3 border border-hairline bg-paper p-4 sm:grid-cols-2 lg:grid-cols-6">
        <div class="relative sm:col-span-2">
          <svg lucideSearch class="absolute left-0 top-3 h-4 w-4 text-muted-foreground"></svg>
          <input
            [value]="filters().search ?? ''"
            (input)="patch({ search: inputValue($event) })"
            placeholder="Search name or email"
            class="h-10 w-full border-b border-input bg-transparent pl-6 text-sm outline-none focus:border-primary"
          />
        </div>

        <div>
          <label class="eyebrow block text-muted-foreground">Country</label>
          <select
            [value]="filters().country"
            (change)="patch({ country: inputValue($event) })"
            class="h-10 w-full border-b border-input bg-transparent text-sm outline-none focus:border-primary"
          >
            <option value="all">All countries</option>
            @for (country of countries; track country.code) {
              <option [value]="country.code">{{ country.name }}</option>
            }
          </select>
        </div>

        <div>
          <label class="eyebrow block text-muted-foreground">Interest</label>
          <select
            [value]="filters().interest"
            (change)="patch({ interest: inputValue($event) })"
            class="h-10 w-full border-b border-input bg-transparent text-sm outline-none focus:border-primary"
          >
            <option value="all">All interests</option>
            @for (interest of interests; track interest) {
              <option [value]="interest">{{ interest }}</option>
            }
          </select>
        </div>

        <div>
          <label class="eyebrow block text-muted-foreground">Marketing</label>
          <select
            [value]="filters().marketing"
            (change)="onMarketingChange(inputValue($event))"
            class="h-10 w-full border-b border-input bg-transparent text-sm outline-none focus:border-primary"
          >
            <option value="all">Opt-in: any</option>
            <option value="yes">Opted in</option>
            <option value="no">Not opted in</option>
          </select>
        </div>

        <div>
          <label class="eyebrow block text-muted-foreground">Status</label>
          <select
            [value]="filters().status"
            (change)="onStatusFilterChange(inputValue($event))"
            class="h-10 w-full border-b border-input bg-transparent text-sm outline-none focus:border-primary"
          >
            <option value="all">All statuses</option>
            @for (status of statuses; track status) {
              <option [value]="status">{{ status }}</option>
            }
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3 sm:col-span-2 lg:col-span-3">
          <div>
            <label class="eyebrow block text-muted-foreground">From</label>
            <input
              type="date"
              [value]="filters().from ?? ''"
              (change)="patch({ from: inputValue($event) })"
              class="h-10 w-full border-b border-input bg-transparent text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label class="eyebrow block text-muted-foreground">To</label>
            <input
              type="date"
              [value]="filters().to ?? ''"
              (change)="patch({ to: inputValue($event) })"
              class="h-10 w-full border-b border-input bg-transparent text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      @if (loading()) {
        <kn-loading-state label="Loading registrations" />
      }

      @if (error(); as message) {
        <div class="mt-6">
          <kn-error-state [message]="message" (retry)="load()" />
        </div>
      }

      @if (!loading() && !error() && rows().length === 0) {
        <div class="mt-6">
          <kn-empty-state
            title="No matching registrations"
            body="Adjust the filters, or wait for new signups to come through."
          />
        </div>
      }

      @if (rows().length > 0) {
        <div class="mt-6 overflow-x-auto border border-hairline bg-paper">
          <table class="w-full min-w-[1000px] text-sm">
            <thead>
              <tr class="border-b border-hairline text-left">
                <th class="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    [checked]="allSelected()"
                    (change)="toggleAll(checkboxValue($event))"
                  />
                </th>
                <th class="px-4 py-3">
                  <button
                    type="button"
                    (click)="sortBy('first_name')"
                    class="eyebrow flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    Name
                    <svg lucideArrowUpDown class="h-3 w-3"></svg>
                  </button>
                </th>
                <th class="px-4 py-3">
                  <button
                    type="button"
                    (click)="sortBy('email')"
                    class="eyebrow flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    Email
                    <svg lucideArrowUpDown class="h-3 w-3"></svg>
                  </button>
                </th>
                <th class="px-4 py-3">
                  <button
                    type="button"
                    (click)="sortBy('country_name')"
                    class="eyebrow flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    Country
                    <svg lucideArrowUpDown class="h-3 w-3"></svg>
                  </button>
                </th>
                <th class="px-4 py-3 eyebrow text-muted-foreground">Interests</th>
                <th class="px-4 py-3 eyebrow text-muted-foreground">Opt-in</th>
                <th class="px-4 py-3">
                  <button
                    type="button"
                    (click)="sortBy('created_at')"
                    class="eyebrow flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    Signup date
                    <svg lucideArrowUpDown class="h-3 w-3"></svg>
                  </button>
                </th>
                <th class="px-4 py-3 eyebrow text-muted-foreground">Source</th>
                <th class="px-4 py-3 eyebrow text-muted-foreground">Status</th>
                <th class="px-4 py-3 eyebrow text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (row of rows(); track row.id) {
                <tr class="border-b border-hairline/70 last:border-0">
                  <td class="px-4 py-3">
                    <input
                      type="checkbox"
                      [attr.aria-label]="'Select ' + row.email"
                      [checked]="selected().includes(row.id)"
                      (change)="toggleOne(row.id, checkboxValue($event))"
                    />
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap font-semibold text-foreground">
                    {{ row.first_name }} {{ row.surname }}
                  </td>
                  <td class="px-4 py-3 text-muted-foreground">{{ row.email }}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {{ row.country_name }}
                  </td>
                  <td class="max-w-[16rem] px-4 py-3 text-xs text-muted-foreground">
                    {{ row.interests.length > 0 ? row.interests.join(', ') : '—' }}
                  </td>
                  <td class="px-4 py-3 text-muted-foreground">
                    {{ row.marketing_opt_in ? 'Yes' : 'No' }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {{ row.created_at | date: 'shortDate' }}
                  </td>
                  <td class="px-4 py-3 text-xs text-muted-foreground">{{ row.source ?? '—' }}</td>
                  <td class="px-4 py-3">
                    <select
                      [value]="row.status"
                      (change)="onStatusChange(row.id, inputValue($event))"
                      class="border border-input bg-transparent px-2 py-1.5 text-xs capitalize outline-none focus:border-primary"
                    >
                      @for (status of statuses; track status) {
                        <option [value]="status">{{ status }}</option>
                      }
                    </select>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3 whitespace-nowrap">
                      <a
                        [routerLink]="['/admin/waitlist', row.id]"
                        class="eyebrow text-primary hover:opacity-70"
                      >
                        View
                      </a>
                      <button
                        type="button"
                        (click)="pendingDelete.set([row.id])"
                        [attr.aria-label]="'Delete ' + row.email"
                        class="text-muted-foreground hover:text-destructive"
                      >
                        <svg lucideTrash2 class="h-3.5 w-3.5"></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p class="text-xs text-muted-foreground">
            {{ total() }} registration{{ total() === 1 ? '' : 's' }} &middot; page
            {{ filters().page }} of {{ pages() }}
          </p>
          <div class="flex gap-2">
            <button
              type="button"
              [disabled]="(filters().page ?? 1) <= 1"
              (click)="goToPage((filters().page ?? 1) - 1)"
              class="eyebrow border border-input px-4 py-2 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              [disabled]="(filters().page ?? 1) >= pages()"
              (click)="goToPage((filters().page ?? 1) + 1)"
              class="eyebrow border border-input px-4 py-2 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      }

      @if (pendingDelete(); as ids) {
        <kn-confirm-dialog
          [title]="'Delete registration' + (ids.length > 1 ? 's' : '') + '?'"
          [body]="
            'This permanently removes ' +
            ids.length +
            ' waitlist record' +
            (ids.length > 1 ? 's' : '') +
            '. This cannot be undone.'
          "
          (confirmed)="onConfirmDelete()"
          (cancelled)="pendingDelete.set(null)"
        />
      }
    </div>
  `,
})
export class WaitlistListPage implements OnInit {
  private readonly waitlist = inject(WaitlistService);
  private readonly toasts = inject(ToastService);

  protected readonly countries = COUNTRIES;
  protected readonly interests = INTERESTS;
  protected readonly statuses = STATUSES;

  protected readonly filters = signal<WaitlistQuery>({
    search: '',
    country: 'all',
    interest: 'all',
    marketing: 'all',
    status: 'all',
    sortBy: 'created_at',
    sortDir: 'desc',
    page: 1,
    pageSize: PAGE_SIZE,
  });

  protected readonly rows = signal<WaitlistEntry[]>([]);
  protected readonly total = signal(0);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly selected = signal<string[]>([]);
  protected readonly pendingDelete = signal<string[] | null>(null);

  protected readonly pages = computed(() => Math.max(1, Math.ceil(this.total() / PAGE_SIZE)));
  protected readonly allSelected = computed(
    () => this.rows().length > 0 && this.selected().length === this.rows().length,
  );

  ngOnInit(): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const page = await this.waitlist.list(this.filters());
      this.rows.set(page.rows);
      this.total.set(page.total);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Could not load registrations');
      this.rows.set([]);
      this.total.set(0);
    } finally {
      this.loading.set(false);
    }
  }

  protected patch(patch: Partial<WaitlistQuery>): void {
    this.filters.update((prev) => ({ ...prev, page: 1, ...patch }));
    this.selected.set([]);
    void this.load();
  }

  protected sortBy(column: NonNullable<WaitlistQuery['sortBy']>): void {
    this.filters.update((prev) => ({
      ...prev,
      sortBy: column,
      sortDir: prev.sortBy === column && prev.sortDir === 'asc' ? 'desc' : 'asc',
    }));
    void this.load();
  }

  protected goToPage(page: number): void {
    this.filters.update((prev) => ({ ...prev, page }));
    this.selected.set([]);
    void this.load();
  }

  protected toggleAll(checked: boolean): void {
    this.selected.set(checked ? this.rows().map((r) => r.id) : []);
  }

  protected toggleOne(id: string, checked: boolean): void {
    this.selected.update((prev) =>
      checked ? [...prev, id] : prev.filter((existing) => existing !== id),
    );
  }

  protected onMarketingChange(value: string): void {
    this.patch({ marketing: value as 'all' | 'yes' | 'no' });
  }

  protected onStatusFilterChange(value: string): void {
    this.patch({ status: value as WaitlistStatus | 'all' });
  }

  protected async onStatusChange(id: string, status: string): Promise<void> {
    try {
      await this.waitlist.updateStatus(id, status as WaitlistStatus);
      this.toasts.success('Status updated');
      void this.load();
    } catch (e) {
      this.toasts.error(e instanceof Error ? e.message : 'Could not update status');
    }
  }

  protected async onConfirmDelete(): Promise<void> {
    const ids = this.pendingDelete();
    if (!ids) return;
    try {
      await this.waitlist.remove(ids);
      this.toasts.success(ids.length > 1 ? 'Registrations deleted' : 'Registration deleted');
      this.selected.set([]);
      void this.load();
    } catch (e) {
      this.toasts.error(e instanceof Error ? e.message : 'Could not delete');
    } finally {
      this.pendingDelete.set(null);
    }
  }

  protected onExport(): void {
    const csv = toCsv(this.rows());
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kampala-nonstop-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  protected inputValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  protected checkboxValue(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }
}
