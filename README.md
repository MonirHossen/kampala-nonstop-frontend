# Kampala Nonstop — Angular

Angular port of the `Kampala Waitlist` app (originally React 19 + TanStack Start/Router + Vite).
Same design system, same Supabase backend, same public site and admin panel.

## Stack

| Concern    | Implementation                                                     |
| ---------- | ------------------------------------------------------------------ |
| Framework  | Angular 20, standalone components, signals, `OnPush` everywhere    |
| Routing    | `@angular/router` with lazy `loadComponent` and functional guards  |
| Styling    | Tailwind CSS v4 via `@tailwindcss/postcss`, tokens in `src/styles.css` |
| Icons      | `@lucide/angular`                                                  |
| Forms      | Typed reactive forms (`FormBuilder.nonNullable`)                    |
| Data       | `@supabase/supabase-js` called from injectable services            |

## Getting started

```bash
npm install
npm start          # http://localhost:4200
npm run build      # production bundle in dist/
```

Supabase credentials live in `src/environments/environment.ts` (development) and
`src/environments/environment.production.ts` (production, swapped in by the `production`
build configuration). Replace the publishable key there when the project rotates keys.

## Structure

```
src/app
  core/lib          countries, interests, tracking, cn() helper (copied verbatim)
  core/supabase     typed client factory + generated Database types
  core/services     WaitlistService, SettingsService, AuthService, SettingsStore
  shared            Reveal directive, toast service + toaster, scroll helper
  site              header, footer, hero, story, categories, page shell
  waitlist          waitlist form, country selector, interest selector
  admin             guard, layout, sidebar, login, dashboard, list, detail, settings
  pages             home, about, contact, privacy, terms, 404
```

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
