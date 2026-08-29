import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideLayoutDashboard,
  LucideLogOut,
  LucideMenu,
  LucideSettings,
  LucideUsers,
  LucideX,
} from '@lucide/angular';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'kn-admin-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    LucideLayoutDashboard,
    LucideUsers,
    LucideSettings,
    LucideLogOut,
    LucideMenu,
    LucideX,
  ],
  template: `
    <div
      class="flex items-center justify-between border-b border-sidebar-border bg-sidebar px-4 py-3 lg:hidden"
    >
      <p class="font-display text-sidebar-foreground">
        Kampala<span class="text-primary">Nonstop</span>
      </p>
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
        <p class="font-display hidden text-lg lg:block">
          Kampala<span class="text-primary">Nonstop</span>
        </p>
        <p class="eyebrow mt-1 hidden text-sidebar-foreground/40 lg:block">Admin</p>

        <nav class="mt-6 space-y-1 lg:mt-10">
          <a
            routerLink="/admin/dashboard"
            routerLinkActive="bg-sidebar-accent text-sidebar-foreground"
            (click)="open.set(false)"
            class="flex items-center gap-3 px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <svg lucideLayoutDashboard class="h-4 w-4"></svg>
            Dashboard
          </a>
          <a
            routerLink="/admin/waitlist"
            routerLinkActive="bg-sidebar-accent text-sidebar-foreground"
            (click)="open.set(false)"
            class="flex items-center gap-3 px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <svg lucideUsers class="h-4 w-4"></svg>
            Waitlist
          </a>
          <a
            routerLink="/admin/settings"
            routerLinkActive="bg-sidebar-accent text-sidebar-foreground"
            (click)="open.set(false)"
            class="flex items-center gap-3 px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <svg lucideSettings class="h-4 w-4"></svg>
            Settings
          </a>
        </nav>

        <div class="mt-8 border-t border-sidebar-border pt-4 lg:mt-auto">
          <p class="truncate text-xs text-sidebar-foreground/50">{{ email() }}</p>
          <button
            type="button"
            (click)="onLogout()"
            class="mt-3 flex items-center gap-2 text-sm text-sidebar-foreground/70 transition-colors hover:text-primary"
          >
            <svg lucideLogOut class="h-4 w-4"></svg>
            Log out
          </button>
        </div>
      </div>
    </aside>
  `,
})
export class AdminSidebarComponent {
  readonly email = input.required<string>();

  protected readonly open = signal(false);

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected async onLogout(): Promise<void> {
    await this.auth.logout();
    void this.router.navigate(['/admin/login']);
  }
}
