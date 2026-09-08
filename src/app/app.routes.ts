import { Routes } from '@angular/router';
import { adminGuard, adminLoginGuard } from './admin/admin.guard';
import { redirectToAuthModal } from './core/guards/auth-modal-redirect.guard';
import { travellerGuard, travellerGuestGuard } from './core/guards/traveller.guards';

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
    path: 'guide',
    pathMatch: 'full',
    redirectTo: 'guide/UG',
  },
  {
    path: 'guide/:countryCode',
    title: 'Country Guide — Kampala Nonstop',
    loadComponent: () =>
      import('./guide/guide-landing.page').then((m) => m.GuideLandingPage),
  },
  {
    path: 'guide/:countryCode/travel',
    title: 'Travel Guide — Kampala Nonstop',
    loadComponent: () =>
      import('./guide/travel-guide.page').then((m) => m.TravelGuidePage),
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
    // Legacy deep links — bounce to the home-page auth modal.
    path: 'login',
    title: 'Sign in — Kampala Nonstop',
    canActivate: [travellerGuestGuard, redirectToAuthModal('login')],
    loadComponent: () => import('./pages/home.page').then((m) => m.HomePage),
  },
  {
    path: 'register',
    title: 'Create account — Kampala Nonstop',
    canActivate: [travellerGuestGuard, redirectToAuthModal('register')],
    loadComponent: () => import('./pages/home.page').then((m) => m.HomePage),
  },
  {
    path: 'auth/social/callback',
    title: 'Social sign-in — Kampala Nonstop',
    loadComponent: () =>
      import('./auth/social-callback.page').then((m) => m.SocialCallbackPage),
  },
  {
    path: 'forgot-password',
    title: 'Forgot password — Kampala Nonstop',
    canActivate: [travellerGuestGuard],
    loadComponent: () => import('./auth/forgot-password.page').then((m) => m.ForgotPasswordPage),
  },
  {
    path: 'reset-password',
    title: 'Reset password — Kampala Nonstop',
    canActivate: [travellerGuestGuard],
    loadComponent: () => import('./auth/reset-password.page').then((m) => m.ResetPasswordPage),
  },
  {
    path: 'dashboard',
    title: 'Dashboard — Kampala Nonstop',
    canActivate: [travellerGuard],
    loadComponent: () =>
      import('./dashboard/dashboard-layout.component').then((m) => m.DashboardLayoutComponent),
    children: [
      {
        path: '',
        title: 'Dashboard — Kampala Nonstop',
        loadComponent: () =>
          import('./dashboard/dashboard-overview.page').then((m) => m.DashboardOverviewPage),
      },
      {
        path: 'profile',
        title: 'My Profile — Kampala Nonstop',
        loadComponent: () =>
          import('./dashboard/dashboard-profile.page').then((m) => m.DashboardProfilePage),
      },
      {
        path: 'favourites',
        title: 'Favourites — Kampala Nonstop',
        loadComponent: () =>
          import('./dashboard/dashboard-favourites.page').then((m) => m.DashboardFavouritesPage),
      },
    ],
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
