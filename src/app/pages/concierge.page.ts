import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiteHeaderComponent } from '../site/site-header.component';
import { SiteFooterComponent } from '../site/site-footer.component';

@Component({
  selector: 'kn-concierge-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiteHeaderComponent, SiteFooterComponent],
  template: `
    <div class="flex min-h-screen flex-col bg-background">
      <kn-site-header [lightBackground]="true" />
      <main class="flex-1">
        <header class="mx-auto max-w-[1400px] px-5 pt-28 sm:px-8 sm:pt-32">
          <h1 class="max-w-4xl font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            Concierge Services
          </h1>
          <p class="mt-5 max-w-4xl text-base leading-relaxed text-muted-foreground">
            Tell us what you need and Kampala Nonstop can help organise the practical details around your trip.
          </p>
        </header>
        <section class="mx-auto max-w-[1400px] px-5 pb-14 pt-8 sm:px-8 sm:pb-20" aria-labelledby="concierge-heading">
          <h2 id="concierge-heading" class="font-display text-2xl text-foreground sm:text-3xl">How Nonstop can help</h2>
          <p class="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            See how Kampala Nonstop can support your trip, from arrival and transport to personal assistance and specialist support. Add a service to your trip when you know you’ll need help, then use Plan My Trip to work through the details with us.
          </p>
          <p class="mt-6 font-semibold text-foreground">Full concierge services are coming soon.</p>
        </section>
      </main>
      <kn-site-footer />
    </div>
  `,
})
export class ConciergePage {}
