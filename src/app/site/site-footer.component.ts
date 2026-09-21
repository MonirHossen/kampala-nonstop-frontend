import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'kn-site-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block shrink-0' },
  template: `
    <footer class="bg-ink text-ink-foreground">
      <div class="mx-auto max-w-[1400px] px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] text-center sm:px-8">
      <!--
      <div class="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div class="col-span-2 min-w-0 md:col-span-1">
            <a routerLink="/" aria-label="Kampala Nonstop home" class="inline-block focus-visible:outline-2 focus-visible:outline-primary">
              <p class="font-display text-3xl leading-none tracking-tight sm:text-4xl">
                Kampala<span class="text-primary">Nonstop</span>
              </p>
            </a>
            <p class="mt-3 text-ink-foreground/80">Personalised trip planning for Uganda.</p>
            <p class="eyebrow mt-6 text-ink-foreground/70">Kampala, Uganda</p>
          </div>

          <nav aria-label="Footer company" class="min-w-0">
            <h2 class="eyebrow mb-3 text-ink-foreground/70">Company</h2>
            <ul class="space-y-1 text-sm sm:text-base">
              <li><a routerLink="/about" class="footer-link">About</a></li>
              <li><a routerLink="/privacy" class="footer-link">Privacy Policy</a></li>
              <li><a routerLink="/terms" class="footer-link">Terms</a></li>
              <li><a routerLink="/contact" class="footer-link">Contact</a></li>
            </ul>
          </nav>

          @if (social().length) {
            <nav aria-label="Footer social" class="min-w-0">
              <h2 class="eyebrow mb-3 text-ink-foreground/70">Follow</h2>
              <ul class="space-y-1 text-sm sm:text-base">
                @for (link of social(); track link.label) {
                  <li><a [href]="link.href" target="_blank" rel="noopener noreferrer" class="footer-link">{{ link.label }}</a></li>
                }
              </ul>
            </nav>
          }
        </div>
        -->
        <p class="text-xs leading-4 text-ink-foreground/90">&copy; {{ year }} Kampala Nonstop. All rights reserved.</p>
        <!-- Contact and navigation will be restored when their destinations are ready.
          <a [href]="'mailto:' + settings.contactEmail()" class="break-all hover:text-primary focus-visible:outline-2 focus-visible:outline-primary">{{ settings.contactEmail() }}</a>
        -->
      </div>
    </footer>
  `,
  styles: `
    .footer-link { display: inline-flex; align-items: center; min-height: 44px; transition: color .2s; }
    .footer-link:hover { color: var(--primary); }
    .footer-link:focus-visible { outline: 2px solid var(--primary); outline-offset: 3px; }
  `,
})
export class SiteFooterComponent {
  protected readonly year = new Date().getFullYear();
  /* Restore alongside the commented footer links, including their imports.
  protected readonly settings = inject(SettingsStore);
  protected readonly social = computed(() => {
    const settings = this.settings.settings();
    return [
      { label: 'Instagram', href: settings?.instagram_url },
      { label: 'Facebook', href: settings?.facebook_url },
      { label: 'TikTok', href: settings?.tiktok_url },
    ].filter((link): link is { label: string; href: string } => !!link.href?.trim());
  });

  ngOnInit(): void {
    void this.settings.load();
  }
  */
}
