import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { SiteSettings } from '../core/services/settings.service';

@Component({
  selector: 'kn-site-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <footer class="bg-ink text-ink-foreground">
      <div class="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-20">
        <div class="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p class="font-display text-3xl leading-none tracking-tight sm:text-4xl">
              Kampala<span class="text-primary">Nonstop</span>
            </p>
            <p class="mt-3 max-w-xs text-ink-foreground/60">Discover Kampala differently.</p>
            <p class="eyebrow mt-8 text-ink-foreground/40">Kampala, Uganda</p>
          </div>

          <nav class="space-y-3">
            <p class="eyebrow text-ink-foreground/40">Company</p>
            <ul class="space-y-2.5 text-[0.95rem]">
              <li>
                <a routerLink="/about" class="hover:text-primary transition-colors">About</a>
              </li>
              <li>
                <a routerLink="/privacy" class="hover:text-primary transition-colors"
                  >Privacy Policy</a
                >
              </li>
              <li><a routerLink="/terms" class="hover:text-primary transition-colors">Terms</a></li>
              <li>
                <a routerLink="/contact" class="hover:text-primary transition-colors">Contact</a>
              </li>
            </ul>
          </nav>

          <nav class="space-y-3">
            <p class="eyebrow text-ink-foreground/40">Follow</p>
            <ul class="space-y-2.5 text-[0.95rem]">
              @for (link of social(); track link.label) {
                <li>
                  <a
                    [href]="link.href"
                    target="_blank"
                    rel="noreferrer noopener"
                    class="hover:text-primary transition-colors"
                  >
                    {{ link.label }}
                  </a>
                </li>
              }
            </ul>
          </nav>
        </div>

        <div
          class="mt-14 flex flex-col justify-between gap-3 border-t border-ink-foreground/12 pt-6 text-xs text-ink-foreground/45 sm:flex-row"
        >
          <p>&copy; {{ year }} Kampala Nonstop. All rights reserved.</p>
          <p>
            @if (settings()?.contact_email) {
              <a [href]="'mailto:' + settings()!.contact_email" class="hover:text-primary">
                {{ settings()!.contact_email }}
              </a>
            }
          </p>
        </div>
      </div>
    </footer>
  `,
})
export class SiteFooterComponent {
  readonly settings = input<SiteSettings | null>(null);

  protected readonly year = new Date().getFullYear();

  protected readonly social = computed(() => {
    const s = this.settings();
    return [
      { label: 'Instagram', href: s?.instagram_url ?? 'https://instagram.com' },
      { label: 'Facebook', href: s?.facebook_url ?? 'https://facebook.com' },
      { label: 'TikTok', href: s?.tiktok_url ?? 'https://tiktok.com' },
    ];
  });
}
