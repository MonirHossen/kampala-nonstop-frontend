import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
  type AbstractControl,
} from '@angular/forms';
import { LucideArrowRight, LucideLoaderCircle } from '@lucide/angular';
import { DEFAULT_COUNTRY, type Country } from '../core/lib/countries';
import { collectTracking } from '../core/lib/tracking';
import { DuplicateEmailError, WaitlistService } from '../core/services/waitlist.service';
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
    LucideLoaderCircle,
  ],
  template: `
    @if (status() === 'success') {
      <div class="reveal reveal-in border border-primary/35 bg-paper p-8 sm:p-12">
        <p class="eyebrow text-primary">Waitlist confirmed</p>
        <h3 class="display-lg mt-4 text-foreground">You're on the list.</h3>
        <p class="mt-4 max-w-md text-[1.02rem] leading-relaxed text-muted-foreground">
          We'll be in touch when Kampala Nonstop is ready to welcome you.
        </p>
        <div class="mt-8 border-t border-hairline pt-6">
          <p class="text-sm text-muted-foreground">
            Registered as
            <span class="text-foreground">{{ submitted().name }}</span>
            &middot; {{ submitted().email }} &middot; {{ submitted().country }}
          </p>
          @if (submitted().interests.length > 0) {
            <p class="mt-2 text-sm text-muted-foreground">
              Interests: <span class="text-foreground">{{ submitted().interests.join(', ') }}</span>
            </p>
          }
        </div>
      </div>
    } @else if (disabled()) {
      <div class="border border-hairline bg-paper p-8 sm:p-12">
        <p class="eyebrow text-clay">Waitlist paused</p>
        <h3 class="font-display mt-3 text-2xl text-foreground">We're at capacity right now.</h3>
        <p class="mt-3 max-w-md text-muted-foreground">
          Registrations are temporarily closed. Follow us for the next opening.
        </p>
      </div>
    } @else {
      <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="bg-paper p-6 sm:p-10 lg:p-12">
        <div class="grid gap-6 sm:grid-cols-2 sm:gap-7">
          <div>
            <label for="firstName" class="eyebrow block text-muted-foreground">First name</label>
            <div class="mt-2">
              <input
                id="firstName"
                formControlName="firstName"
                autocomplete="given-name"
                maxlength="80"
                placeholder="Aisha"
                [class]="inputClass(form.controls.firstName)"
              />
            </div>
            @if (errorFor(form.controls.firstName, 'first name'); as message) {
              <p class="mt-2 text-xs text-destructive" role="alert">{{ message }}</p>
            }
          </div>

          <div>
            <label for="surname" class="eyebrow block text-muted-foreground">Surname</label>
            <div class="mt-2">
              <input
                id="surname"
                formControlName="surname"
                autocomplete="family-name"
                maxlength="80"
                placeholder="Nakato"
                [class]="inputClass(form.controls.surname)"
              />
            </div>
            @if (errorFor(form.controls.surname, 'surname'); as message) {
              <p class="mt-2 text-xs text-destructive" role="alert">{{ message }}</p>
            }
          </div>

          <div class="sm:col-span-2">
            <label for="email" class="eyebrow block text-muted-foreground">Email address</label>
            <div class="mt-2">
              <input
                id="email"
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
            <label class="eyebrow block text-muted-foreground">Country</label>
            <div class="mt-2">
              <kn-country-selector [value]="country()" (changed)="country.set($event)" />
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
                By selecting this, you agree to receive updates from Kampala Nonstop about new
                experiences, travel inspiration and offers. You can unsubscribe at any time.
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

        <p class="mt-4 text-center text-xs text-muted-foreground">
          No spam. Just Kampala, when we're ready.
        </p>
      </form>
    }
  `,
})
export class WaitlistFormComponent {
  readonly disabled = input(false);

  private readonly waitlist = inject(WaitlistService);
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(80)]],
    surname: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
  });

  protected readonly country = signal<Country>(DEFAULT_COUNTRY);
  protected readonly interests = signal<string[]>([]);
  protected readonly optIn = signal(true);
  protected readonly status = signal<'idle' | 'loading' | 'success'>('idle');
  protected readonly formError = signal<string | null>(null);
  protected readonly submitted = signal<{
    name: string;
    email: string;
    country: string;
    interests: string[];
  }>({ name: '', email: '', country: '', interests: [] });

  protected toggleInterest(interest: string): void {
    this.interests.update((list) =>
      list.includes(interest) ? list.filter((i) => i !== interest) : [...list, interest],
    );
  }

  protected async onSubmit(): Promise<void> {
    if (this.status() === 'loading' || this.status() === 'success') return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { firstName, surname, email } = this.form.getRawValue();
    const country = this.country();
    const interests = this.interests();

    this.formError.set(null);
    this.status.set('loading');

    try {
      await this.waitlist.create({
        firstName: firstName.trim(),
        surname: surname.trim(),
        email: email.trim(),
        countryName: country.name,
        countryCode: country.code,
        dialCode: country.dial,
        interests,
        marketingOptIn: this.optIn(),
        tracking: collectTracking(),
      });
      this.submitted.set({
        name: `${firstName.trim()} ${surname.trim()}`,
        email: email.trim(),
        country: country.name,
        interests,
      });
      this.status.set('success');
    } catch (error) {
      this.status.set('idle');
      this.formError.set(
        error instanceof DuplicateEmailError
          ? "This email is already on the waitlist — you're in."
          : "We couldn't save your details just now. Please try again in a moment.",
      );
    }
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
