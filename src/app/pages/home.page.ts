import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  DEFAULT_WAITLIST_SOURCE,
  readRememberedSource,
  rememberSource,
} from '../core/lib/tracking';
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
            <div knReveal class="mx-auto w-full max-w-[820px]">
              <div class="flex items-center justify-center gap-3">
                <span class="h-px w-10 bg-primary"></span>
                <p class="eyebrow text-primary">Waitlist</p>
                <span class="h-px w-10 bg-primary"></span>
              </div>

              <div class="mt-6">
                <kn-waitlist-form
                  [disabled]="settings.waitlistDisabled()"
                  [sourceParam]="sourceParam()"
                />
              </div>
            </div>
          </div>
        </section>

        <kn-categories-section />
      </main>
      <kn-site-footer />
    </div>
  `,
})
export class HomePage implements OnInit {
  protected readonly settings = inject(SettingsStore);
  private readonly route = inject(ActivatedRoute);

  protected readonly sourceParam = signal<string>(DEFAULT_WAITLIST_SOURCE);

  ngOnInit(): void {
    void this.settings.load();

    this.route.queryParamMap.subscribe((params) => {
      const fromUrl = params.get('source')?.trim();
      if (fromUrl) rememberSource(fromUrl);
      this.sourceParam.set(fromUrl || readRememberedSource() || DEFAULT_WAITLIST_SOURCE);
    });
  }
}
