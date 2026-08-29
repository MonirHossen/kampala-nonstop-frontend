import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { AdminSidebarComponent } from './admin-sidebar.component';
import { LoadingStateComponent } from './admin-ui';

@Component({
  selector: 'kn-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, AdminSidebarComponent, LoadingStateComponent],
  template: `
    @if (auth.user(); as user) {
      <div class="min-h-screen bg-background lg:flex">
        <kn-admin-sidebar [email]="user.email" />
        <main class="min-w-0 flex-1 px-5 py-8 sm:px-8 sm:py-10">
          <router-outlet />
        </main>
      </div>
    } @else {
      <div class="min-h-screen bg-background">
        <kn-loading-state label="Checking your session" />
      </div>
    }
  `,
})
export class AdminLayoutComponent {
  protected readonly auth = inject(AuthService);
}
