import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
  type AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { LucideArrowRight, LucideLoaderCircle, LucideSend, LucideUsers } from '@lucide/angular';
import { DEFAULT_COUNTRY, type Country } from '../core/lib/countries';
import { interestName } from '../core/lib/interests';
import { collectTracking, type TrackingPayload } from '../core/lib/tracking';
import { DuplicateEmailError } from '../core/services/waitlist.service';
import { WaitlistApiService } from '../core/services/waitlist-api.service';
import { CountrySelectorComponent } from './country-selector.component';
import { InterestSelectorComponent } from './interest-selector.component';

@Component({
  selector: 'kn-waitlist-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CountrySelectorComponent,
    InterestSelectorComponent,
    LucideArrowRight,
    LucideSend,
    LucideLoaderCircle,
    LucideUsers,
  ],
  template: `
    @if (disabled()) {
      <div
        class="p-8 sm:p-12"
        [class]="variant() === 'join' ? 'kn-join-card' : 'border border-hairline bg-paper'"
      >
        <p class="eyebrow text-clay">Waitlist paused</p>
        <h3 class="mt-3 font-display text-2xl text-foreground">We&rsquo;re at capacity right now.</h3>
        <p class="mt-3 max-w-md text-muted-foreground">
          Registrations are temporarily closed. Follow us for the next opening.
        </p>
      </div>
    } @else if (variant() === 'join') {
      <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="kn-join-card overflow-hidden">
        <input type="hidden" name="source" [value]="sourceParam() ?? ''" />
        <input type="hidden" name="countries_of_interest" value='["UG"]' />

        <div class="border-b border-hairline px-5 py-5 sm:px-8 sm:py-6">
          <div class="flex items-start gap-3">
            <span
              class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center bg-primary/12 text-primary"
            >
              <svg lucideUsers class="h-[1.15rem] w-[1.15rem]"></svg>
            </span>
            <div>
              <h2 class="font-display text-[1.25rem] leading-tight text-foreground sm:text-[1.4rem]">
                Tell us a little about you
              </h2>
              <p class="mt-1 text-[0.9rem] leading-relaxed text-muted-foreground">
                Your details and interests help us shape the experience around you.
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-6 px-5 py-6 sm:space-y-7 sm:px-8 sm:py-7">
          <div class="grid gap-4 xl:grid-cols-4">
            <div>
              <label for="firstName" class="kn-join-label">First name</label>
              <input
                id="firstName"
                formControlName="firstName"
                autocomplete="given-name"
                maxlength="80"
                [class]="boxedInputClass(form.controls.firstName)"
              />
              @if (errorFor(form.controls.firstName, 'first name'); as message) {
                <p class="mt-1 text-xs text-destructive" role="alert">{{ message }}</p>
              }
            </div>

            <div>
              <label for="surname" class="kn-join-label">Surname</label>
              <input
                id="surname"
                formControlName="surname"
                autocomplete="family-name"
                maxlength="80"
                [class]="boxedInputClass(form.controls.surname)"
              />
              @if (errorFor(form.controls.surname, 'surname'); as message) {
                <p class="mt-1 text-xs text-destructive" role="alert">{{ message }}</p>
              }
            </div>

            <div>
              <label for="email" class="kn-join-label">Email address</label>
              <input
                id="email"
                type="email"
                inputmode="email"
                formControlName="email"
                autocomplete="email"
                maxlength="255"
                placeholder="Enter your email address"
                [class]="boxedInputClass(form.controls.email)"
              />
              @if (errorFor(form.controls.email, 'email address'); as message) {
                <p class="mt-1 text-xs text-destructive" role="alert">{{ message }}</p>
              }
            </div>

            <div>
              <label class="kn-join-label">Country of residence</label>
              <kn-country-selector
                variant="boxed"
                label="Country of residence"
                [value]="country()"
                (changed)="country.set($event)"
              />
            </div>
          </div>

          <kn-interest-selector
            variant="join"
            [selected]="interests()"
            (toggle)="toggleInterest($event)"
          />

          <div
            class="flex flex-col gap-5 border-t border-hairline pt-5 lg:flex-row lg:items-start lg:justify-between"
          >
            <button
              type="button"
              role="switch"
              [attr.aria-checked]="optIn()"
              (click)="optIn.set(!optIn())"
              class="flex max-w-xl items-start gap-3 text-left"
            >
              <span
                class="relative mt-0.5 inline-flex h-[1.65rem] w-[2.65rem] shrink-0 rounded-full transition-colors"
                [class]="optIn() ? 'bg-primary' : 'bg-[#d6d3d1]'"
              >
                <span
                  class="absolute top-[2px] h-[1.35rem] w-[1.35rem] rounded-full bg-white shadow transition-transform"
                  [class]="optIn() ? 'translate-x-[1.15rem]' : 'translate-x-[2px]'"
                ></span>
              </span>
              <span>
                <span class="block text-[0.88rem] font-semibold text-foreground">
                  Yes, keep me updated
                </span>
                <span class="mt-1 block text-[0.72rem] leading-relaxed text-muted-foreground">
                  You will only receive updates about latest experiences, travel inspirations and
                  offers.
                </span>
              </span>
            </button>

            <div class="w-full shrink-0 lg:w-[15.5rem]">
              <button
                type="submit"
                [disabled]="status() === 'loading'"
                class="eyebrow flex h-12 w-full items-center justify-center gap-2 bg-primary text-primary-foreground transition-colors hover:bg-clay disabled:opacity-70"
              >
                @if (status() === 'loading') {
                  <svg lucideLoaderCircle class="h-4 w-4 animate-spin"></svg>
                  Joining&hellip;
                } @else {
                  <svg lucideSend class="h-3.5 w-3.5"></svg>
                  Join the Waitlist
                }
              </button>
              <p class="mt-1.5 text-center text-[0.68rem] text-muted-foreground">
                We respect your privacy. You can unsubscribe at any time.
              </p>
            </div>
          </div>

          @if (formError()) {
            <p
              role="alert"
              class="border-l-2 border-destructive bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {{ formError() }}
            </p>
          }
        </div>
      </form>
    } @else {
      <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="bg-paper p-6 sm:p-10 lg:p-12">
        <div class="grid gap-6 sm:grid-cols-2 sm:gap-7">
          <div>
            <label for="firstNameDefault" class="eyebrow block text-muted-foreground">First name</label>
            <div class="mt-2">
              <input
                id="firstNameDefault"
                formControlName="firstName"
                autocomplete="given-name"
                maxlength="80"
                [class]="inputClass(form.controls.firstName)"
              />
            </div>
            @if (errorFor(form.controls.firstName, 'first name'); as message) {
              <p class="mt-2 text-xs text-destructive" role="alert">{{ message }}</p>
            }
          </div>

          <div>
            <label for="surnameDefault" class="eyebrow block text-muted-foreground">Surname</label>
            <div class="mt-2">
              <input
                id="surnameDefault"
                formControlName="surname"
                autocomplete="family-name"
                maxlength="80"
                [class]="inputClass(form.controls.surname)"
              />
            </div>
            @if (errorFor(form.controls.surname, 'surname'); as message) {
              <p class="mt-2 text-xs text-destructive" role="alert">{{ message }}</p>
            }
          </div>

          <div class="sm:col-span-2">
            <label for="emailDefault" class="eyebrow block text-muted-foreground">Email address</label>
            <div class="mt-2">
              <input
                id="emailDefault"
                type="email"
                inputmode="email"
                formControlName="email"
                autocomplete="email"
                maxlength="255"
                placeholder="you@example.com"
                [class]="inputClass(form.controls.email)"
              />
            </div>
            @if (errorFor(form.controls.email, 'email address'); as message) {
              <p class="mt-2 text-xs text-destructive" role="alert">{{ message }}</p>
            }
          </div>

          <div class="sm:col-span-2">
            <label class="eyebrow block text-muted-foreground">Country of residence</label>
            <div class="mt-2">
              <kn-country-selector
                label="Country of residence"
                [value]="country()"
                (changed)="country.set($event)"
              />
            </div>
          </div>
        </div>

        <div class="mt-11 border-t border-hairline pt-9">
          <kn-interest-selector [selected]="interests()" (toggle)="toggleInterest($event)" />
        </div>

        <div class="mt-11 border-t border-hairline pt-8">
          <label class="flex cursor-pointer items-start gap-3.5">
            <input
              type="checkbox"
              [checked]="optIn()"
              (change)="optIn.set(checkboxValue($event))"
              class="mt-0.5 h-5 w-5 shrink-0 accent-[oklch(0.615_0.185_42)]"
            />
            <span>
              <span class="block text-[0.98rem] font-semibold text-foreground">
                Yes, keep me updated
              </span>
              <span class="mt-1.5 block text-[0.8rem] leading-relaxed text-muted-foreground">
                You will only receive updates about latest experiences, travel inspirations and
                offers.
              </span>
            </span>
          </label>
        </div>

        @if (formError()) {
          <p
            role="alert"
            class="mt-6 border-l-2 border-destructive bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {{ formError() }}
          </p>
        }

        <button
          type="submit"
          [disabled]="status() === 'loading'"
          class="eyebrow mt-9 flex w-full items-center justify-center gap-2.5 bg-primary px-8 py-5 text-primary-foreground transition-all duration-300 hover:bg-clay disabled:opacity-70"
        >
          @if (status() === 'loading') {
            <svg lucideLoaderCircle class="h-4 w-4 animate-spin"></svg>
            Joining&hellip;
          } @else {
            Join the Waitlist
            <svg lucideArrowRight class="h-4 w-4"></svg>
          }
        </button>
      </form>
    }
  `,
  styles: `
    .kn-join-card {
      border: 1px solid color-mix(in oklch, var(--hairline) 90%, transparent);
      background: var(--paper);
      box-shadow: 0 24px 48px -28px color-mix(in oklch, var(--ink) 35%, transparent);
    }

    .kn-join-label {
      display: block;
      margin-bottom: 0.4rem;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--muted-foreground);
    }
  `,
})
export class WaitlistFormComponent implements OnInit {
  readonly disabled = input(false);
  readonly variant = input<'default' | 'join'>('default');
  readonly sourceParam = input<string | null>(null);

