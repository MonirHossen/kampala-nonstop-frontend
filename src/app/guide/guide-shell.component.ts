import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { SiteFooterComponent } from '../site/site-footer.component';
import { SiteHeaderComponent } from '../site/site-header.component';
import { GuideHeroComponent } from './components/guide-hero.component';
import { guideContentFor } from './content/guide-content.registry';
import { countryDisplayName } from './guide-country-name';
import type { GuideCrumb } from './components/guide-breadcrumb.component';

type GuideTab = {
  path: string;
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
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  template: `
    <div class="flex min-h-screen flex-col bg-background">
      <kn-site-header [lightBackground]="true" />

      <kn-guide-hero
        [crumbs]="crumbs()"
        [eyebrow]="hero().eyebrow"
        [title]="hero().title"
        [lede]="hero().lede"
        [backgroundImage]="hero().image"
      />

      @if (content(); as guide) {
        <nav
          class="border-b border-hairline bg-paper/80 backdrop-blur-sm"
          aria-label="Guide sections"
        >
          <div
            class="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-5 sm:px-8"
            role="tablist"
          >
            @for (tab of tabs; track tab.path) {
              <a
                [routerLink]="tab.path ? tab.path : './'"
                routerLinkActive="text-primary border-primary"
                [routerLinkActiveOptions]="{ exact: tab.exact }"
                class="shrink-0 border-b-2 border-transparent px-3 py-3.5 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {{ tab.label }}
              </a>
            }
          </div>
        </nav>
      }

      <main class="flex-1">
        <router-outlet />
      </main>

      <kn-site-footer />
    </div>
  `,
})
export class GuideShellComponent {
  private readonly router = inject(Router);

  protected readonly countryCode = computed(() => this.countryFromUrl());
  protected readonly countryName = computed(() => countryDisplayName(this.countryCode()));
  protected readonly content = computed(() => guideContentFor(this.countryCode()));

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly tabs: GuideTab[] = [
    { path: '', label: 'Overview', exact: true },
    { path: 'essentials', label: 'Essentials', exact: false },
    { path: 'travel-guide', label: 'Travel Guide', exact: false },
    { path: 'travel-information', label: 'Travel Information', exact: false },
    { path: 'regions', label: 'Regions', exact: false },
  ];

  protected readonly crumbs = computed((): GuideCrumb[] => {
    const code = this.countryCode().toLowerCase();
    const name = this.countryName();
    const section = this.sectionSlug();
    const items: GuideCrumb[] = [
      { label: 'Guide', link: ['/', code, 'guide'] },
      { label: name, link: ['/', code, 'guide'] },
    ];

    if (section) {
      items.push({ label: this.sectionLabel(section) });
    }

    return items;
  });

  protected readonly hero = computed(() => {
    const guide = this.content();
    const name = this.countryName();
    const section = this.sectionSlug();
    const image = '/img/hero_culture_desktop.jpg';

    if (!guide) {
      return {
        eyebrow: 'Country guide',
        title: `${name} guide`,
        lede: 'A destination guide for this country is not published yet.',
        image,
      };
    }

    switch (section) {
      case 'essentials':
        return {
          eyebrow: 'Country guide',
          title: `${guide.countryName} essentials`,
          lede: 'Quick facts, plus a short read on the country and its history.',
          image,
        };
      case 'travel-guide':
        return {
          eyebrow: 'Country guide',
          title: 'Travel Guide',
          lede: 'Ten practical topics to help you prepare and find your way.',
          image: '/img/hero_adventure_desktop.jpg',
        };
      case 'travel-information':
        return {
          eyebrow: 'Country guide',
          title: 'Travel Information',
          lede: 'Visa guidance, visa-free entry and what the trip actually costs to start.',
          image: '/img/hero_events_desktop.jpg',
        };
      case 'regions':
        return {
          eyebrow: 'Country guide',
          title: 'Regions',
          lede: guide.regionsIntro,
          image: '/img/hero_nature_desktop.jpg',
        };
      default:
        return {
          eyebrow: 'Country guide',
          title: guide.hubTitle,
          lede: guide.hubLede,
          image,
        };
    }
  });

  private countryFromUrl(): string {
    const match = this.url().match(/^\/+([a-z]{2})\/guide/i);
    return (match?.[1] ?? 'ug').toUpperCase();
  }

  private sectionSlug(): string {
    const match = this.url().match(/\/guide(?:\/([^/?#]+))?/i);
    return match?.[1] ?? '';
  }

  private sectionLabel(slug: string): string {
    switch (slug) {
      case 'essentials':
        return 'Essentials';
      case 'travel-guide':
        return 'Travel Guide';
      case 'travel-information':
        return 'Travel Information';
      case 'regions':
        return 'Regions';
      default:
        return slug;
    }
  }
}
