import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { SettingsStore } from '../core/services/settings.store';
import { CategoriesSectionComponent } from '../site/categories-section.component';
import { HeroComponent } from '../site/hero.component';
import { SiteFooterComponent } from '../site/site-footer.component';
import { SiteHeaderComponent } from '../site/site-header.component';
import { RevealDirective } from '../shared/reveal.directive';
import { WaitlistFormComponent } from '../waitlist/waitlist-form.component';

@Component({
  selector: 'kn-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SiteHeaderComponent,
    SiteFooterComponent,
    HeroComponent,
    CategoriesSectionComponent,
    WaitlistFormComponent,
    RevealDirective,
  ],
  template: `
    <div class="bg-background">
      <kn-site-header />
      <main>
        <kn-hero [launchNote]="settings.launchNote()" />

        <section id="waitlist" class="bg-ink">
          <div class="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-28">
            <div class="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
              <div knReveal>
                <div class="flex items-center gap-3">
                  <span class="h-px w-10 bg-primary"></span>
                  <p class="eyebrow text-primary">Waitlist</p>
                </div>
                <h2 class="display-lg mt-5 text-ink-foreground">Be first in line.</h2>
                <p class="mt-5 max-w-sm text-[1.02rem] leading-relaxed text-ink-foreground/65">
                  Tell us what you love. We'll use it to make your Kampala experience more
                  personal.
                </p>

                <ul class="mt-12 space-y-5 border-t border-ink-foreground/15 pt-8">
                  @for (benefit of benefits; track benefit.n) {
                    <li class="flex gap-4">
                      <span class="eyebrow pt-1 text-primary">{{ benefit.n }}</span>
                      <span class="text-[0.95rem] text-ink-foreground/70">{{ benefit.text }}</span>
                    </li>
                  }
                </ul>
              </div>

              <div [knReveal]="90">
                <kn-waitlist-form [disabled]="settings.waitlistDisabled()" />
              </div>
            </div>
          </div>
        </section>

        <kn-categories-section />
      </main>
      <kn-site-footer [settings]="settings.settings()" />
    </div>
  `,
})
export class HomePage implements OnInit {
  protected readonly settings = inject(SettingsStore);

  protected readonly benefits = [
    { n: '01', text: 'Early access when we open in Kampala' },
    { n: '02', text: 'Experiences matched to your interests' },
    { n: '03', text: 'Local hosts, not tourist packages' },
  ];

  ngOnInit(): void {
    void this.settings.load();
  }
}