  private readonly waitlistApi = inject(WaitlistApiService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(80)]],
    surname: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
  });

  protected readonly country = signal<Country>(DEFAULT_COUNTRY);
  protected readonly interests = signal<string[]>([]);
  protected readonly optIn = signal(true);
  protected readonly status = signal<'idle' | 'loading'>('idle');
  protected readonly formError = signal<string | null>(null);
  protected readonly tracking = signal<TrackingPayload | null>(null);

  ngOnInit(): void {
    if (this.variant() === 'join') {
      this.tracking.set(collectTracking());
    }
  }

  protected toggleInterest(code: string): void {
    this.interests.update((list) =>
      list.includes(code) ? list.filter((i) => i !== code) : [...list, code],
    );
  }

  protected async onSubmit(): Promise<void> {
    if (this.status() === 'loading') return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { firstName, surname, email } = this.form.getRawValue();
    const country = this.country();
    const interestCodes = this.interests();

    this.formError.set(null);
    this.status.set('loading');

    try {
      const result = await this.waitlistApi.join({
        firstName: firstName.trim(),
        surname: surname.trim(),
        email: email.trim(),
        countryCode: country.code,
        interestCodes,
        marketingConsent: this.optIn(),
        acquisitionSourceCode: this.sourceParam()?.trim() || undefined,
      });

      this.waitlistApi.rememberInviter({
        id: result.id,
        firstName: result.first_name,
        surname: result.surname,
        email: result.email,
      });

      await this.router.navigate(['/waitlist/invite'], {
        state: {
          inviter: {
            id: result.id,
            firstName: result.first_name,
            surname: result.surname,
            email: result.email,
          },
          interests: interestCodes.map((code) =>
            interestName(code, this.waitlistApi.interestTypes()),
          ),
          country: country.name,
        },
      });
    } catch (error) {
      this.status.set('idle');
      this.formError.set(
        error instanceof DuplicateEmailError
          ? "This email is already on the waitlist — you're in."
          : "We couldn't save your details just now. Please try again in a moment.",
      );
    }
  }

  protected boxedInputClass(control: AbstractControl): string {
    const base =
      'h-11 w-full border bg-paper px-3 text-[0.9rem] outline-none transition-colors placeholder:text-muted-foreground/60';
    return this.showError(control)
      ? `${base} border-destructive ring-2 ring-destructive/15`
      : `${base} border-input focus:border-primary focus:ring-2 focus:ring-primary/15`;
  }

  protected inputClass(control: AbstractControl): string {
    const base =
      'h-13 w-full border-b bg-transparent py-3 text-[1rem] outline-none transition-colors placeholder:text-muted-foreground/60';
    return this.showError(control)
      ? `${base} border-destructive`
      : `${base} border-input focus:border-primary hover:border-foreground`;
  }

  protected errorFor(control: FormControl<string>, label: string): string | null {
    if (!this.showError(control)) return null;
    if (control.hasError('required')) return `Please enter your ${label}`;
    if (control.hasError('email')) return 'Enter a valid email address';
    if (control.hasError('maxlength')) return 'Too long';
    return null;
  }

  protected checkboxValue(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }

  private showError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || control.dirty);
  }
}
