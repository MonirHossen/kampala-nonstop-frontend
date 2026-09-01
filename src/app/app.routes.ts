import { Routes } from '@angular/router';
import { adminGuard, adminLoginGuard } from './admin/admin.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Kampala Nonstop | Discover Kampala Differently',
    loadComponent: () => import('./pages/home.page').then((m) => m.HomePage),
  },
  {
    path: 'waitlist/join',
    title: 'Join the Waitlist — Kampala Nonstop',
    loadComponent: () => import('./pages/waitlist-join.page').then((m) => m.WaitlistJoinPage),
  },
  {
    path: 'waitlist/invite',
    title: 'Invite a Friend — Kampala Nonstop',
    loadComponent: () => import('./pages/waitlist-invite.page').then((m) => m.WaitlistInvitePage),
  },
  {
    path: 'waitlist/unsubscribe',
    title: 'Unsubscribe — Kampala Nonstop',
    loadComponent: () =>
      import('./pages/waitlist-unsubscribe.page').then((m) => m.WaitlistUnsubscribePage),
  },
  {
    path: 'about',
    title: 'About — Kampala Nonstop',
    loadComponent: () => import('./pages/about.page').then((m) => m.AboutPage),
  },
  {
    path: 'contact',
    title: 'Contact — Kampala Nonstop',
    loadComponent: () => import('./pages/contact.page').then((m) => m.ContactPage),
  },
  {
    path: 'privacy',
    title: 'Privacy Policy — Kampala Nonstop',
    loadComponent: () => import('./pages/privacy.page').then((m) => m.PrivacyPage),
  },
  {
    path: 'terms',
    title: 'Terms — Kampala Nonstop',
    loadComponent: () => import('./pages/terms.page').then((m) => m.TermsPage),
  },
  {
    path: 'admin/login',
    title: 'Admin sign in — Kampala Nonstop',
    canActivate: [adminLoginGuard],
    loadComponent: () => import('./admin/admin-login.page').then((m) => m.AdminLoginPage),
  },
  {
    path: 'admin',
    title: 'Admin — Kampala Nonstop',
    canActivate: [adminGuard],
    loadComponent: () => import('./admin/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'waitlist',
        loadComponent: () => import('./admin/waitlist-list.page').then((m) => m.WaitlistListPage),
      },
      {
        path: 'waitlist/:id',
        loadComponent: () =>
          import('./admin/waitlist-detail.page').then((m) => m.WaitlistDetailPage),
      },
      {
        path: 'settings',
        loadComponent: () => import('./admin/admin-settings.page').then((m) => m.AdminSettingsPage),
      },
    ],
  },
  {
    path: '**',
    title: 'Page not found — Kampala Nonstop',
    loadComponent: () => import('./pages/not-found.page').then((m) => m.NotFoundPage),
  },
];
