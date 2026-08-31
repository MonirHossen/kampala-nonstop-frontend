import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
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
      <kn-site-footer [settings]="settings.settings()" />
    </div>
  `,
})
export class HomePage implements OnInit {
  protected readonly settings = inject(SettingsStore);

  ngOnInit(): void {
    void this.settings.load();
  }
}
