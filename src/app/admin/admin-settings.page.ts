import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideLoaderCircle } from '@lucide/angular';
import { SettingsService, type SiteSettings } from '../core/services/settings.service';
import { SettingsStore } from '../core/services/settings.store';
import { ToastService } from '../shared/toast.service';
import { ErrorStateComponent, LoadingStateComponent } from './admin-ui';

@Component({
  selector: 'kn-admin-settings-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, LucideLoaderCircle, LoadingStateComponent, ErrorStateComponent],
  template: `
    @if (loading()) {
      <kn-loading-state label="Loading settings" />
    } @else if (error(); as message) {
      <kn-error-state [message]="message" (retry)="load()" />
    } @else if (settingsId()) {
      <div class="mx-auto max-w-2xl">
        <p class="eyebrow text-muted-foreground">Configuration</p>
        <h1 class="font-display mt-2 text-3xl text-foreground sm:text-4xl">Settings</h1>

        <form
          [formGroup]="form"
          (ngSubmit)="onSave()"
          class="mt-8 space-y-7 border border-hairline bg-paper p-6 sm:p-8"
        >
          <div>
            <label class="eyebrow block text-muted-foreground">Website title</label>
            <div class="mt-2">
              <input
                formControlName="site_title"
                maxlength="120"
                class="h-11 w-full border-b border-input bg-transparent outline-none focus:border-primary"
              />
            </div>
          </div>

          <div class="flex items-start justify-between gap-6 border-t border-hairline pt-6">
            <div>
              <p class="text-sm font-semibold text-foreground">Waitlist enabled</p>
              <p class="mt-1 text-xs text-muted-foreground">
                When off, the public form is replaced by a closed-registrations notice.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              [attr.aria-checked]="form.controls.waitlist_enabled.value"
              (click)="toggleWaitlist()"
              class="relative h-6 w-11 shrink-0 transition-colors"
              [class]="form.controls.waitlist_enabled.value ? 'bg-primary' : 'bg-input'"
            >
              <span
                class="absolute top-0.5 h-5 w-5 bg-paper transition-transform"
                [class]="
                  form.controls.waitlist_enabled.value
                    ? 'translate-x-[1.4rem]'
                    : 'translate-x-0.5'
                "
              ></span>
            </button>
          </div>

          <div>
            <label class="eyebrow block text-muted-foreground">
              Marketing message (hero launch note)
            </label>
            <div class="mt-2">
              <input
                formControlName="marketing_message"
                maxlength="120"
                class="h-11 w-full border-b border-input bg-transparent outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label class="eyebrow block text-muted-foreground">Contact email</label>
            <div class="mt-2">
              <input
                type="email"
                formControlName="contact_email"
                maxlength="255"
                class="h-11 w-full border-b border-input bg-transparent outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label class="eyebrow block text-muted-foreground">Instagram URL</label>
            <div class="mt-2">
              <input
                type="url"
                formControlName="instagram_url"
                maxlength="255"
                class="h-11 w-full border-b border-input bg-transparent outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label class="eyebrow block text-muted-foreground">Facebook URL</label>
            <div class="mt-2">
              <input
                type="url"
                formControlName="facebook_url"
                maxlength="255"
                class="h-11 w-full border-b border-input bg-transparent outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label class="eyebrow block text-muted-foreground">TikTok URL</label>
            <div class="mt-2">
              <input
                type="url"
                formControlName="tiktok_url"
                maxlength="255"
                class="h-11 w-full border-b border-input bg-transparent outline-none focus:border-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            [disabled]="saving()"
            class="eyebrow flex items-center gap-2 bg-primary px-6 py-3.5 text-primary-foreground transition-colors hover:bg-clay disabled:opacity-70"
          >
            @if (saving()) {
              <svg lucideLoaderCircle class="h-4 w-4 animate-spin"></svg>
            }
            Save settings
          </button>
        </form>
      </div>
    }
  `,
})
export class AdminSettingsPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(SettingsService);
  private readonly store = inject(SettingsStore);
  private readonly toasts = inject(ToastService);

  protected readonly form = this.fb.nonNullable.group({
    site_title: ['', [Validators.maxLength(120)]],
    waitlist_enabled: [true],
    marketing_message: ['', [Validators.maxLength(120)]],
    contact_email: ['', [Validators.maxLength(255)]],
    instagram_url: ['', [Validators.maxLength(255)]],
    facebook_url: ['', [Validators.maxLength(255)]],
    tiktok_url: ['', [Validators.maxLength(255)]],
  });

  protected readonly settingsId = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const settings = await this.service.get();
      if (settings) this.apply(settings);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Could not load settings');
    } finally {
      this.loading.set(false);
    }
  }

  protected toggleWaitlist(): void {
    const control = this.form.controls.waitlist_enabled;
    control.setValue(!control.value);
    control.markAsDirty();
  }

  protected async onSave(): Promise<void> {
    const id = this.settingsId();
    if (!id) return;

    this.saving.set(true);
    try {
      await this.service.update(id, this.form.getRawValue());
      this.toasts.success('Settings saved');
      this.store.invalidate();
      void this.store.load();
      void this.load();
    } catch (e) {
      this.toasts.error(e instanceof Error ? e.message : 'Could not save settings');
    } finally {
      this.saving.set(false);
    }
  }

  private apply(settings: SiteSettings): void {
    this.settingsId.set(settings.id);
    this.form.setValue({
      site_title: settings.site_title,
      waitlist_enabled: settings.waitlist_enabled,
      marketing_message: settings.marketing_message,
      contact_email: settings.contact_email,
      instagram_url: settings.instagram_url,
      facebook_url: settings.facebook_url,
      tiktok_url: settings.tiktok_url,
    });
  }
}
