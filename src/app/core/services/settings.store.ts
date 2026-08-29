import { computed, inject, Injectable, signal } from '@angular/core';
import { SettingsService, type SiteSettings } from './settings.service';

/**
 * Shared cache for the single site_settings row, so the header, footer, home
 * page and contact page all read one fetch (the role react-query played).
 */
@Injectable({ providedIn: 'root' })
export class SettingsStore {
  private readonly service = inject(SettingsService);
  private readonly state = signal<SiteSettings | null>(null);
  private inFlight: Promise<SiteSettings | null> | null = null;

  readonly settings = this.state.asReadonly();
  readonly launchNote = computed(
    () => this.state()?.marketing_message ?? 'Launching soon in Kampala',
  );
  readonly contactEmail = computed(
    () => this.state()?.contact_email ?? 'hello@kampalanonstop.com',
  );
  readonly waitlistDisabled = computed(() => {
    const settings = this.state();
    return settings ? !settings.waitlist_enabled : false;
  });

  load(): Promise<SiteSettings | null> {
    if (!this.inFlight) {
      this.inFlight = this.service
        .get()
        .catch(() => null)
        .then((settings) => {
          this.state.set(settings);
          return settings;
        });
    }
    return this.inFlight;
  }

  /** Forces the next `load()` to hit the network again. */
  invalidate(): void {
    this.inFlight = null;
  }
}
