import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DEFAULT_WAITLIST_SOURCE,
  readRememberedSource,
  rememberSource,
} from '../core/lib/tracking';
import { SettingsStore } from '../core/services/settings.store';
import { SiteFooterComponent } from '../site/site-footer.component';
import { SiteHeaderComponent } from '../site/site-header.component';
import { RevealDirective } from '../shared/reveal.directive';
import { WaitlistFormComponent } from '../waitlist/waitlist-form.component';

@Component({
  selector: 'kn-waitlist-join-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WaitlistFormComponent, SiteFooterComponent, SiteHeaderComponent, RevealDirective],
  template: `
    <div class="bg-background">
      <kn-site-header />

      <section class="relative isolate overflow-hidden bg-ink">
        <div class="absolute inset-0">
          <img
            src="/img/hero-kampala.jpg"
            alt="Kampala hills and skyline at golden hour"
            width="1920"
            height="1280"
            class="drift h-full w-full object-cover object-[center_40%] opacity-[0.82]"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/40"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-ink/75 via-ink/35 to-transparent"></div>
        </div>

        <div
          class="relative mx-auto flex min-h-[min(62svh,34rem)] max-w-[1400px] flex-col justify-end px-5 pb-8 pt-28 sm:px-8 sm:pb-10 sm:pt-32"
        >
          <div knReveal class="max-w-2xl">
            <div class="flex items-center gap-3">
              <span class="h-px w-10 bg-primary"></span>
              <p class="eyebrow text-ink-foreground/80">Early access waitlist</p>
            </div>

            <h1 class="hero-headline mt-5 text-ink-foreground">
              Join the list.
              <span class="mt-1 block text-primary">
                Win a return flight to
                <br />
                Uganda.
              </span>
            </h1>

            <p
              class="mt-5 max-w-lg text-[1.02rem] leading-relaxed text-ink-foreground/72 sm:text-[1.1rem]"
            >
              Be first for personalised trip planning, local insights, and experiences shaped around
              how you want to feel Kampala.
            </p>
          </div>
        </div>
      </section>

      <main id="waitlist" class="bg-ink">
        <div class="mx-auto max-w-[1400px] px-5 pb-20 pt-4 sm:px-8 sm:pb-28 sm:pt-6">
          <div knReveal class="w-full">
            <kn-waitlist-form
              [disabled]="settings.waitlistDisabled()"
              [sourceParam]="sourceParam()"
            />
          </div>
        </div>
      </main>

      <kn-site-footer />
    </div>
  `,
})
export class WaitlistJoinPage implements OnInit {
  protected readonly settings = inject(SettingsStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly sourceParam = signal<string>(DEFAULT_WAITLIST_SOURCE);

  ngOnInit(): void {
    void this.settings.load();

    const existing = this.route.snapshot.queryParamMap.get('source')?.trim();
    if (!existing) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { source: readRememberedSource() || DEFAULT_WAITLIST_SOURCE },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }

    this.route.queryParamMap.subscribe((params) => {
      const fromUrl = params.get('source')?.trim();
      if (fromUrl) rememberSource(fromUrl);
      this.sourceParam.set(fromUrl || readRememberedSource() || DEFAULT_WAITLIST_SOURCE);
    });
  }
}
