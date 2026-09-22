import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { LucideEye, LucideEyeOff, LucideLoaderCircle } from '@lucide/angular';
import { extractApiError } from '../core/lib/api-error';
import { findCountry, type Country } from '../core/lib/countries';
import { UserCitizenship, UserConsent } from '../core/models/traveller.models';
import { CurrencyApiService, type CurrencyOption } from '../core/services/currency-api.service';
import { TravellerAuthService } from '../core/services/traveller-auth.service';
import { UserApiService } from '../core/services/user-api.service';
import { CountrySelectorComponent } from '../waitlist/country-selector.component';

@Component({
  selector: 'kn-dashboard-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    LucideEye,
    LucideEyeOff,
    LucideLoaderCircle,
    CountrySelectorComponent,
  ],
  template: `
    <div>
      <p class="eyebrow text-muted-foreground">Account</p>
      <h1 class="font-display mt-2 text-3xl text-foreground sm:text-4xl">My Profile</h1>

      @if (message()) {
        <p role="status" class="mt-4 border-l-2 border-forest bg-forest/5 px-3 py-2.5 text-xs text-forest">
          {{ message() }}
        </p>
      }
      @if (error()) {
        <p
          role="alert"
          class="mt-4 border-l-2 border-destructive bg-destructive/5 px-3 py-2.5 text-xs text-destructive"
        >
          {{ error() }}
        </p>
      }

      @if (loading()) {
        <p class="mt-8 eyebrow text-muted-foreground">Loading your profile&hellip;</p>
      } @else {
        <div class="mt-8 grid gap-6 xl:grid-cols-[1fr_320px]">
          <div class="space-y-6">
            <form
              [formGroup]="profileForm"
              (ngSubmit)="saveProfile()"
              class="border border-hairline bg-paper p-6"
            >
              <h2 class="font-display text-xl text-foreground">Personal details</h2>
              <div class="mt-5 grid gap-4 sm:grid-cols-2">
                <div class="sm:col-span-2">
                  <label class="eyebrow text-muted-foreground">Profile photo</label>
                  <div class="mt-3 flex flex-wrap items-center gap-4">
                    @if (photoDisplayUrl() && !photoLoadError()) {
                      <img
                        [src]="photoDisplayUrl()!"
                        alt="Profile photo"
                        class="h-20 w-20 rounded-full object-cover"
                        (error)="photoLoadError.set(true)"
                      />
                    } @else {
                      <div
                        class="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground"
                        aria-hidden="true"
                      >
                        {{ photoInitials() }}
                      </div>
                    }
                    <div class="flex flex-col gap-2">
                      <input
                        #photoInput
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        class="hidden"
                        (change)="onPhotoSelected($event)"
                      />
                      <button
                        type="button"
                        class="eyebrow inline-flex items-center justify-center gap-2 border border-hairline bg-paper px-3 py-2 text-foreground hover:border-primary disabled:opacity-70"
                        [disabled]="uploadingPhoto()"
                        (click)="photoInput.click()"
                      >
                        @if (uploadingPhoto()) {
                          <svg lucideLoaderCircle class="h-4 w-4 animate-spin"></svg>
                          Uploading&hellip;
                        } @else {
                          {{ photoDisplayUrl() && !photoLoadError() ? 'Change photo' : 'Upload photo' }}
                        }
                      </button>
                      @if (photoDisplayUrl() && !photoLoadError()) {
                        <button
                          type="button"
                          class="text-left text-xs text-muted-foreground transition-colors hover:text-destructive disabled:opacity-70"
                          [disabled]="uploadingPhoto()"
                          (click)="removePhoto()"
                        >
                          Remove photo
                        </button>
                      }
                      <p class="text-xs text-muted-foreground">JPG, PNG, WebP or GIF. Max 5&nbsp;MB.</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="eyebrow text-muted-foreground">First name</label>
                  <input
                    formControlName="first_name"
                    class="mt-2 h-11 w-full border-b border-input bg-transparent outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label class="eyebrow text-muted-foreground">Last name</label>
                  <input
                    formControlName="last_name"
                    class="mt-2 h-11 w-full border-b border-input bg-transparent outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label class="eyebrow text-muted-foreground">Middle name</label>
                  <input
                    formControlName="middle_name"
                    class="mt-2 h-11 w-full border-b border-input bg-transparent outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label class="eyebrow text-muted-foreground">Title</label>
                  <input
                    formControlName="title"
                    placeholder="Mr / Ms / Dr"
                    class="mt-2 h-11 w-full border-b border-input bg-transparent outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label class="eyebrow text-muted-foreground">Phone</label>
                  <input
                    formControlName="phone_number"
                    type="tel"
                    class="mt-2 h-11 w-full border-b border-input bg-transparent outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label class="eyebrow text-muted-foreground">Email</label>
                  <input
                    [value]="email"
                    disabled
                    class="mt-2 h-11 w-full border-b border-input bg-transparent opacity-60 outline-none"
                  />
                </div>
                <div>
                  <label class="eyebrow text-muted-foreground">Gender</label>
                  <select
                    formControlName="gender"
                    class="mt-2 h-11 w-full border-b border-input bg-transparent outline-none focus:border-primary"
                  >
                    <option value="">Select gender</option>
                    @if (customGenderValue(); as custom) {
                      <option [value]="custom">{{ custom }}</option>
                    }
                    @for (option of genderOptions; track option.value) {
                      <option [value]="option.value">{{ option.label }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="eyebrow text-muted-foreground">Date of birth</label>
                  <input
                    formControlName="date_of_birth"
                    type="date"
                    class="mt-2 h-11 w-full border-b border-input bg-transparent outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label class="eyebrow text-muted-foreground">City</label>
                  <input
                    formControlName="city_of_residence"
                    class="mt-2 h-11 w-full border-b border-input bg-transparent outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label class="eyebrow text-muted-foreground">Country</label>
                  <div class="mt-2">
                    <kn-country-selector
                      label="Country"
                      [value]="residenceCountry()"
                      [allowEmpty]="true"
                      emptyLabel="Select country"
                      (changed)="onResidenceCountry($event)"
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                class="eyebrow mt-6 inline-flex items-center justify-center gap-2 bg-primary px-4 py-2.5 text-primary-foreground hover:bg-clay disabled:opacity-70"
                [disabled]="savingProfile()"
              >
                @if (savingProfile()) {
                  <svg lucideLoaderCircle class="h-4 w-4 animate-spin"></svg>
                  Saving&hellip;
                } @else {
                  Save profile
                }
              </button>
            </form>

            <form
              [formGroup]="prefsForm"
              (ngSubmit)="savePreferences()"
              class="border border-hairline bg-paper p-6"
            >
              <h2 class="font-display text-xl text-foreground">Preferences</h2>
              <div class="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label class="eyebrow text-muted-foreground">Language</label>
                  <input formControlName="preferred_language" class="mt-2 h-11 w-full border-b border-input bg-transparent outline-none focus:border-primary" />
                </div>
                <div>
                  <label class="eyebrow text-muted-foreground">Currency</label>
                  <select
                    formControlName="preferred_currency"
                    class="mt-2 h-11 w-full border-b border-input bg-transparent outline-none focus:border-primary"
                  >
                    <option value="">Select currency</option>
                    @for (currency of currencies(); track currency.code) {
                      <option [value]="currency.code">{{ currency.name }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="eyebrow text-muted-foreground">Distance</label>
                  <select formControlName="distance_unit" class="mt-2 h-11 w-full border-b border-input bg-transparent outline-none focus:border-primary">
                    <option value="km">Kilometres</option>
                    <option value="mi">Miles</option>
                  </select>
                </div>
                <div>
                  <label class="eyebrow text-muted-foreground">Temperature</label>
                  <select formControlName="temperature_unit" class="mt-2 h-11 w-full border-b border-input bg-transparent outline-none focus:border-primary">
                    <option value="c">Celsius</option>
                    <option value="f">Fahrenheit</option>
                  </select>
                </div>
              </div>
              <button type="submit" class="eyebrow inline-flex items-center justify-center gap-2 bg-primary px-4 py-2.5 text-primary-foreground hover:bg-clay disabled:opacity-70 mt-6" [disabled]="savingPrefs()">
                {{ savingPrefs() ? 'Saving…' : 'Save preferences' }}
              </button>
            </form>

            <div class="border border-hairline bg-paper p-6">
              <h2 class="font-display text-xl text-foreground">Citizenships</h2>
              <ul class="mt-4 divide-y divide-hairline">
                @for (item of citizenships(); track item.id) {
                  <li class="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <span class="font-medium">{{ citizenshipLabel(item.country_code) }}</span>
                      @if (item.is_primary) {
                        <span class="ml-2 eyebrow bg-primary px-2 py-0.5 text-primary-foreground"
                          >Primary</span
                        >
                      }
                    </div>
                    <div class="flex gap-2">
                      @if (!item.is_primary) {
                        <button type="button" class="text-xs text-muted-foreground transition-colors hover:text-foreground" (click)="setPrimary(item)">
                          Make primary
                        </button>
                      }
                      <button type="button" class="text-xs text-muted-foreground transition-colors hover:text-foreground text-destructive" (click)="removeCitizenship(item)">
                        Remove
                      </button>
                    </div>
                  </li>
                } @empty {
                  <li class="py-3 text-sm text-muted-foreground">No citizenships added yet.</li>
                }
              </ul>

              <form
                [formGroup]="citizenshipForm"
                (ngSubmit)="addCitizenship()"
                class="mt-4 flex flex-wrap items-end gap-3"
              >
                <div class="min-w-[14rem] flex-1">
                  <label class="eyebrow text-muted-foreground">Country</label>
                  <div class="mt-2">
                    <kn-country-selector
                      label="Citizenship country"
                      [value]="citizenshipCountry()"
                      [invalid]="citizenshipForm.controls.country_code.touched && citizenshipForm.controls.country_code.invalid"
                      (changed)="onCitizenshipCountry($event)"
                    />
                  </div>
                </div>
                <label class="flex items-center gap-2 text-sm text-muted-foreground">
                  <input type="checkbox" formControlName="is_primary" />
                  Primary
                </label>
                <button type="submit" class="eyebrow inline-flex items-center justify-center gap-2 bg-primary px-4 py-2.5 text-primary-foreground hover:bg-clay disabled:opacity-70" [disabled]="addingCitizenship()">
                  {{ addingCitizenship() ? 'Adding…' : 'Add' }}
                </button>
              </form>
            </div>
          </div>

          <div class="space-y-6">
            <form
              [formGroup]="notifForm"
              (ngSubmit)="saveNotifications()"
              class="border border-hairline bg-paper p-6"
            >
              <h2 class="font-display text-xl text-foreground">Notifications</h2>
              <div class="mt-4 space-y-3 text-sm">
                <label class="flex items-center gap-2">
                  <input type="checkbox" formControlName="email_enabled" /> Email
                </label>
                <label class="flex items-center gap-2">
                  <input type="checkbox" formControlName="sms_enabled" /> SMS
                </label>
                <label class="flex items-center gap-2">
                  <input type="checkbox" formControlName="push_enabled" /> Push
                </label>
              </div>
              <button type="submit" class="eyebrow inline-flex items-center justify-center gap-2 bg-primary px-4 py-2.5 text-primary-foreground hover:bg-clay disabled:opacity-70 mt-5" [disabled]="savingNotif()">
                {{ savingNotif() ? 'Saving…' : 'Save' }}
              </button>
            </form>

            <div class="border border-hairline bg-paper p-6">
              <h2 class="font-display text-xl text-foreground">Consents</h2>
              <div class="mt-4 space-y-4">
                @for (consent of consents(); track consent.consent_type) {
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <p class="text-sm font-medium">{{ consentLabel(consent.consent_type) }}</p>
                      <p class="text-xs text-muted-foreground">
                        {{ consent.is_granted ? 'Granted' : 'Not granted' }}
                      </p>
                    </div>
                    <button type="button" class="text-xs text-muted-foreground transition-colors hover:text-foreground" (click)="toggleConsent(consent)">
                      {{ consent.is_granted ? 'Withdraw' : 'Grant' }}
                    </button>
                  </div>
                }
              </div>
            </div>

            <form
              [formGroup]="passwordForm"
              (ngSubmit)="changePassword()"
              class="border border-hairline bg-paper p-6"
            >
              <h2 class="font-display text-xl text-foreground">Change password</h2>
              <div class="mt-4 space-y-4">
                <div>
                  <label class="eyebrow text-muted-foreground">Current password</label>
                  <div class="relative">
                    <input
                      [type]="showPw() ? 'text' : 'password'"
                      formControlName="current_password"
                      class="mt-2 h-11 w-full border-b border-input bg-transparent outline-none focus:border-primary pr-10"
                    />
                    <button
                      type="button"
                      class="absolute right-0 top-4 text-muted-foreground"
                      (click)="showPw.set(!showPw())"
                    >
                      @if (showPw()) {
                        <svg lucideEyeOff class="h-4 w-4"></svg>
                      } @else {
                        <svg lucideEye class="h-4 w-4"></svg>
                      }
                    </button>
                  </div>
                </div>
                <div>
                  <label class="eyebrow text-muted-foreground">New password</label>
                  <input
                    [type]="showPw() ? 'text' : 'password'"
                    formControlName="password"
                    class="mt-2 h-11 w-full border-b border-input bg-transparent outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label class="eyebrow text-muted-foreground">Confirm password</label>
                  <input
                    [type]="showPw() ? 'text' : 'password'"
                    formControlName="password_confirmation"
                    class="mt-2 h-11 w-full border-b border-input bg-transparent outline-none focus:border-primary"
                  />
                </div>
              </div>
              <button type="submit" class="eyebrow inline-flex items-center justify-center gap-2 bg-primary px-4 py-2.5 text-primary-foreground hover:bg-clay disabled:opacity-70 mt-5" [disabled]="savingPassword()">
                {{ savingPassword() ? 'Updating…' : 'Update password' }}
              </button>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardProfilePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(TravellerAuthService);
  private readonly userApi = inject(UserApiService);
  private readonly currencyApi = inject(CurrencyApiService);

  protected readonly loading = signal(true);
  protected readonly savingProfile = signal(false);
  protected readonly uploadingPhoto = signal(false);
  protected readonly photoLoadError = signal(false);
  protected readonly photoPreview = signal<string | null>(null);
  protected readonly savingPrefs = signal(false);
  protected readonly savingNotif = signal(false);
  protected readonly savingPassword = signal(false);
  protected readonly addingCitizenship = signal(false);
  protected readonly message = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly citizenships = signal<UserCitizenship[]>([]);
  protected readonly consents = signal<UserConsent[]>([]);
  protected readonly currencies = signal<CurrencyOption[]>([]);
  protected readonly residenceCountry = signal<Country | null>(null);
  protected readonly citizenshipCountry = signal<Country | null>(null);
  protected readonly showPw = signal(false);
  protected readonly customGenderValue = signal<string | null>(null);

  protected readonly genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ] as const;

  protected readonly email = this.auth.user()?.email ?? '';

  protected readonly profileForm = this.fb.nonNullable.group({
    title: [''],
    first_name: ['', [Validators.required, Validators.maxLength(100)]],
    middle_name: [''],
    last_name: ['', [Validators.required, Validators.maxLength(100)]],
    gender: [''],
    date_of_birth: [''],
    phone_number: [''],
    city_of_residence: [''],
    country_of_residence: [''],
    profile_photo_url: [''],
  });

  protected readonly prefsForm = this.fb.nonNullable.group({
    preferred_language: ['en', Validators.required],
    preferred_currency: [''],
    distance_unit: ['km' as 'km' | 'mi', Validators.required],
    temperature_unit: ['c' as 'c' | 'f', Validators.required],
  });

  protected readonly notifForm = this.fb.nonNullable.group({
    email_enabled: [true],
    sms_enabled: [false],
    push_enabled: [false],
  });

  protected readonly citizenshipForm = this.fb.nonNullable.group({
    country_code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
    is_primary: [false],
  });

  protected readonly passwordForm = this.fb.nonNullable.group({
    current_password: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', Validators.required],
  });

  protected photoUrl(): string | null {
    const url = this.profileForm.controls.profile_photo_url.value?.trim();
    return url || null;
  }

  protected photoDisplayUrl(): string | null {
    return this.photoPreview() ?? this.photoUrl();
  }

  protected photoInitials(): string {
    const first = this.profileForm.controls.first_name.value?.trim().charAt(0) ?? '';
    const last = this.profileForm.controls.last_name.value?.trim().charAt(0) ?? '';
    const initials = `${first}${last}`.toUpperCase();
    return initials || '?';
  }

  protected onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) {
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      this.error.set('Please choose a JPG, PNG, WebP, or GIF image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.error.set('Profile photo must be 5 MB or smaller.');
      return;
    }

    this.clearFlash();
    this.revokePhotoPreview();
    this.photoPreview.set(URL.createObjectURL(file));
    this.photoLoadError.set(false);
    this.uploadingPhoto.set(true);

    this.userApi.uploadProfilePhoto(file).subscribe({
      next: (profile) => {
        this.profileForm.patchValue({ profile_photo_url: profile.profile_photo_url ?? '' });
        this.revokePhotoPreview();
        this.photoLoadError.set(false);
        this.message.set('Profile photo updated.');
        this.uploadingPhoto.set(false);
      },
      error: (err: unknown) => {
        this.revokePhotoPreview();
        this.error.set(extractApiError(err));
        this.uploadingPhoto.set(false);
      },
    });
  }

  protected removePhoto(): void {
    this.clearFlash();
    this.uploadingPhoto.set(true);

    this.userApi.deleteProfilePhoto().subscribe({
      next: () => {
        this.profileForm.patchValue({ profile_photo_url: '' });
        this.revokePhotoPreview();
        this.photoLoadError.set(false);
        this.message.set('Profile photo removed.');
        this.uploadingPhoto.set(false);
      },
      error: (err: unknown) => {
        this.error.set(extractApiError(err));
        this.uploadingPhoto.set(false);
      },
    });
  }

  ngOnInit(): void {
    forkJoin({
      profile: this.userApi.getProfile(),
      preferences: this.userApi.getPreferences(),
      notifications: this.userApi.getNotificationPreferences(),
      citizenships: this.userApi.listCitizenships(),
      consents: this.userApi.listConsents(),
      currencies: this.currencyApi.listCurrencies(),
    }).subscribe({
      next: ({ profile, preferences, notifications, citizenships, consents, currencies }) => {
        this.currencies.set(currencies);

        if (profile) {
          const gender = profile.gender ?? '';
          const genderKnown = this.genderOptions.some((option) => option.value === gender);
          this.customGenderValue.set(gender && !genderKnown ? gender : null);

          this.profileForm.patchValue({
            title: profile.title ?? '',
            first_name: profile.first_name,
            middle_name: profile.middle_name ?? '',
            last_name: profile.last_name,
            gender,
            date_of_birth: profile.date_of_birth ?? '',
            phone_number: profile.phone_number ?? '',
            city_of_residence: profile.city_of_residence ?? '',
            country_of_residence: profile.country_of_residence ?? '',
            profile_photo_url: profile.profile_photo_url ?? '',
          });
          this.photoLoadError.set(false);
          this.residenceCountry.set(
            profile.country_of_residence ? (findCountry(profile.country_of_residence) ?? null) : null,
          );
        }

        if (preferences) {
          this.prefsForm.patchValue({
            preferred_language: preferences.preferred_language,
            preferred_currency: preferences.preferred_currency ?? '',
            distance_unit: preferences.distance_unit,
            temperature_unit: preferences.temperature_unit,
          });
        }

        if (notifications) {
          this.notifForm.patchValue(notifications);
        }

        this.citizenships.set(citizenships);
        this.consents.set(consents);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(extractApiError(err));
        this.loading.set(false);
      },
    });
  }

  protected onResidenceCountry(country: Country | null): void {
    this.residenceCountry.set(country);
    this.profileForm.patchValue({ country_of_residence: country?.code ?? '' });
  }

  protected onCitizenshipCountry(country: Country | null): void {
    this.citizenshipCountry.set(country);
    this.citizenshipForm.patchValue({ country_code: country?.code ?? '' });
    this.citizenshipForm.controls.country_code.markAsTouched();
  }

  protected citizenshipLabel(code: string): string {
    return findCountry(code)?.name ?? code;
  }

  protected saveProfile(): void {
    this.clearFlash();
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid || this.savingProfile()) {
      return;
    }

    this.savingProfile.set(true);
    const raw = this.profileForm.getRawValue();

    this.userApi
      .updateProfile({
        title: raw.title || null,
        first_name: raw.first_name,
        middle_name: raw.middle_name || null,
        last_name: raw.last_name,
        gender: raw.gender || null,
        date_of_birth: raw.date_of_birth || null,
        phone_number: raw.phone_number || null,
        city_of_residence: raw.city_of_residence || null,
        country_of_residence: raw.country_of_residence || null,
        profile_photo_url: raw.profile_photo_url || null,
      })
      .subscribe({
        next: () => {
          this.message.set('Profile updated.');
          this.savingProfile.set(false);
        },
        error: (err: unknown) => {
          this.error.set(extractApiError(err));
          this.savingProfile.set(false);
        },
      });
  }

  protected savePreferences(): void {
    this.clearFlash();
    this.prefsForm.markAllAsTouched();
    if (this.prefsForm.invalid || this.savingPrefs()) {
      return;
    }

    this.savingPrefs.set(true);
    const raw = this.prefsForm.getRawValue();

    this.userApi
      .updatePreferences({
        preferred_language: raw.preferred_language,
        preferred_currency: raw.preferred_currency || null,
        distance_unit: raw.distance_unit,
        temperature_unit: raw.temperature_unit,
      })
      .subscribe({
        next: () => {
          this.message.set('Preferences updated.');
          this.savingPrefs.set(false);
        },
        error: (err: unknown) => {
          this.error.set(extractApiError(err));
          this.savingPrefs.set(false);
        },
      });
  }

  protected saveNotifications(): void {
    this.clearFlash();
    this.savingNotif.set(true);

    this.userApi.updateNotificationPreferences(this.notifForm.getRawValue()).subscribe({
      next: () => {
        this.message.set('Notification preferences updated.');
        this.savingNotif.set(false);
      },
      error: (err: unknown) => {
        this.error.set(extractApiError(err));
        this.savingNotif.set(false);
      },
    });
  }

  protected addCitizenship(): void {
    this.clearFlash();
    this.citizenshipForm.markAllAsTouched();
    if (this.citizenshipForm.invalid || this.addingCitizenship()) {
      return;
    }

    this.addingCitizenship.set(true);
    const raw = this.citizenshipForm.getRawValue();

    this.userApi
      .addCitizenship({
        country_code: raw.country_code.toUpperCase(),
        is_primary: raw.is_primary,
      })
      .subscribe({
        next: () => {
          this.citizenshipForm.reset({ country_code: '', is_primary: false });
          this.citizenshipCountry.set(null);
          this.reloadCitizenships();
          this.message.set('Citizenship added.');
          this.addingCitizenship.set(false);
        },
        error: (err: unknown) => {
          this.error.set(extractApiError(err));
          this.addingCitizenship.set(false);
        },
      });
  }

  protected setPrimary(citizenship: UserCitizenship): void {
    this.clearFlash();
    this.userApi.updateCitizenship(citizenship.id, { is_primary: true }).subscribe({
      next: () => {
        this.reloadCitizenships();
        this.message.set('Primary citizenship updated.');
      },
      error: (err: unknown) => this.error.set(extractApiError(err)),
    });
  }

  protected removeCitizenship(citizenship: UserCitizenship): void {
    this.clearFlash();
    this.userApi.deleteCitizenship(citizenship.id).subscribe({
      next: () => {
        this.reloadCitizenships();
        this.message.set('Citizenship removed.');
      },
      error: (err: unknown) => this.error.set(extractApiError(err)),
    });
  }

  protected toggleConsent(consent: UserConsent): void {
    this.clearFlash();
    this.userApi
      .updateConsent(consent.consent_type, { is_granted: !consent.is_granted })
      .subscribe({
        next: (updated) => {
          this.consents.update((items) =>
            items.map((item) => (item.consent_type === updated.consent_type ? updated : item)),
          );
          this.message.set('Consent updated.');
        },
        error: (err: unknown) => this.error.set(extractApiError(err)),
      });
  }

  protected changePassword(): void {
    this.clearFlash();
    this.passwordForm.markAllAsTouched();
    const raw = this.passwordForm.getRawValue();

    if (this.savingPassword()) {
      return;
    }

    if (raw.password !== raw.password_confirmation) {
      this.error.set('Passwords do not match.');
      return;
    }

    if (this.passwordForm.invalid) {
      this.error.set('Please fill in your current and new password (min. 8 characters).');
      return;
    }

    this.savingPassword.set(true);
    this.auth.changePassword(raw).subscribe({
      next: (response) => {
        this.passwordForm.reset({
          current_password: '',
          password: '',
          password_confirmation: '',
        });
        this.message.set(response.message || 'Password updated.');
        this.savingPassword.set(false);
      },
      error: (err: unknown) => {
        this.error.set(extractApiError(err));
        this.savingPassword.set(false);
      },
    });
  }

  protected consentLabel(type: UserConsent['consent_type']): string {
    switch (type) {
      case 'marketing':
        return 'Marketing emails';
      case 'terms_of_service':
        return 'Terms of service';
      case 'privacy_policy':
        return 'Privacy policy';
      default:
        return type;
    }
  }

  private reloadCitizenships(): void {
    this.userApi.listCitizenships().subscribe({
      next: (items) => this.citizenships.set(items),
    });
  }

  private clearFlash(): void {
    this.message.set(null);
    this.error.set(null);
  }

  private revokePhotoPreview(): void {
    const preview = this.photoPreview();
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    this.photoPreview.set(null);
  }
}
