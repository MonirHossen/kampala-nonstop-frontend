import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiteHeaderComponent } from '../site/site-header.component';
import { SiteFooterComponent } from '../site/site-footer.component';

@Component({
  selector: 'kn-services-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiteHeaderComponent, SiteFooterComponent],
  template: `
    <div class="flex min-h-screen flex-col bg-background">
      <kn-site-header [lightBackground]="true" />
      <main class="flex-1">
        <header class="mx-auto max-w-[1400px] px-5 pt-28 sm:px-8 sm:pt-32">
          <h1 class="max-w-4xl font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            Travel & Practical Services
          </h1>
          <p class="mt-5 max-w-4xl text-base leading-relaxed text-muted-foreground">
            Practical help for getting around, staying comfortable and making your time in Uganda easier.
          </p>
        </header>
        <section class="mx-auto max-w-[1400px] px-5 pb-14 pt-8 sm:px-8 sm:pb-20" aria-labelledby="services-heading">
          <h2 id="services-heading" class="font-display text-2xl text-foreground sm:text-3xl">Services for your trip</h2>
          <p class="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Find the practical services that make travelling around Uganda easier. Bookmark something for later, or Add to Trip when you want to include it in your plans. When you’re ready, Plan My Trip brings everything together so we can work through dates, availability, pricing and the practical details.
          </p>
          <p class="mt-6 font-semibold text-foreground">Service listings are coming soon.</p>
        </section>
      </main>
      <kn-site-footer />
    </div>
  `,
})
export class ServicesPage {}
