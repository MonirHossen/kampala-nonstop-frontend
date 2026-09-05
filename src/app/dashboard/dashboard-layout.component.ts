import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TravellerAuthService } from '../core/services/traveller-auth.service';
import { DashboardSidebarComponent } from './dashboard-sidebar.component';

@Component({
  selector: 'kn-dashboard-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, DashboardSidebarComponent],
  template: `
    @if (auth.user()) {
      <div class="min-h-screen bg-background lg:flex">
        <kn-dashboard-sidebar />
        <main class="min-w-0 flex-1 px-5 py-8 sm:px-8 sm:py-10">
          <router-outlet />
        </main>
      </div>
    } @else {
      <div class="flex min-h-screen items-center justify-center bg-background">
        <p class="eyebrow text-muted-foreground">Loading your account&hellip;</p>
      </div>
    }
  `,
})
export class DashboardLayoutComponent {
  protected readonly auth = inject(TravellerAuthService);
}
