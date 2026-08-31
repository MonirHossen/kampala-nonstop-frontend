import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'kn-site-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-ink text-ink-foreground">
      <div class="mx-auto max-w-[1400px] px-5 py-8 text-center sm:px-8">
        <p class="text-xs text-ink-foreground/45">
          &copy; {{ year }} Kampala Nonstop. All rights reserved.
        </p>
      </div>
    </footer>
  `,
})
export class SiteFooterComponent {
  protected readonly year = new Date().getFullYear();
}
