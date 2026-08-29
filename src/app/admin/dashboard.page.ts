import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  WaitlistService,
  type DashboardSummary,
} from '../core/services/waitlist.service';
import {
  EmptyStateComponent,
  ErrorStateComponent,
  LoadingStateComponent,
  StatCardComponent,
  StatusPillComponent,
} from './admin-ui';

@Component({
  selector: 'kn-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    DatePipe,
    NgTemplateOutlet,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    StatCardComponent,
    StatusPillComponent,
  ],
  template: `
    <div class="mx-auto max-w-6xl">
      <header>
        <p class="eyebrow text-muted-foreground">Overview</p>
        <h1 class="font-display mt-2 text-3xl text-foreground sm:text-4xl">Dashboard</h1>
      </header>

      @if (loading()) {
        <kn-loading-state label="Loading statistics" />
      }

      @if (error(); as message) {
        <div class="mt-8">
          <kn-error-state [message]="message" (retry)="load()" />
        </div>
      }

      @if (data(); as summary) {
        <div class="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <kn-stat-card label="Total members" [value]="summary.total" />
          <kn-stat-card label="Today" [value]="summary.today" />
          <kn-stat-card label="This week" [value]="summary.week" />
          <kn-stat-card label="This month" [value]="summary.month" />
          <kn-stat-card label="Marketing opt-ins" [value]="summary.optIns" />
        </div>

        <div class="mt-10 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 class="eyebrow text-muted-foreground">Top countries</h2>
            <ng-container
              [ngTemplateOutlet]="barList"
              [ngTemplateOutletContext]="{ rows: summary.topCountries, total: summary.total }"
            />
          </section>
          <section>
            <h2 class="eyebrow text-muted-foreground">Top interests</h2>
            <ng-container
              [ngTemplateOutlet]="barList"
              [ngTemplateOutletContext]="{ rows: summary.topInterests, total: summary.total }"
            />
          </section>
        </div>

        <section class="mt-12">
          <div class="flex items-end justify-between">
            <h2 class="eyebrow text-muted-foreground">Recent signups</h2>
            <a routerLink="/admin/waitlist" class="eyebrow text-primary hover:opacity-70">
              View all &rarr;
            </a>
          </div>

          @if (summary.recent.length === 0) {
            <div class="mt-4">
              <kn-empty-state
                title="No registrations yet"
                body="As soon as visitors join the waitlist they'll appear here."
              />
            </div>
          } @else {
            <ul class="mt-4 divide-y divide-hairline border-y border-hairline">
              @for (entry of summary.recent; track entry.id) {
                <li class="flex flex-wrap items-center gap-3 py-3.5">
                  <a
                    [routerLink]="['/admin/waitlist', entry.id]"
                    class="min-w-0 flex-1 text-sm text-foreground hover:text-primary"
                  >
                    <span class="font-semibold">{{ entry.first_name }} {{ entry.surname }}</span>
                    <span class="ml-2 text-muted-foreground">{{ entry.email }}</span>
                  </a>
                  <span class="text-xs text-muted-foreground">{{ entry.country_name }}</span>
                  <kn-status-pill [status]="entry.status" />
                  <span class="text-xs text-muted-foreground">
                    {{ entry.created_at | date: 'shortDate' }}
                  </span>
                </li>
              }
            </ul>
          }
        </section>
      }
    </div>

    <ng-template #barList let-rows="rows" let-total="total">
      @if (rows.length === 0) {
        <p class="mt-4 text-sm text-muted-foreground">No data yet.</p>
      } @else {
        <ul class="mt-4 space-y-3">
          @for (row of rows; track row[0]) {
            <li>
              <div class="flex items-baseline justify-between text-sm">
                <span class="truncate pr-3 text-foreground">{{ row[0] }}</span>
                <span class="text-muted-foreground">{{ row[1] }}</span>
              </div>
              <div class="mt-1.5 h-1 w-full bg-secondary">
                <div class="h-1 bg-primary" [style.width.%]="share(row[1], total)"></div>
              </div>
            </li>
          }
        </ul>
      }
    </ng-template>
  `,
})
export class DashboardPage implements OnInit {
  private readonly waitlist = inject(WaitlistService);

  protected readonly data = signal<DashboardSummary | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.data.set(await this.waitlist.dashboard());
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Could not load the dashboard');
    } finally {
      this.loading.set(false);
    }
  }

  protected share(count: number, total: number): number {
    return total > 0 ? Math.max(4, (count / total) * 100) : 0;
  }
}
