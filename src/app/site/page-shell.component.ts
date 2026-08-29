import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SiteHeaderComponent } from './site-header.component';
import { SiteFooterComponent } from './site-footer.component';

@Component({
  selector: 'kn-page-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiteHeaderComponent, SiteFooterComponent],
  template: `
    <div class="min-h-screen bg-background">
      <kn-site-header />
      <main class="mx-auto max-w-3xl px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
        <div class="flex items-center gap-3">
          <span class="h-px w-10 bg-primary"></span>
          <p class="eyebrow text-clay">{{ eyebrow() }}</p>
        </div>
        <h1 class="display-lg mt-5 text-foreground">{{ title() }}</h1>
        <div class="mt-8 space-y-5 text-[1rem] leading-relaxed text-muted-foreground">
          <ng-content />
        </div>
      </main>
      <kn-site-footer />
    </div>
  `,
})
export class PageShellComponent {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
}
