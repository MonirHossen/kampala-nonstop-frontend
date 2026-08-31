import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { SiteSettings } from '../core/services/settings.service';

@Component({
  selector: 'kn-site-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-ink text-ink-foreground">
      <div class="mx-auto max-w-[1400px] px-5 py-10 sm:px-8">
        <p class="text-center text-xs text-ink-foreground/45">
          &copy; {{ year }} Kampala Nonstop. All rights reserved.
        </p>
      </div>
    </footer>
  `,
})
export class SiteFooterComponent {
  readonly settings = input<SiteSettings | null>(null);

  protected readonly year = 2026;
}
