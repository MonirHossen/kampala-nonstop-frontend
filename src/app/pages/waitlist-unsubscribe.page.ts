import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DEFAULT_WAITLIST_SOURCE } from '../core/lib/tracking';
import { PageShellComponent } from '../site/page-shell.component';

type UnsubscribeStatus = 'success' | 'already' | 'invalid';

@Component({
  selector: 'kn-waitlist-unsubscribe-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageShellComponent, RouterLink],
  template: `
    <kn-page-shell [eyebrow]="content().eyebrow" [title]="content().title">
      <p>{{ content().message }}</p>
      @if (content().showRejoin) {
        <p>
          Changed your mind? You can
          <a
            routerLink="/waitlist/join"
            [queryParams]="{ source: defaultSource }"
            class="font-medium text-primary underline-offset-4 hover:underline"
          >
            rejoin the waitlist
          </a>
          at any time.
        </p>
      }
      <p class="pt-2">
        <a
          routerLink="/"
          class="eyebrow inline-flex items-center bg-primary px-6 py-3 text-primary-foreground"
        >
          Back to home
        </a>
      </p>
    </kn-page-shell>
  `,
})
export class WaitlistUnsubscribePage {
  private readonly route = inject(ActivatedRoute);

  protected readonly defaultSource = DEFAULT_WAITLIST_SOURCE;

  private readonly status = computed((): UnsubscribeStatus => {
    const value = this.route.snapshot.queryParamMap.get('status')?.trim();

    if (value === 'success' || value === 'already' || value === 'invalid') {
      return value;
    }

    return 'invalid';
  });

  protected readonly content = computed(() => {
    switch (this.status()) {
      case 'success':
        return {
          eyebrow: 'Unsubscribed',
          title: 'You will no longer receive updates.',
          message:
            'You have been removed from Kampala Nonstop marketing emails. We will not send you launch updates or promotional messages.',
          showRejoin: true,
        };
      case 'already':
        return {
          eyebrow: 'Already unsubscribed',
          title: 'You are not on our update list.',
          message:
            'This email address is already unsubscribed from Kampala Nonstop marketing updates.',
          showRejoin: true,
        };
      default:
        return {
          eyebrow: 'Link unavailable',
          title: 'We could not process that request.',
          message:
            'This unsubscribe link is invalid or has expired. If you still want to stop receiving updates, please contact us.',
          showRejoin: false,
        };
    }
  });
}
