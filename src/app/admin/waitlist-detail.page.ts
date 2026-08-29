import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft } from '@lucide/angular';
import {
  WaitlistService,
  type WaitlistEntry,
  type WaitlistStatus,
} from '../core/services/waitlist.service';
import { ToastService } from '../shared/toast.service';
import { ErrorStateComponent, LoadingStateComponent, StatusPillComponent } from './admin-ui';

const STATUSES: WaitlistStatus[] = ['new', 'contacted', 'converted', 'archived'];

@Component({
  selector: 'kn-waitlist-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    LucideArrowLeft,
    LoadingStateComponent,
    ErrorStateComponent,
    StatusPillComponent,
  ],
  template: `
    @if (loading()) {
      <kn-loading-state label="Loading registration" />
    } @else if (error(); as message) {
      <kn-error-state [message]="message" (retry)="load()" />
    } @else if (entry(); as data) {
      <div class="mx-auto max-w-3xl">
        <a
          routerLink="/admin/waitlist"
          class="eyebrow flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <svg lucideArrowLeft class="h-3.5 w-3.5"></svg>
          Waitlist
        </a>

        <header
          class="mt-5 flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-6"
        >
          <div>
            <h1 class="font-display text-3xl text-foreground sm:text-4xl">
              {{ data.first_name }} {{ data.surname }}
            </h1>
            <p class="mt-2 text-sm text-muted-foreground">{{ data.email }}</p>
          </div>
          <div class="flex items-center gap-3">
            <kn-status-pill [status]="data.status" />
            <select
              [value]="data.status"
              (change)="onStatusChange(selectValue($event))"
              class="border border-input bg-transparent px-3 py-2 text-sm capitalize outline-none focus:border-primary"
            >
              @for (status of statuses; track status) {
                <option [value]="status">{{ status }}</option>
              }
            </select>
          </div>
        </header>

        <section class="border-b border-hairline py-7">
          <h2 class="eyebrow text-muted-foreground">Personal information</h2>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p class="text-xs text-muted-foreground">First name</p>
              <p class="mt-1 break-words text-sm text-foreground">{{ data.first_name }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Surname</p>
              <p class="mt-1 break-words text-sm text-foreground">{{ data.surname }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Email</p>
              <p class="mt-1 break-words text-sm text-foreground">{{ data.email }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Country</p>
              <p class="mt-1 break-words text-sm text-foreground">
                {{ data.country_name }} ({{ data.dial_code }})
              </p>
            </div>
          </div>
        </section>

        <section class="border-b border-hairline py-7">
          <h2 class="eyebrow text-muted-foreground">Interests</h2>
          <div class="mt-4">
            @if (data.interests.length === 0) {
              <p class="text-sm text-muted-foreground">No interests selected.</p>
            } @else {
              <ul class="flex flex-wrap gap-2">
                @for (interest of data.interests; track interest) {
                  <li class="border border-primary/40 px-3 py-1.5 text-xs text-primary">
                    {{ interest }}
                  </li>
                }
              </ul>
            }
          </div>
        </section>

        <section class="border-b border-hairline py-7">
          <h2 class="eyebrow text-muted-foreground">Marketing consent</h2>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p class="text-xs text-muted-foreground">Opted in</p>
              <p class="mt-1 break-words text-sm text-foreground">
                {{ data.marketing_opt_in ? 'Yes' : 'No' }}
              </p>
            </div>
          </div>
        </section>

        <section class="border-b border-hairline py-7">
          <h2 class="eyebrow text-muted-foreground">Tracking information</h2>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            @for (field of trackingFields(data); track field.label) {
              <div>
                <p class="text-xs text-muted-foreground">{{ field.label }}</p>
                <p class="mt-1 break-words text-sm text-foreground">{{ field.value }}</p>
              </div>
            }
          </div>
        </section>
      </div>
    }
  `,
})
export class WaitlistDetailPage implements OnInit {
  readonly id = input.required<string>();

  private readonly waitlist = inject(WaitlistService);
  private readonly toasts = inject(ToastService);

  protected readonly statuses = STATUSES;
  protected readonly entry = signal<WaitlistEntry | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.entry.set(await this.waitlist.get(this.id()));
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Could not load the registration');
    } finally {
      this.loading.set(false);
    }
  }

  protected async onStatusChange(status: string): Promise<void> {
    try {
      await this.waitlist.updateStatus(this.id(), status as WaitlistStatus);
      this.toasts.success('Status updated');
      void this.load();
    } catch (e) {
      this.toasts.error(e instanceof Error ? e.message : 'Could not update status');
    }
  }

  protected trackingFields(entry: WaitlistEntry): { label: string; value: string }[] {
    return [
      { label: 'Source', value: entry.source ?? '—' },
      { label: 'UTM source', value: entry.utm_source ?? '—' },
      { label: 'UTM medium', value: entry.utm_medium ?? '—' },
      { label: 'UTM campaign', value: entry.utm_campaign ?? '—' },
      { label: 'UTM term', value: entry.utm_term ?? '—' },
      { label: 'UTM content', value: entry.utm_content ?? '—' },
      { label: 'Landing page', value: entry.landing_page ?? '—' },
      { label: 'Referrer', value: entry.referrer ?? '—' },
      { label: 'Signed up', value: new Date(entry.created_at).toLocaleString() },
    ];
  }

  protected selectValue(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }
}
