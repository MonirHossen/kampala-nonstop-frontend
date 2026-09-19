import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthModalComponent } from '../auth/auth-modal.component';
import {
  DEFAULT_WAITLIST_SOURCE,
  readRememberedSource,
  rememberSource,
} from '../core/lib/tracking';
import { AuthModalService } from '../core/services/auth-modal.service';
import { SettingsStore } from '../core/services/settings.store';
import { LocalKnowledgeSectionComponent } from '../local-knowledge/local-knowledge-section.component';
import { HeroComponent } from '../site/hero.component';
import { SiteFooterComponent } from '../site/site-footer.component';
import { SiteHeaderComponent } from '../site/site-header.component';

@Component({
  selector: 'kn-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SiteHeaderComponent,
    SiteFooterComponent,
    HeroComponent,
    AuthModalComponent,
    LocalKnowledgeSectionComponent,
  ],
  template: `
    <div class="bg-background">
      <kn-site-header />
      <main>
        <kn-hero [launchNote]="settings.launchNote()" />
        <div class="mx-auto grid max-w-[1400px] items-start gap-8 px-5 py-14 sm:px-8 sm:py-20 min-[1400px]:grid-cols-[56rem_minmax(0,1fr)]">
          <section id="about" aria-label="About Kampala Nonstop" class="min-w-0 max-w-4xl space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              <strong class="font-bold text-foreground">Kampala Nonstop is a Uganda-focused destination platform designed to help travellers discover, plan and experience more of the country through one trusted service.</strong>
            </p>
            <p>
              Imagine having a super-connected friend waiting for you in Uganda, who’s determined to make sure you have the best possible experience of the country. They understand your needs, know where to go, what’s happening, who to call and how to make things happen —
              <strong class="font-bold text-foreground">helping you experience the side of Uganda that only local knowledge can unlock.</strong>
            </p>
            <p><strong class="font-bold text-foreground">That’s Kampala Nonstop.</strong></p>
          </section>
          <kn-local-knowledge-section [inset]="true" [flush]="true" />
        </div>
      </main>
      <kn-site-footer />
      <kn-auth-modal />
    </div>
  `,
})
export class HomePage implements OnInit {
  protected readonly settings = inject(SettingsStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authModal = inject(AuthModalService);

  ngOnInit(): void {
    void this.settings.load();

    this.route.queryParamMap.subscribe((params) => {
      const fromUrl = params.get('source')?.trim();
      if (fromUrl) rememberSource(fromUrl);

      const auth = params.get('auth');
      if (auth === 'login' || auth === 'register' || auth === 'forgot') {
        if (this.authModal.mode() !== auth) {
          this.authModal.open(auth, {
            returnUrl: params.get('returnUrl'),
            error: params.get('social_error'),
          });
        }
      } else if (this.authModal.isOpen()) {
        this.authModal.close();
      }
    });

    // Older emails and links point at /#waitlist, where the form used to live.
    if (this.router.url.includes('#waitlist')) {
      void this.router.navigate(['/waitlist/join'], {
        queryParams: {
          source:
            this.route.snapshot.queryParamMap.get('source')?.trim() ||
            readRememberedSource() ||
            DEFAULT_WAITLIST_SOURCE,
        },
        replaceUrl: true,
      });
    }
  }
}
