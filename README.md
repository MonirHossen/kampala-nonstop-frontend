# Kampala Nonstop — Angular

Angular port of the `Kampala Waitlist` app (originally React 19 + TanStack Start/Router + Vite).
Same design system, same Supabase backend, same public site and admin panel.

## Stack

| Concern   | Implementation                                                        |
| --------- | --------------------------------------------------------------------- |
| Framework | Angular 20, standalone components, signals, `OnPush` everywhere        |
| Routing   | `@angular/router` with lazy `loadComponent` and functional guards      |
| Styling   | Tailwind CSS v4 via `@tailwindcss/postcss`, tokens in `src/styles.css` |
| Icons     | `@lucide/angular`                                                     |
| Forms     | Typed reactive forms (`FormBuilder.nonNullable`)                       |
| Data      | `@supabase/supabase-js` called from injectable services               |

## Getting started

```bash
npm install
npm start          # http://localhost:4200
npm run build      # production bundle in dist/
```

Supabase credentials live in `src/environments/environment.ts` (development) and
`src/environments/environment.production.ts` (production, swapped in by the `production`
build configuration via `fileReplacements`). Replace the publishable key in both when the
project rotates keys.

## Project structure

```
public/
  favicon.ico
  img/                            hero, category and story photography (absolute-path assets)

src/
  index.html                      static SEO tags, JSON-LD, Google Fonts
  main.ts                         bootstrapApplication(App, appConfig)
  styles.css                      Tailwind v4 entry + full design-token system
  environments/                   supabaseUrl + supabasePublishableKey per build

src/app/
  app.ts                          root shell: <router-outlet /> + <kn-toaster />
  app.config.ts                   provideRouter with input binding + scroll restoration
  app.routes.ts                   all routes, lazy loadComponent, per-route titles

  core/lib/
    countries.ts                  COUNTRIES list + DEFAULT_COUNTRY (copied verbatim)
    interests.ts                  INTERESTS list (copied verbatim)
    tracking.ts                   collectTracking(): UTM / referrer / landing page
    utils.ts                      cn() — clsx + tailwind-merge

  core/supabase/
    database.types.ts             generated Supabase Database types
    supabase.client.ts            SUPABASE injection token; strips the bearer header
                                  that opaque sb_publishable_ keys must not send

  core/services/
    waitlist.service.ts           create / list / get / updateStatus / remove / dashboard,
                                  plus toCsv() for the admin export
    settings.service.ts           read + update the single site_settings row
    settings.store.ts             shared signal cache for site_settings (replaces
                                  react-query) with launchNote / contactEmail /
                                  waitlistDisabled computed views
    auth.service.ts               Supabase auth + admin-role check, session signals

  shared/
    reveal.directive.ts           [knReveal] — IntersectionObserver fade/slide-in
    scroll-to.ts                  smooth scrollToId() helper
    toast.service.ts              signal-based toast queue (replaces sonner)
    toaster.component.ts          fixed top-right toast renderer

  site/
    site-header.component.ts      fixed header, transparent until scrolled past 40px
    site-footer.component.ts      company + social links, driven by site settings
    hero.component.ts             full-viewport hero with drifting background image
    categories-section.component.ts  the "Nine ways to fall for the city" tile grid
    page-shell.component.ts       header + centred prose + footer, for content pages

  waitlist/
    waitlist-form.component.ts    the registration form: validation, submit, success and
                                  paused states
    country-selector.component.ts searchable country dropdown with click-outside/Escape
    interest-selector.component.ts multi-select interest chips

  admin/
    admin.guard.ts                adminGuard + adminLoginGuard (CanActivateFn)
    admin-layout.component.ts     sidebar + <router-outlet /> shell for the panel
    admin-sidebar.component.ts    nav, signed-in email, log out
    admin-ui.ts                   LoadingState / EmptyState / ErrorState / StatCard /
                                  StatusPill
    confirm-dialog.component.ts   delete confirmation (replaces the Radix alert dialog)
    admin-login.page.ts           email + password sign in
    dashboard.page.ts             counters, top countries/interests bars, recent signups
    waitlist-list.page.ts         filters, sortable table, pagination, CSV export,
                                  bulk delete
    waitlist-detail.page.ts       one registration incl. tracking attribution
    admin-settings.page.ts        site title, waitlist toggle, marketing message, contact
                                  email, social URLs

  pages/
    home.page.ts                  hero → waitlist → categories
    about.page.ts, contact.page.ts, privacy.page.ts, terms.page.ts
    not-found.page.ts             404
```

## Routes

| Path                   | Component            | Notes                                  |
| ---------------------- | -------------------- | -------------------------------------- |
| `/`                    | `HomePage`           | hero, waitlist form, category tiles    |
| `/about`               | `AboutPage`          |                                        |
| `/contact`             | `ContactPage`        | email comes from site settings         |
| `/privacy`             | `PrivacyPage`        |                                        |
| `/terms`               | `TermsPage`          |                                        |
| `/admin/login`         | `AdminLoginPage`     | `adminLoginGuard` bounces signed-in admins |
| `/admin`               | `AdminLayoutComponent` | `adminGuard`; redirects to `dashboard` |
| `/admin/dashboard`     | `DashboardPage`      |                                        |
| `/admin/waitlist`      | `WaitlistListPage`   |                                        |
| `/admin/waitlist/:id`  | `WaitlistDetailPage` | `id` bound via `withComponentInputBinding` |
| `/admin/settings`      | `AdminSettingsPage`  |                                        |
| `**`                   | `NotFoundPage`       |                                        |

## Notable differences from the React app

- **No SSR.** The original ran TanStack Start on Nitro; this build is client-rendered.
  Static SEO tags live in `src/index.html`, and per-route `<title>` comes from the route
  config. Add `@angular/ssr` if crawlable per-route metadata becomes a requirement.
- **`Reveal` is a directive, not a wrapper component.** Use `<li knReveal>` or
  `<div [knReveal]="90">` for a staggered delay, instead of `<Reveal as="li" delay={90}>`.
- **Data caching is a small service, not react-query.** `SettingsStore` holds the single
  `site_settings` row so the header, footer, home and contact pages share one fetch.
  Admin pages load on demand and expose an explicit retry.
- **Admin access is a route guard.** `adminGuard` resolves the Supabase session before the
  panel activates, replacing the redirect-inside-`useEffect` pattern. Row-level security
  is still the real boundary.
- **Toasts and the delete confirmation are local components** rather than `sonner` and
  the Radix alert dialog. Only the primitives the app actually used were ported, so there
  is no unused shadcn/ui layer.
- **Images are static assets** under `public/img/` and referenced by absolute path, instead
  of being imported through the bundler.
- **Lovable-specific code is dropped**: `lovable-error-reporting`, the preview auth storage
  broker, Drizzle config and the Vite/Nitro server entrypoints.
- **The story section was removed** and the waitlist form now sits directly below the hero,
  ahead of the category tiles. `public/img/story-*.jpg` are currently unreferenced.
