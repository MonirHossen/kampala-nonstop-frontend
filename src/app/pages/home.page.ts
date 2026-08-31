import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

@Component({
  selector: 'kn-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SiteHeaderComponent,
    SiteFooterComponent,
    HeroComponent,
    CategoriesSectionComponent,
  ],
  template: `
    <div class="bg-background">
      <kn-site-header />
      <main>
        <kn-hero [launchNote]="settings.launchNote()" />
        <kn-categories-section />
      </main>
      <kn-site-footer />
    </div>
  `,
})
export class HomePage implements OnInit {
  protected readonly settings = inject(SettingsStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    void this.settings.load();

    this.route.queryParamMap.subscribe((params) => {
      const fromUrl = params.get('source')?.trim();
      if (fromUrl) rememberSource(fromUrl);
    });

    // Older emails and links point at /#waitlist, where the form used to live.
    if (this.router.url.includes('#waitlist')) {
      void this.router.navigate(['/waitlist/join'], {
        queryParams: {
          source:
            this.route.snapshot.queryParamMap.get('source')?.trim() ||
            readRememberedSource() ||
            DEFAULT_WAITLIST_SOURCE,
        },
        replaceUrl: true,
      });
    }
  }
}
