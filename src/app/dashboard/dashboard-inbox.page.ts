import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideMessageSquare, LucidePlus } from '@lucide/angular';
import { extractApiError } from '../core/lib/api-error';
import { SupportContact, SupportThread } from '../core/models/inbox.models';
import { InboxApiService } from '../core/services/inbox-api.service';

@Component({
  selector: 'kn-dashboard-inbox-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, LucideMessageSquare, LucidePlus],
  template: `
    <div>
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="eyebrow text-muted-foreground">Support</p>
          <h1 class="font-display mt-2 text-3xl text-foreground sm:text-4xl">Nonstop inbox</h1>
          <p class="mt-2 max-w-xl text-sm text-muted-foreground">
            Booking updates and messages with our team land here — and by email when notifications are on.
          </p>
        </div>
        <button
          type="button"
          (click)="composeOpen.set(!composeOpen())"
          class="inline-flex min-h-11 items-center gap-2 bg-primary px-4 text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground"
        >
          <svg lucidePlus class="h-3.5 w-3.5" aria-hidden="true"></svg>
          Message admin
        </button>
      </div>

      @if (contact(); as support) {
        <div class="mt-4 flex flex-wrap gap-3 text-sm">
          @if (support.admin_email) {
            <a class="text-forest underline-offset-2 hover:underline" [href]="'mailto:' + support.admin_email">
              Email {{ support.admin_email }}
            </a>
          }
          @if (support.whatsapp_url) {
            <a
              class="text-forest underline-offset-2 hover:underline"
              [href]="support.whatsapp_url"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ support.whatsapp_label || 'WhatsApp' }}
            </a>
          }
        </div>
      }

      @if (message()) {
        <p role="status" class="mt-4 border-l-2 border-forest bg-forest/5 px-3 py-2.5 text-xs text-forest">
          {{ message() }}
        </p>
      }
      @if (error()) {
        <p role="alert" class="mt-4 border-l-2 border-destructive bg-destructive/5 px-3 py-2.5 text-xs text-destructive">
          {{ error() }}
        </p>
      }

      @if (composeOpen()) {
        <form class="mt-6 border border-hairline bg-paper p-5" (ngSubmit)="sendMessage()">
          <h2 class="font-display text-xl text-foreground">Message admin</h2>
          <label class="mt-4 block text-sm">
            <span class="text-muted-foreground">Subject</span>
            <input
              class="mt-1.5 w-full border border-hairline bg-background px-3 py-2.5 text-sm"
              [(ngModel)]="composeSubject"
              name="subject"
              required
            />
          </label>
          <label class="mt-4 block text-sm">
            <span class="text-muted-foreground">Message</span>
            <textarea
              rows="4"
              class="mt-1.5 w-full border border-hairline bg-background px-3 py-2.5 text-sm"
              [(ngModel)]="composeBody"
              name="body"
              required
            ></textarea>
          </label>
          <button
            type="submit"
            [disabled]="sending()"
            class="mt-4 inline-flex min-h-11 items-center bg-primary px-5 text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground disabled:opacity-60"
          >
            Send
          </button>
        </form>
      }

      <div class="mt-8 border border-hairline bg-paper">
        <div class="border-b border-hairline px-5 py-4">
          <h2 class="font-display text-xl text-foreground">Threads</h2>
        </div>
        @if (loading()) {
          <p class="px-5 py-8 text-sm text-muted-foreground">Loading inbox&hellip;</p>
        } @else if (threads().length === 0) {
          <div class="px-5 py-10 text-center">
            <svg lucideMessageSquare class="mx-auto h-8 w-8 text-muted-foreground/50" aria-hidden="true"></svg>
            <p class="mt-3 text-sm text-muted-foreground">No messages yet.</p>
          </div>
        } @else {
          <ul class="divide-y divide-hairline">
            @for (thread of threads(); track thread.id) {
              <li>
                <a
                  [routerLink]="['/dashboard/inbox', thread.id]"
                  class="flex flex-wrap items-start justify-between gap-3 px-5 py-4 transition hover:bg-background"
                >
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-foreground">
                      @if (thread.unread) {
                        <span class="mr-2 inline-block h-2 w-2 rounded-full bg-primary" aria-label="Unread"></span>
                      }
                      {{ thread.subject }}
                    </p>
                    @if (thread.latest_message; as latest) {
                      <p class="mt-1 line-clamp-2 text-xs text-muted-foreground">{{ latest.body }}</p>
                    }
                  </div>
                  <p class="text-xs uppercase tracking-[0.08em] text-muted-foreground">
                    {{ thread.thread_type }}
                  </p>
                </a>
              </li>
            }
          </ul>
        }
      </div>
    </div>
  `,
})
export class DashboardInboxPage implements OnInit {
  private readonly inboxApi = inject(InboxApiService);

  protected readonly loading = signal(true);
  protected readonly sending = signal(false);
  protected readonly composeOpen = signal(false);
  protected readonly threads = signal<SupportThread[]>([]);
  protected readonly contact = signal<SupportContact | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly message = signal<string | null>(null);

  protected composeSubject = '';
  protected composeBody = '';

  ngOnInit(): void {
    this.load();
    this.inboxApi.supportContact().subscribe({
      next: (contact) => this.contact.set(contact),
      error: () => this.contact.set(null),
    });
  }

  protected sendMessage(): void {
    if (!this.composeSubject.trim() || !this.composeBody.trim()) {
      this.error.set('Subject and message are required.');
      return;
    }

    this.sending.set(true);
    this.error.set(null);
    this.message.set(null);

    this.inboxApi
      .messageAdmin({
        subject: this.composeSubject.trim(),
        body: this.composeBody.trim(),
      })
      .subscribe({
        next: (result) => {
          this.threads.update((items) => [result.thread, ...items]);
          this.composeSubject = '';
          this.composeBody = '';
          this.composeOpen.set(false);
          this.sending.set(false);
          this.message.set('Message sent to admin.');
        },
        error: (err: unknown) => {
          this.error.set(extractApiError(err));
          this.sending.set(false);
        },
      });
  }

  private load(): void {
    this.loading.set(true);
    this.inboxApi.listThreads().subscribe({
      next: (threads) => {
        this.threads.set(threads);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(extractApiError(err));
        this.loading.set(false);
      },
    });
  }
}
