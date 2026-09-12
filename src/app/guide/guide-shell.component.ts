import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { filter, map, startWith } from 'rxjs';
import { LocalKnowledgeSectionComponent } from '../local-knowledge/local-knowledge-section.component';
import { SiteFooterComponent } from '../site/site-footer.component';
import { SiteHeaderComponent } from '../site/site-header.component';
import { GuideHeroComponent } from './components/guide-hero.component';
import { guideContentFor } from './content/guide-content.registry';
import { countryDisplayName } from './guide-country-name';
import type { GuideCrumb } from './components/guide-breadcrumb.component';
import { guideSectionIcon } from './guide-topic-icons';
import type { LucideIconData } from '@lucide/angular';

type GuideTab = {
  path: string;
  slug: string;
  label: string;
  exact: boolean;
};

@Component({
  selector: 'kn-guide-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SiteHeaderComponent,
    SiteFooterComponent,
    GuideHeroComponent,
    LocalKnowledgeSectionComponent,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideDynamicIcon,
  ],
  template: `
    <div class="flex min-h-screen flex-col bg-background">
      <kn-site-header [lightBackground]="true" />

      <kn-guide-hero
        [crumbs]="crumbs()"
        [title]="heroTitle()"
        [backgroundImage]="heroImage"
      />

      @if (content(); as guide) {
        @if (sectionSlug()) {
          <nav class="border-b border-hairline bg-paper" aria-label="Country Guide">
          <div
            class="mx-auto flex max-w-[1400px] flex-wrap gap-2 overflow-x-auto px-5 py-3 sm:px-8"
            role="tablist"
          >
            @for (tab of tabs; track tab.path) {
              <a
                [routerLink]="tab.path ? tab.path : './'"
                routerLinkActive="!bg-primary !text-primary-foreground !border-primary"
                [routerLinkActiveOptions]="{ exact: tab.exact }"
                class="inline-flex shrink-0 items-center gap-2 rounded-lg border border-hairline bg-background px-3.5 py-2.5 text-[0.78rem] font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <svg
                  lucideIcon
                  [lucideIcon]="iconFor(tab.slug)"
                  class="h-4 w-4"
                  aria-hidden="true"
                ></svg>
                {{ tab.label }}
              </a>
            }
          </div>
        </nav>
        }
      }

      <main class="flex-1">
        <router-outlet />
      </main>

      <kn-local-knowledge-section />
      <kn-site-footer />
    </div>
  `,
})
export class GuideShellComponent {
  private readonly router = inject(Router);

  protected readonly countryCode = computed(() => this.countryFromUrl());
  protected readonly countryName = computed(() => countryDisplayName(this.countryCode()));
  protected readonly content = computed(() => guideContentFor(this.countryCode()));
  protected readonly heroImage = '/img/title-banner.jpg';

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly tabs: GuideTab[] = [
    { path: '', slug: 'overview', label: 'Overview', exact: true },
    { path: 'essentials', slug: 'essentials', label: 'Essentials', exact: false },
    { path: 'travel-guide', slug: 'travel-guide', label: 'Travel Guide', exact: false },
    { path: 'travel-information', slug: 'travel-information', label: 'Travel Information', exact: false },
    { path: 'regions', slug: 'regions', label: 'Regions', exact: false },
  ];

  protected readonly crumbs = computed((): GuideCrumb[] => {
    const code = this.countryCode().toLowerCase();
    return [
      { label: 'Home', link: '/' },
      { label: 'Guide', link: ['/', code, 'guide'] },
      { label: this.heroTitle() },
    ];
  });

  protected readonly heroTitle = computed(() => {
    const guide = this.content();
    const name = this.countryName();
    const section = this.sectionSlug();

    if (!guide) {
      return `${name} guide`;
    }

    switch (section) {
      case 'essentials':
        return `${guide.countryName} Essentials`;
      case 'travel-guide':
        return 'Travel Guide';
      case 'travel-information':
        return 'Travel Information';
      case 'regions':
        return 'Regions';
      default:
        return guide.hubTitle;
    }
  });

  protected iconFor(slug: string): LucideIconData {
    return guideSectionIcon(slug);
  }

  private countryFromUrl(): string {
    const match = this.url().match(/^\/+([a-z]{2})\/guide/i);
    return (match?.[1] ?? 'ug').toUpperCase();
  }

  protected sectionSlug(): string {
    const match = this.url().match(/\/guide(?:\/([^/?#]+))?/i);
    return match?.[1] ?? '';
  }
}
