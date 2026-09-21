import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideBookmark,
  LucideLayoutDashboard,
  LucideLogOut,
  LucideMenu,
  LucideUser,
  LucideX,
} from '@lucide/angular';
import { TravellerAuthService } from '../core/services/traveller-auth.service';

@Component({
  selector: 'kn-dashboard-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    LucideLayoutDashboard,
    LucideUser,
    LucideBookmark,
    LucideLogOut,
    LucideMenu,
    LucideX,
  ],
  template: `
    <div
      class="flex items-center justify-between border-b border-sidebar-border bg-sidebar px-4 py-3 lg:hidden"
    >
      <a routerLink="/" class="inline-flex items-center" aria-label="Kampala Nonstop home">
        <img
          src="/img/kampala_nonstop_logo_white.png"
          alt="Kampala Nonstop"
          class="h-7 w-auto"
        />
      </a>
      <button type="button" (click)="open.set(!open())" aria-label="Toggle navigation">
        @if (open()) {
          <svg lucideX class="h-5 w-5 text-sidebar-foreground"></svg>
        } @else {
          <svg lucideMenu class="h-5 w-5 text-sidebar-foreground"></svg>
        }
      </button>
    </div>

    <aside
      class="bg-sidebar text-sidebar-foreground lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0"
      [class]="open() ? 'block' : 'hidden lg:block'"
    >
      <div class="flex h-full flex-col p-5">
        <a routerLink="/" class="hidden lg:inline-flex" aria-label="Kampala Nonstop home">
          <img
            src="/img/kampala_nonstop_logo_white.png"
            alt="Kampala Nonstop"
            class="h-8 w-auto"
          />
        </a>

        <div class="mt-6 hidden lg:block">
          <p class="text-sm text-sidebar-foreground/80">Hey, {{ firstName() }}</p>
        </div>

        <nav class="mt-6 space-y-1 lg:mt-8">
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-sidebar-accent text-sidebar-foreground"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="open.set(false)"
            class="flex items-center gap-3 px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <svg lucideLayoutDashboard class="h-4 w-4"></svg>
            Dashboard
          </a>
          <a
            routerLink="/dashboard/profile"
            routerLinkActive="bg-sidebar-accent text-sidebar-foreground"
            (click)="open.set(false)"
            class="flex items-center gap-3 px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <svg lucideUser class="h-4 w-4"></svg>
            My Profile
          </a>
          <a
            routerLink="/dashboard/favourites"
            routerLinkActive="bg-sidebar-accent text-sidebar-foreground"
            (click)="open.set(false)"
            class="flex items-center gap-3 px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <svg lucideBookmark class="h-4 w-4"></svg>
            Favourites
          </a>
        </nav>

        <div class="mt-8 border-t border-sidebar-border pt-4 lg:mt-auto">
          <button
            type="button"
            (click)="logout()"
            class="flex items-center gap-2 text-sm text-sidebar-foreground/70 transition-colors hover:text-primary"
          >
            <svg lucideLogOut class="h-4 w-4"></svg>
            Log out
          </button>
        </div>
      </div>
    </aside>
  `,
})
export class DashboardSidebarComponent {
  private readonly auth = inject(TravellerAuthService);

  protected readonly open = signal(false);
  protected readonly firstName = this.auth.firstName;

  protected logout(): void {
    this.auth.logoutAndRedirect('/?auth=login');
  }
}
