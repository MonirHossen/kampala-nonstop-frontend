import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideArrowLeft } from '@lucide/angular';
import { extractApiError } from '../core/lib/api-error';
import { SupportThread } from '../core/models/inbox.models';
import { InboxApiService } from '../core/services/inbox-api.service';

@Component({
  selector: 'kn-dashboard-inbox-thread-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, LucideArrowLeft],
  template: `
    <div>
      <a
        routerLink="/dashboard/inbox"
        class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground transition hover:text-foreground"
      >
        <svg lucideArrowLeft class="h-3.5 w-3.5" aria-hidden="true"></svg>
        Inbox
      </a>

      @if (loading()) {
        <p class="mt-8 text-sm text-muted-foreground">Loading thread&hellip;</p>
      } @else if (thread(); as current) {
        <div class="mt-4">
          <p class="eyebrow text-muted-foreground">{{ current.thread_type }} · {{ current.status_code }}</p>
          <h1 class="font-display mt-2 text-3xl text-foreground sm:text-4xl">{{ current.subject }}</h1>
          @if (current.trip; as trip) {
            <a
              [routerLink]="['/dashboard/trips', trip.id]"
              class="mt-2 inline-block text-sm text-forest underline-offset-2 hover:underline"
            >
              Related trip: {{ trip.name || 'Untitled trip' }}
            </a>
          }
        </div>

        @if (error()) {
          <p role="alert" class="mt-4 border-l-2 border-destructive bg-destructive/5 px-3 py-2.5 text-xs text-destructive">
            {{ error() }}
          </p>
        }

        <ul class="mt-8 space-y-3">
          @for (item of current.messages ?? []; track item.id) {
            <li
              class="border border-hairline px-4 py-3"
              [class]="
                item.sender_role === 'TRAVELLER'
                  ? 'bg-paper'
                  : item.sender_role === 'SYSTEM'
                    ? 'bg-background'
                    : 'bg-forest/5'
              "
            >
              <p class="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
                {{ item.sender_role }}
              </p>
              <p class="mt-2 whitespace-pre-wrap text-sm text-foreground">{{ item.body }}</p>
            </li>
          }
        </ul>

        <form class="mt-8 border border-hairline bg-paper p-5" (ngSubmit)="reply()">
          <label class="block text-sm">
            <span class="text-muted-foreground">Reply</span>
            <textarea
              rows="4"
              class="mt-1.5 w-full border border-hairline bg-background px-3 py-2.5 text-sm"
              [(ngModel)]="replyBody"
              name="reply"
              required
            ></textarea>
          </label>
          <button
            type="submit"
            [disabled]="sending()"
            class="mt-4 inline-flex min-h-11 items-center bg-primary px-5 text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground disabled:opacity-60"
          >
            Send reply
          </button>
        </form>
      }
    </div>
  `,
})
export class DashboardInboxThreadPage implements OnInit {
  private readonly inboxApi = inject(InboxApiService);
  private readonly route = inject(ActivatedRoute);

  protected readonly loading = signal(true);
  protected readonly sending = signal(false);
  protected readonly thread = signal<SupportThread | null>(null);
  protected readonly error = signal<string | null>(null);
  protected replyBody = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('threadId');
    if (!id) {
      this.error.set('Thread not found.');
      this.loading.set(false);
      return;
    }

    this.inboxApi.getThread(id).subscribe({
      next: (thread) => {
        this.thread.set(thread);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(extractApiError(err));
        this.loading.set(false);
      },
    });
  }

  protected reply(): void {
    const current = this.thread();
    if (!current || !this.replyBody.trim()) {
      return;
    }

    this.sending.set(true);
    this.error.set(null);
    this.inboxApi.reply(current.id, this.replyBody.trim()).subscribe({
      next: (result) => {
        this.thread.set(result.thread);
        this.replyBody = '';
        this.sending.set(false);
      },
      error: (err: unknown) => {
        this.error.set(extractApiError(err));
        this.sending.set(false);
      },
    });
  }
}
